"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import type { RiskResponse } from "@aegis/auth-sdk";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { checkBackendHealth, type HealthStatus } from "@/lib/health";

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

export function RiskProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [risk, setRiskState] = useState<RiskResponse | null>(null);
  const [riskHistory, setRiskHistory] = useState<RiskTimelinePoint[]>([]);
  const [logs, setLogs] = useState<ThreatLogEntry[]>([]);
  const [alertLevel, setAlertLevel] = useState<"HIGH" | "CRITICAL" | null>(null);
  const [isLocked, setLocked] = useState(false);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<number | null>(
    null
  );

  const [applicationId, setApplicationId] = useState<any>(null);
  const [sessionId, setSessionId] = useState<any>(null);

  const getOrCreateApp = useMutation(api.applications.getOrCreateDemoApp);
  const createSession = useMutation(api.sessions.createSession);

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

  const setRisk = useCallback((r: RiskResponse | null) => {
    setRiskState(r);
  }, []);

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
      applicationId
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
      applicationId
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
