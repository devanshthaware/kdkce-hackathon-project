"use client"

import { PricingCard } from "@/components/membership/PricingCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const PLANS = [
    {
        title: "Starter",
        price: "$0",
        description: "Perfect for for small projects and side hustles.",
        features: ["1,000 API Events", "Basic Risk Scoring", "Community Support", "Email Alerts"],
    },
    {
        title: "Pro",
        price: "$49",
        description: "Advanced protection for growing applications.",
        highlighted: true,
        features: [
            "50,000 API Events",
            "ML-Enhanced Models",
            "Continuous Monitoring",
            "Custom Risk Policies",
            "Priority Support",
        ],
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Dynamic security for large scale enterprises.",
        features: [
            "Unlimited API Events",
            "Custom ML Training",
            "White-labeled SDK",
            "SLA Guarantees",
            "Dedicated CSM",
        ],
    },
]

const COMPARISON = [
    { feature: "API Events", starter: "1,000", pro: "50,000", enterprise: "Unlimited" },
    { feature: "ML Models", starter: "Standard", pro: "Advanced", enterprise: "Custom" },
    { feature: "Support", starter: "Email", pro: "Priority", enterprise: "Dedicated" },
    { feature: "Custom Policies", starter: "❌", pro: "✅", enterprise: "✅" },
    { feature: "White-labeling", starter: "❌", pro: "❌", enterprise: "✅" },
]

export default function MembershipPage() {
    return (
        <div className="flex flex-col gap-10 max-w-6xl mx-auto py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Membership & Billing</h1>
                    <p className="text-muted-foreground mt-2">Manage your subscription, usage, and billing preferences.</p>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                    Current Plan: Pro
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {PLANS.map((plan) => (
                    <PricingCard key={plan.title} {...plan} />
                ))}
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold">API Usage</h2>
                <div className="rounded-xl border border-border/50 bg-card/30 p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Monthly API Events</span>
                        <span className="font-mono font-bold">32,451 / 50,000</span>
                    </div>
                    <Progress value={65} className="h-2 bg-secondary" />
                    <p className="text-xs text-muted-foreground italic">You have used 65% of your Pro plan monthly quota.</p>
                </div>
            </div>

            <div className="space-y-6 pb-10">
                <h2 className="text-xl font-bold">Feature Comparison</h2>
                <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Feature</TableHead>
                                <TableHead>Starter</TableHead>
                                <TableHead>Pro</TableHead>
                                <TableHead>Enterprise</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {COMPARISON.map((row) => (
                                <TableRow key={row.feature}>
                                    <TableCell className="font-medium">{row.feature}</TableCell>
                                    <TableCell>{row.starter}</TableCell>
                                    <TableCell>{row.pro}</TableCell>
                                    <TableCell>{row.enterprise}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
