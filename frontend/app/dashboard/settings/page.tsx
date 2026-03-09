"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Plus, Key, Plug, Check } from "lucide-react"

interface ApiKey {
  name: string
  prefix: string
  created: string
  status: "Active" | "Revoked"
}

interface Integration {
  name: string
  description: string
  connected: boolean
}

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("AegisAuth Inc.")
  const [orgEmail, setOrgEmail] = useState("admin@aegisauth.io")
  const [timezone, setTimezone] = useState("UTC")
  const [saved, setSaved] = useState(false)

  const [securitySettings, setSecuritySettings] = useState({
    mfa: true,
    riskStepUp: true,
    autoBlock: false,
    sessionRecording: true,
    ipAllowlist: false,
  })

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { name: "Production Key", prefix: "ak_live_", created: "Dec 15, 2025", status: "Active" },
    { name: "Staging Key", prefix: "ak_test_", created: "Jan 8, 2026", status: "Active" },
    { name: "Development Key", prefix: "ak_dev_", created: "Feb 1, 2026", status: "Revoked" },
  ])

  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: "Slack", description: "Real-time security alerts in Slack channels", connected: true },
    { name: "PagerDuty", description: "Incident escalation for critical events", connected: true },
    { name: "Datadog", description: "Export risk metrics and monitoring data", connected: false },
    { name: "Splunk", description: "SIEM integration for security logs", connected: false },
    { name: "Okta", description: "SSO and identity provider federation", connected: true },
    { name: "AWS CloudWatch", description: "Cloud infrastructure monitoring", connected: false },
  ])

  const [generateKeyOpen, setGenerateKeyOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyEnv, setNewKeyEnv] = useState("production")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  function handleSaveGeneral() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleToggleSecurity(key: keyof typeof securitySettings) {
    setSecuritySettings({ ...securitySettings, [key]: !securitySettings[key] })
  }

  function handleGenerateKey() {
    if (!newKeyName.trim()) return
    const prefixMap: Record<string, string> = { production: "ak_live_", staging: "ak_test_", development: "ak_dev_" }
    const randomSuffix = Math.random().toString(36).substring(2, 14)
    const fullKey = `${prefixMap[newKeyEnv]}${randomSuffix}`
    setGeneratedKey(fullKey)
    setApiKeys([
      ...apiKeys,
      {
        name: newKeyName.trim(),
        prefix: prefixMap[newKeyEnv],
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Active",
      },
    ])
  }

  function handleCloseGenerateKey() {
    setGenerateKeyOpen(false)
    setNewKeyName("")
    setNewKeyEnv("production")
    setGeneratedKey(null)
  }

  function handleCopyKey(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  function handleRevokeKey(index: number) {
    const updated = [...apiKeys]
    updated[index] = { ...updated[index], status: updated[index].status === "Active" ? "Revoked" : "Active" }
    setApiKeys(updated)
  }

  function handleToggleIntegration(index: number) {
    const updated = [...integrations]
    updated[index] = { ...updated[index], connected: !updated[index].connected }
    setIntegrations(updated)
  }

  const securityOptions = [
    { key: "mfa" as const, title: "Enforce Multi-Factor Authentication", description: "Require MFA for all admin accounts" },
    { key: "riskStepUp" as const, title: "Enable Risk-Based Step-Up Auth", description: "Trigger additional verification for high-risk sessions" },
    { key: "autoBlock" as const, title: "Auto-Block High Risk Sessions", description: "Automatically block sessions with risk score above 85" },
    { key: "sessionRecording" as const, title: "Enable Session Recording", description: "Record session metadata for compliance and audit" },
    { key: "ipAllowlist" as const, title: "IP Allowlisting", description: "Restrict admin access to approved IP addresses" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure platform settings and integrations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="rounded-xl border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Organization Settings</CardTitle>
              <CardDescription>Manage your organization details and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-w-md flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="org-name" className="text-sm">Organization Name</Label>
                  <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="org-email" className="text-sm">Admin Email</Label>
                  <input
                    id="org-email"
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="CET">CET (Central European Time)</SelectItem>
                      <SelectItem value="JST">JST (Japan Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-fit gap-2 rounded-lg" size="sm" onClick={handleSaveGeneral}>
                  {saved ? <><Check className="size-4" /> Saved</> : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="rounded-xl border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Security Preferences</CardTitle>
              <CardDescription>Configure global security settings for the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                {securityOptions.map((setting) => (
                  <div key={setting.key} className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{setting.title}</span>
                      <span className="text-xs text-muted-foreground">{setting.description}</span>
                    </div>
                    <Switch
                      checked={securitySettings[setting.key]}
                      onCheckedChange={() => handleToggleSecurity(setting.key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="mt-6">
          <Card className="rounded-xl border-border/50 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">API Keys</CardTitle>
                  <CardDescription>Manage API keys for application integrations.</CardDescription>
                </div>
                <Button size="sm" className="gap-2 rounded-lg" onClick={() => setGenerateKeyOpen(true)}>
                  <Plus className="size-4" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {apiKeys.map((apiKey, index) => (
                  <div
                    key={`${apiKey.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/20 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="size-4 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-lg font-medium">AegisAuth API</h3>
                        <span className="font-mono text-xs text-muted-foreground">
                          {apiKey.prefix}{"************"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        Created {apiKey.created}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          apiKey.status === "Active"
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-destructive/20 bg-destructive/10 text-destructive"
                        }
                      >
                        {apiKey.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleRevokeKey(index)}
                      >
                        {apiKey.status === "Active" ? "Revoke" : "Restore"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card className="rounded-xl border-border/50 bg-card">
            <CardHeader>
              <CardTitle className="text-base">Integrations</CardTitle>
              <CardDescription>Connect third-party services and tools.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.name}
                    className="flex items-start justify-between rounded-lg border border-border/30 bg-secondary/20 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Plug className="mt-0.5 size-4 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{integration.name}</span>
                        <span className="text-xs text-muted-foreground">{integration.description}</span>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      size="sm"
                      className="shrink-0 rounded-lg text-xs"
                      onClick={() => handleToggleIntegration(index)}
                    >
                      {integration.connected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate API Key Dialog */}
      <Dialog open={generateKeyOpen} onOpenChange={(open) => !open && handleCloseGenerateKey()}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{generatedKey ? "API Key Generated" : "Generate New API Key"}</DialogTitle>
            <DialogDescription>
              {generatedKey
                ? "Copy this key now. It will not be shown again for security reasons."
                : "Create a new API key for your application integration."}
            </DialogDescription>
          </DialogHeader>
          {!generatedKey ? (
            <>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <input
                    id="key-name"
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production API Key"
                    className="h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Environment</Label>
                  <Select value={newKeyEnv} onValueChange={setNewKeyEnv}>
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseGenerateKey}>Cancel</Button>
                <Button onClick={handleGenerateKey} disabled={!newKeyName.trim()}>Generate Key</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4">
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <code className="flex-1 break-all text-sm font-mono text-primary">{generatedKey}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-primary"
                    onClick={() => handleCopyKey(generatedKey)}
                  >
                    {copiedKey === generatedKey ? <Check className="size-4" /> : <Copy className="size-4" />}
                    <span className="sr-only">Copy API key</span>
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseGenerateKey}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
