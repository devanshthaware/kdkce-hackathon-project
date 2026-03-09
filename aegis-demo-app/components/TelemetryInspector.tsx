"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint } from "lucide-react";

interface TelemetrySnapshot {
  ts: string;
  userAgent: string;
  screenRes: string;
  colorDepth: number;
  timezone: string;
  language: string;
  platform: string;
  touchPoints: number;
  mouseX: number;
  mouseY: number;
  clickCount: number;
  keystrokesPerMin: number;
  connectionType: string;
  onlineStatus: string;
  hardwareConcurrency: number;
  deviceMemory: number | string;
}

export default function TelemetryInspector() {
  const [snap, setSnap] = useState<TelemetrySnapshot | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const clickRef = useRef(0);
  const keystrokeTimestamps = useRef<number[]>([]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onClick = () => { clickRef.current += 1; };
    const onKey = () => { keystrokeTimestamps.current.push(Date.now()); };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    const capture = () => {
      // Calculate keystrokes per minute from last 60s of events
      const now = Date.now();
      keystrokeTimestamps.current = keystrokeTimestamps.current.filter(t => now - t < 60000);
      const kpm = keystrokeTimestamps.current.length;

      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

      setSnap({
        ts: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 60) + "...",
        screenRes: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform || "Unknown",
        touchPoints: navigator.maxTouchPoints,
        mouseX: mouseRef.current.x,
        mouseY: mouseRef.current.y,
        clickCount: clickRef.current,
        keystrokesPerMin: kpm,
        connectionType: conn?.effectiveType ?? "unknown",
        onlineStatus: navigator.onLine ? "ONLINE" : "OFFLINE",
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (nav.deviceMemory as number) ?? "N/A",
      });
    };

    capture();
    const interval = setInterval(capture, 1500);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
      clearInterval(interval);
    };
  }, []);

  const rows: [string, string | number][] = snap
    ? [
        ["timestamp", snap.ts],
        ["screen", snap.screenRes],
        ["color_depth", `${snap.colorDepth}-bit`],
        ["platform", snap.platform],
        ["language", snap.language],
        ["timezone", snap.timezone],
        ["touch_points", snap.touchPoints],
        ["mouse_pos", `(${snap.mouseX}, ${snap.mouseY})`],
        ["click_count", snap.clickCount],
        ["keystrokes_pm", snap.keystrokesPerMin],
        ["connection", snap.connectionType],
        ["hardware_cores", snap.hardwareConcurrency],
        ["device_memory_gb", snap.deviceMemory],
        ["online_status", snap.onlineStatus],
      ]
    : [];

  return (
    <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Fingerprint className="size-3.5 text-emerald-500" />
            Telemetry Inspector
          </CardTitle>
          <Badge variant="outline" className="text-[9px] font-bold uppercase border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-pulse">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-[11px] space-y-0.5 max-h-72 overflow-y-auto pr-1 scrollbar-none">
          <div className="text-emerald-400/60 mb-2">{"// AegisAuth — active fingerprint collection"}</div>
          {rows.map(([key, val]) => (
            <div key={key} className="flex gap-2 text-slate-400">
              <span className="text-cyan-400/70 shrink-0 w-36">{key}:</span>
              <span className="text-slate-200 truncate">{String(val)}</span>
            </div>
          ))}
          {!snap && (
            <div className="text-slate-600 animate-pulse">Initializing fingerprint engine...</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
