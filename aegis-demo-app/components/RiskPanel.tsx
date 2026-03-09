"use client";

import { useRiskContext } from "@/lib/riskContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const RISK_MESSAGES: Record<string, string> = {
  LOW: "Stable environment, secure session",
  MEDIUM: "Minor policy drift detected",
  HIGH: "Critical security violation likely",
  CRITICAL: "Unauthorized access blocked",
};

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 45, damping: 15 });
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function RiskPanel() {
  const { risk } = useRiskContext();
  const score = risk ? Math.round(risk.risk_score * 100) : 20;
  const level = risk?.risk_level ?? "LOW";
  const message = RISK_MESSAGES[level] ?? "Initializing Risk Engine...";

  const levelStyles = {
    LOW: "bg-green-500/10 text-green-500 border-green-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
  };

  const badgeColor = levelStyles[level as keyof typeof levelStyles] || levelStyles.LOW;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground p-0 m-0">Live Risk Index</CardTitle>
          <Badge variant="outline" className={cn("px-2 py-0 h-5 font-bold text-[10px]", badgeColor)}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-7xl font-black tracking-tighter tabular-nums",
            level === "CRITICAL" ? "text-red-500" :
              level === "HIGH" ? "text-orange-500" :
                level === "MEDIUM" ? "text-yellow-500" : "text-foreground"
          )}>
            <AnimatedNumber value={score} />
          </span>
          <span className="text-2xl font-bold text-muted-foreground">%</span>
        </div>
        <CardDescription className="text-foreground font-medium flex items-center gap-2">
          <span className={cn("size-2 rounded-full",
            level === "CRITICAL" ? "bg-red-500" :
              level === "HIGH" ? "bg-orange-500" :
                level === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"
          )} />
          {message}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
