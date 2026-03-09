"use client"

import { CodeBlock } from "@/components/docs/CodeBlock"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const SECTIONS = [
    { id: "installation", title: "Installation" },
    { id: "quick-start", title: "Quick Start" },
    { id: "continuous-monitoring", title: "Continuous Monitoring" },
    { id: "api-reference", title: "API Reference" },
    { id: "response-format", title: "Response Format" },
    { id: "architecture", title: "Architecture" },
    { id: "security", title: "Security & Compliance" },
]

export default function DocsPage() {
    return (
        <div className="flex gap-10 max-w-7xl mx-auto py-6">
            {/* Sidebar Navigation */}
            <aside className="sticky top-6 h-fit w-64 shrink-0 hidden lg:block">
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Documentation</h3>
                    <nav className="flex flex-col gap-1">
                        {SECTIONS.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                            >
                                {section.title}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-16 pb-20 max-w-3xl">
                <section id="introduction" className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight">Introduction</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Welcome to the AegisAuth developer documentation. Our platform provides high-performance security infrastructure for modern web applications, focusing on adaptive risk assessment and continuous threat monitoring.
                    </p>
                </section>

                <section id="installation" className="space-y-4">
                    <h2 className="text-2xl font-bold">Installation</h2>
                    <p className="text-muted-foreground">Get started by installing the AegisAuth SDK in your project.</p>
                    <CodeBlock code="pnpm add @aegis/auth-sdk" />
                </section>

                <section id="quick-start" className="space-y-4">
                    <h2 className="text-2xl font-bold">Quick Start</h2>
                    <p className="text-muted-foreground">Initialize the client and perform your first risk check in minutes.</p>
                    <CodeBlock
                        language="typescript"
                        code={`import { AegisAuth } from "@aegis/auth-sdk";

const aegis = new AegisAuth({
  apiKey: "your_api_key_here",
  endpoint: "https://api.aegisauth.com"
});

// Protect a login attempt
const risk = await aegis.protectLogin({
  userId: "user_123",
  email: "dev@example.com"
});

console.log(risk.risk_level); // "LOW" | "HIGH" | "CRITICAL"`}
                    />
                </section>

                <section id="continuous-monitoring" className="space-y-4">
                    <h2 className="text-2xl font-bold">Continuous Monitoring</h2>
                    <p className="text-muted-foreground">Keep the session secure after login with automated background monitoring.</p>
                    <CodeBlock
                        language="typescript"
                        code={`// Start background monitoring every 5 seconds
aegis.startMonitoring((updatedRisk) => {
  if (updatedRisk.risk_level === "CRITICAL") {
    logoutUser(); // Take immediate action
  }
});`}
                    />
                </section>

                <section id="api-reference" className="space-y-4">
                    <h2 className="text-2xl font-bold">API Reference</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground">new AegisAuth(config)</h3>
                            <p className="text-muted-foreground mb-4 font-medium">Initialize the AegisAuth client with your credentials.</p>
                            <CodeBlock
                                language="typescript"
                                code={`const aegis = new AegisAuth({
  apiKey: string,     // Your project API key
  endpoint?: string   // Optional: Backend endpoint URL
});`}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-foreground">aegis.checkRisk(options)</h3>
                            <p className="text-muted-foreground mb-4 font-medium">Perform a real-time risk evaluation for a specific user or action.</p>
                            <CodeBlock
                                language="typescript"
                                code={`const risk = await aegis.checkRisk({
  userId: string,     // Unique identifier for the user
  email: string,      // User email for context correlation
  metadata?: object   // Optional: Custom telemetry data
});`}
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-foreground">aegis.startMonitoring(callback)</h3>
                            <p className="text-muted-foreground mb-4 font-medium">Enable continuous background session monitoring.</p>
                            <CodeBlock
                                language="typescript"
                                code={`aegis.startMonitoring((risk) => {
  // Callback triggered when risk level changes
  console.log('Update:', risk.risk_level);
});`}
                            />
                        </div>
                    </div>
                </section>

                <section id="response-format" className="space-y-4">
                    <h2 className="text-2xl font-bold">Risk Response Format</h2>
                    <p className="text-muted-foreground">Detailed breakdown of the AegisAuth risk object returned by our ML engine.</p>
                    <CodeBlock
                        language="json"
                        code={`{
  "risk_score": 0.18,      // Normalized float [0-1]
  "risk_level": "LOW",     // LOW | MEDIUM | HIGH | CRITICAL
  "components": {          // Weighted contribution scores
    "login_anomaly": 0.05,
    "device_trust": 0.1,
    "session_drift": 0.03
  },
  "timestamp": 1708500000
}`}
                    />
                </section>

                <section id="architecture" className="space-y-4">
                    <h2 className="text-2xl font-bold">Architecture</h2>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                        AegisAuth operates as a distributed multi-layered security mesh between your application and identity providers.
                        Telemetry is collected via the SDK, analyzed by our global GPU-accelerated ML cluster, and compared against your
                        custom risk policies in under 50ms (latency overhead).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                            <h4 className="font-bold text-white mb-2">Layer 1: Context</h4>
                            <p className="text-xs text-slate-400">Hardware fingerprinting, network velocity, and IP reputation analysis.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5">
                            <h4 className="font-bold text-white mb-2">Layer 2: ML Engine</h4>
                            <p className="text-xs text-slate-400">Probabilistic behavioral modeling using advanced recurrent neural networks.</p>
                        </div>
                    </div>
                </section>

                <section id="security" className="space-y-4">
                    <h2 className="text-2xl font-bold">Security & Compliance</h2>
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-emerald-400 uppercase tracking-tighter">Certifications</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">SOC2 TYPE II</span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">ISO 27001</span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">GDPR COMPLIANT</span>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">HIPAA ELIGIBLE</span>
                            </div>
                        </div>

                        <div className="space-y-4 pr-10">
                            <div className="space-y-1">
                                <h4 className="font-bold text-white">Data Encryption</h4>
                                <p className="text-sm text-slate-400">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 with project-specific CMK rotation.</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-white">Privacy First</h4>
                                <p className="text-sm text-slate-400">AegisAuth uses PII-blind telemetry. We do not store sensitive user data; instead, we generate cryptographic hashes for user correlation.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
