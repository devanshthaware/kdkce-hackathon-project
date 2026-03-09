"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import type { RiskResponse } from "@aegis/auth-sdk";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { checkBackendHealth, type HealthStatus } from "@/lib/health";
import { aegisClient } from "@/lib/sdk";


export type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY";

export interface ThreatLogEntry {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
}

export interface RiskTimelinePoint {
  t: number;
  score: number;
  level: RiskResponse["risk_level"];
}

interface PolicyThresholds {
  high: number;    // 0-1 fraction
  critical: number;
}

interface RiskContextValue {
  risk: RiskResponse | null;
  setRisk: (r: RiskResponse | null) => void;
  addRiskToTimeline: (r: RiskResponse) => void;
  riskHistory: RiskTimelinePoint[];
  logs: ThreatLogEntry[];
  addLog: (level: LogLevel, message: string) => void;
  alertLevel: "HIGH" | "CRITICAL" | null;
  setAlertLevel: (level: "HIGH" | "CRITICAL" | null) => void;
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  lastEvaluationTime: number | null;
  setLastEvaluationTime: (t: number | null) => void;
  sessionId: string | null;
  applicationId: string | null;
  activePolicy: { name: string; thresholds: PolicyThresholds } | null;
  isMfaRequired: boolean;
  setMfaRequired: (v: boolean) => void;
}

const RiskContext = createContext<RiskContextValue | null>(null);

const MAX_TIMELINE = 20;
const MAX_LOGS = 100;

function nowTime(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Parse a threshold value from Convex – stored as strings like "0.8" or "61-85" */
function parseThreshold(raw: string): number {
  const num = parseFloat(raw.split("-")[0]);
  // If stored as 0–100 scale convert to 0–1
  return num > 1 ? num / 100 : num;
}

export function RiskProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [risk, setRiskState] = useState<RiskResponse | null>(null);
  const [riskHistory, setRiskHistory] = useState<RiskTimelinePoint[]>([]);
  const [logs, setLogs] = useState<ThreatLogEntry[]>([]);
  const [alertLevel, setAlertLevel] = useState<"HIGH" | "CRITICAL" | null>(null);
  const [isLocked, setLocked] = useState(false);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<number | null>(null);
  const [isMfaRequired, setMfaRequired] = useState(false);

  const [applicationId, setApplicationId] = useState<any>(null);
  const [sessionId, setSessionId] = useState<any>(null);

  const getOrCreateApp = useMutation(api.applications.getOrCreateDemoApp);
  const createSession = useMutation(api.sessions.createSession);

  // === Live Risk Policy Sync ===
  const allPolicies = useQuery(api.riskPolicies.list);
  const prevPolicyRef = useRef<string | null>(null);

  // Pick the first available policy as the "active" one
  const rawPolicy = allPolicies?.[0] ?? null;
  const activePolicy = rawPolicy
    ? {
        name: rawPolicy.name,
        thresholds: {
          high: parseThreshold(rawPolicy.thresholds.high),
          critical: parseThreshold(rawPolicy.thresholds.critical),
        },
      }
    : { name: "Default Policy", thresholds: { high: 0.6, critical: 0.85 } };

  // Real-time sync: Fetch session status from Convex if we have a sessionId
  const serverSession = useQuery(api.sessions.list, sessionId ? { applicationId } : "skip" as any);
  const currentServerSession = serverSession?.find(s => s._id === sessionId);

  useEffect(() => {
    if (isLoaded && user) {
      getOrCreateApp().then(app => {
        if (!app) return;
        setApplicationId(app._id);
        // Create a session for this demo run
        createSession({
          applicationId: app._id,
          userEmail: user.primaryEmailAddress?.emailAddress || "demo@user.com",
          device: "Demo Device",
          browser: "Chrome (Demo)",
          location: "Virtual Cloud",
          ip: "127.0.0.1",
          riskScore: 0.2,
          status: "safe"
        }).then(id => {
          setSessionId(id);
          addLog("INFO", "Connected to AegisAuth Cloud. Session initialized.");

          // Verify ML Backend Connection
          checkBackendHealth().then((status) => {
            if (status.status === "healthy") {
              addLog("SECURITY", `Verified connection to ML cluster: ${status.message}`);
            } else {
              addLog("WARN", `ML Cluster connection status: ${status.status.toUpperCase()}`);
            }
          });
        });
      });
    }
  }, [isLoaded, user]);

  // === Real-Time Heartbeat: add a risk point every 5s ===
  useEffect(() => {
    if (!isLoaded || !user) return;

    const INTERVAL_MS = 5000;

    const tick = async () => {
      try {
        const result = await aegisClient.checkRisk({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "demo@user.com",
        });
        // Only add to timeline — don't overwrite the current enforced risk state
        setRiskHistory(prev => {
          const point: RiskTimelinePoint = {
            t: result.timestamp ?? Date.now(),
            score: result.risk_score,
            level: result.risk_level,
          };
          const next = [...prev, point];
          return next.length > MAX_TIMELINE ? next.slice(-MAX_TIMELINE) : next;
        });
      } catch {
        // Backend offline: gently fluctuate the current score by ±3%
        setRiskHistory(prev => {
          const base = prev.length > 0 ? prev[prev.length - 1].score : 0.2;
          const delta = (Math.random() - 0.5) * 0.06;
          const score = Math.min(0.99, Math.max(0.02, base + delta));
          const level: RiskTimelinePoint["level"] =
            score >= 0.85 ? "CRITICAL" :
            score >= 0.60 ? "HIGH" :
            score >= 0.35 ? "MEDIUM" : "LOW";
          const point: RiskTimelinePoint = { t: Date.now(), score, level };
          const next = [...prev, point];
          return next.length > MAX_TIMELINE ? next.slice(-MAX_TIMELINE) : next;
        });
      }
    };

    // First tick immediately after mount
    const timeout = setTimeout(tick, 1000);
    const interval = setInterval(tick, INTERVAL_MS);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isLoaded, user]);



  // Sync server state to local state
  useEffect(() => {
    if (currentServerSession) {
      const newRisk: RiskResponse = {
        risk_score: currentServerSession.riskScore,
        risk_level: currentServerSession.status.toUpperCase() as any,
        components: { ml: 1 },
        timestamp: currentServerSession.loginTime
      };
      setRiskState(newRisk);

      // Only add to timeline if it's a new timestamp or score changed
      setRiskHistory((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].score === newRisk.risk_score) return prev;
        const point: RiskTimelinePoint = {
          t: newRisk.timestamp ?? Date.now(),
          score: newRisk.risk_score,
          level: newRisk.risk_level,
        };
        const next = [...prev, point];
        return next.length > MAX_TIMELINE ? next.slice(-MAX_TIMELINE) : next;
      });
    }
  }, [currentServerSession]);

  // Fire a log when the policy changes (real-time sync notification)
  useEffect(() => {
    if (!rawPolicy) return;
    const key = rawPolicy._id + rawPolicy.thresholds.high;
    if (prevPolicyRef.current && prevPolicyRef.current !== key) {
      addLog("SECURITY", `⚡ Policy updated to "${rawPolicy.name}". Thresholds reloaded.`);
    }
    prevPolicyRef.current = key;
  }, [rawPolicy]);

  const setRisk = useCallback((r: RiskResponse | null) => {
    setRiskState(r);
    if (!r) return;

    // === Evaluate Against Live Policy Thresholds ===
    const hi = activePolicy.thresholds.high;
    const crit = activePolicy.thresholds.critical;

    if (r.risk_score >= crit) {
      setAlertLevel("CRITICAL");
      setLocked(true);
      addLog("ERROR", `🔴 CRITICAL threshold exceeded (${(r.risk_score * 100).toFixed(0)}% >= ${(crit * 100).toFixed(0)}%). Session LOCKED.`);
    } else if (r.risk_score >= hi) {
      setAlertLevel("HIGH");
      setMfaRequired(true);
      addLog("WARN", `🟠 HIGH risk flagged by "${activePolicy.name}". MFA challenge triggered.`);
    } else {
      setAlertLevel(null);
      setMfaRequired(false);
    }
    setLastEvaluationTime(Date.now());
  }, [activePolicy]);

  const addRiskToTimeline = useCallback((r: RiskResponse) => {
    const point: RiskTimelinePoint = {
      t: r.timestamp ?? Date.now(),
      score: r.risk_score,
      level: r.risk_level,
    };
    setRiskHistory((prev) => {
      const next = [...prev, point];
      return next.length > MAX_TIMELINE ? next.slice(-MAX_TIMELINE) : next;
    });
  }, []);

  const addLog = useCallback((level: LogLevel, message: string) => {
    const entry: ThreatLogEntry = {
      id: genId(),
      time: nowTime(),
      level,
      message,
    };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
    });
  }, []);

  const value = useMemo<RiskContextValue>(
    () => ({
      risk,
      setRisk,
      addRiskToTimeline,
      riskHistory,
      logs,
      addLog,
      alertLevel,
      setAlertLevel,
      isLocked,
      setLocked,
      lastEvaluationTime,
      setLastEvaluationTime,
      sessionId,
      applicationId,
      activePolicy,
      isMfaRequired,
      setMfaRequired,
    }),
    [
      risk,
      setRisk,
      addRiskToTimeline,
      riskHistory,
      logs,
      addLog,
      alertLevel,
      isLocked,
      lastEvaluationTime,
      sessionId,
      applicationId,
      activePolicy,
      isMfaRequired,
    ]
  );

  return (
    <RiskContext.Provider value={value}>{children}</RiskContext.Provider>
  );
}

export function useRiskContext(): RiskContextValue {
  const ctx = useContext(RiskContext);
  if (!ctx) {
    throw new Error("useRiskContext must be used within RiskProvider");
  }
  return ctx;
}
