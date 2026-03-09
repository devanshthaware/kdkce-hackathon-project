import { useEffect, useState } from "react";
import { useRiskContext } from "@/lib/riskContext";
import { DEMO_PROJECT } from "@/lib/demoConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, ShieldCheck, Cpu, HardDrive, ChevronDown, UserCog, AlertCircle } from "lucide-react";
import { checkBackendHealth, type HealthStatus } from "@/lib/health";

function maskKey(key: string): string {
  if (!key || key.length < 12) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

export default function PlatformStatusBar() {
  const { sessionId } = useRiskContext();
  const [health, setHealth] = useState<HealthStatus>({
    status: "offline",
    modelsLoaded: false,
    message: "Initializing..."
  });

  useEffect(() => {
    const updateHealth = async () => {
      const status = await checkBackendHealth();
      setHealth(status);
    };
    updateHealth();
    const interval = setInterval(updateHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (health.status === "healthy") return <ShieldCheck className="size-4 text-green-500" />;
    if (health.status === "unhealthy") return <AlertCircle className="size-4 text-amber-500" />;
    return <AlertCircle className="size-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (health.status === "healthy") return "Healthy";
    if (health.status === "unhealthy") return "Degraded";
    return "Offline";
  };

  return (
    <Card className="bg-card/50 border-border/50 shadow-none">
      <CardContent className="flex flex-wrap items-center gap-6 py-4 px-6 text-sm">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Project</span>
          <span className="font-mono text-foreground font-semibold uppercase">{DEMO_PROJECT.projectId}</span>
        </div>

        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">API Key</span>
          <span className="font-mono text-foreground font-semibold px-2 py-0.5 bg-muted rounded border border-border">
            {maskKey(DEMO_PROJECT.apiKey)}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Globe className="size-4 text-primary" />
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
            Enterprise Support
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:text-primary transition-colors">
            {getStatusIcon()}
            <span className="font-bold">{getStatusText()}</span>
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center justify-between">
              Core API Status
              <div className={cn(
                "size-1.5 rounded-full",
                health.status === "healthy" ? "bg-green-500" : "bg-red-500"
              )} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center justify-between">
              Risk Engine
              <div className={cn(
                "size-2 rounded-full",
                health.status === "healthy" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
              )} />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between">
              ML Inference
              <div className={cn(
                "size-2 rounded-full",
                health.modelsLoaded ? "bg-green-500" : "bg-red-500"
              )} />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center justify-between">
              Context SDK
              <div className="size-2 rounded-full bg-green-500" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin" className="flex items-center gap-2 w-full">
                <UserCog className="size-3" /> Admin Terminal
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[10px] text-muted-foreground font-mono">
              SID: {sessionId ? String(sessionId).slice(-12) : 'OFFLINE'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[10px] text-muted-foreground font-mono uppercase bg-muted/50 mt-1">
              {health.message}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
