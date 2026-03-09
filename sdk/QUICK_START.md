## Quick Reference Guide - AegisAuth SDK

### Installation

```bash
# Core SDK only
npm install @aegis/auth-sdk

# With React support
npm install @aegis/auth-sdk react@18+

# With Express support
npm install @aegis/auth-sdk express
```

### 5-Minute Quick Start

```typescript
import { AegisAuth } from "@aegis/auth-sdk";

// 1. Initialize client
const aegis = new AegisAuth({
  apiKey: "your-api-key",
  endpoint: "https://api.aegisauth.com"
});

// 2. Protect login
const risk = await aegis.protectLogin({
  userId: "user-123",
  email: "user@example.com"
});

// 3. Make decision based on risk
if (aegis.isCritical(risk)) {
  // Block login + notify security
  return handleBlockedLogin(risk);
} else if (aegis.isHighRisk(risk)) {
  // Require MFA
  return redirectToMFA();
} else {
  // Normal login flow
  return createSession(user);
}
```

### React Usage

```typescript
import { AegisProvider, useAegisAuth } from "@aegis/auth-sdk/react";

// Wrap your app
function App() {
  return (
    <AegisProvider config={{ 
      apiKey: "...", 
      endpoint: "..." 
    }}>
      <LoginPage />
    </AegisProvider>
  );
}

// Use in components
function LoginPage() {
  const { protectLogin, risk, loading } = useAegisAuth();
  
  const handleLogin = async () => {
    const assessment = await protectLogin({ 
      userId: "123", 
      email: "user@example.com" 
    });
    
    if (assessment.risk_level === "CRITICAL") {
      // Show error
    } else {
      // Proceed
    }
  };

  return (
    <button onClick={handleLogin} disabled={loading}>
      Login
    </button>
  );
}
```

### Node.js / Express

```typescript
import { aegisMiddleware, requireLowRisk } from "@aegis/auth-sdk/node";
import express from "express";

const app = express();

// Apply middleware to all routes
app.use(aegisMiddleware({
  apiKey: "your-api-key",
  endpoint: "https://api.aegisauth.com"
}));

// Protect sensitive routes
const client = new AegisAuthNode(config);
app.get("/api/sensitive", requireLowRisk(client), (req, res) => {
  res.json({ data: "sensitive" });
});

// Access risk in handlers
app.post("/api/login", (req, res) => {
  const risk = req.aegisRisk; // Set by middleware
  
  if (client.isCritical(risk)) {
    return res.status(403).json({ error: "Access denied" });
  }
  
  // Continue with login
});
```

### Continuous Monitoring

```typescript
// Start monitoring after successful login
const monitoringId = aegis.startMonitoring((risk) => {
  if (aegis.isCritical(risk)) {
    // Terminate session immediately
    logout();
  } else if (aegis.isHighRisk(risk)) {
    // Force re-authentication
    requireMFA();
  }
});

// Stop when session ends
aegis.stopMonitoring();
```

### Risk Levels

- **LOW** (0.0-0.25): Normal authentication, proceed
- **MEDIUM** (0.25-0.5): Consider additional verification
- **HIGH** (0.5-0.8): Require step-up authentication (MFA)
- **CRITICAL** (0.8-1.0): Block access, investigate

### Error Handling

```typescript
import { 
  AegisAuth, 
  NetworkError, 
  TimeoutError, 
  ConfigError 
} from "@aegis/auth-sdk";

try {
  const risk = await aegis.protectLogin(payload);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error("Network issue:", error.statusCode);
  } else if (error instanceof TimeoutError) {
    console.error("Request timed out");
  } else if (error instanceof ConfigError) {
    console.error("Configuration error:", error.message);
  }
}
```

### Configuration Options

```typescript
const config = {
  // Required
  apiKey: string,              // Your API key
  endpoint: string,            // Backend URL
  
  // Optional
  autoMonitor?: boolean,       // Auto-enable monitoring after login
  monitorInterval?: number,    // Monitoring check interval (ms)
  timeout?: number,            // Request timeout (ms, default 10000)
  retries?: number,            // Retry attempts (default 1)
  debug?: boolean              // Enable console logging
};
```

### Methods

#### AegisAuth

| Method | Returns | Description |
|--------|---------|-------------|
| `protectLogin(payload)` | `Promise<RiskResponse>` | Assess login risk |
| `checkRisk(payload?)` | `Promise<RiskResponse>` | Quick re-evaluation |
| `startMonitoring(handler)` | `string` | Start monitoring session |
| `stopMonitoring()` | `void` | Stop monitoring |
| `isHighRisk(risk)` | `boolean` | Check if HIGH/CRITICAL |
| `isCritical(risk)` | `boolean` | Check if CRITICAL |
| `hasDeviceChanged()` | `boolean` | Detect device change |
| `getCachedRisk()` | `RiskResponse \| null` | Get last assessment |
| `getMonitoringStatus()` | `boolean` | Check if monitoring active |
| `destroy()` | `void` | Cleanup resources |

#### useAegisAuth (React)

| Hook Property | Type | Description |
|--------------|------|-------------|
| `risk` | `RiskResponse \| null` | Current risk assessment |
| `loading` | `boolean` | API call in progress |
| `error` | `Error \| null` | Last error |
| `protectLogin` | `(payload) => Promise` | Call protectLogin |
| `checkRisk` | `(payload?) => Promise` | Call checkRisk |
| `startMonitoring` | `(handler) => string` | Start monitoring |
| `stopMonitoring` | `() => void` | Stop monitoring |
| `isHighRisk` | `(risk) => boolean` | Check risk level |
| `isCritical` | `(risk) => boolean` | Check if critical |

### Type Definitions

```typescript
// Main response type
type RiskResponse = {
  risk_score: number;        // 0-1
  risk_level: RiskLevel;     // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  components: Record<string, number>;  // Individual risk scores
  timestamp?: number;        // Assessment time
};

// Login request
type LoginPayload = {
  userId: string;
  email: string;
  metadata?: Record<string, any>;
  simulateFlags?: {
    newDevice?: boolean;
    countryChange?: boolean;
    vpn?: boolean;
    apiBurst?: boolean;
    privilegeEscalation?: boolean;
  };
};

// Device fingerprint
type FingerprintPayload = {
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency: number;
  language: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  timestamp: number;
};
```

### Troubleshooting

**Build Issues?**
```bash
npm run build
npm run type-check
```

**Type errors?**
```bash
npm run type-check
```

**Want examples?**
See `example/demo.ts` and `example/server.ts`

**Debug mode?**
```typescript
const client = new AegisAuth({
  // ...
  debug: true
});
// Check console for [AegisAuth] logs
```

### Performance Tips

1. **Reuse client instances** - Don't create new AegisAuth() for every request
2. **Enable monitoring** - Continuous monitoring catches anomalies early
3. **Cache fingerprints** - Fingerprints change rarely (different device usually the reason)
4. **Batch evaluations** - Use `evaluateRiskBatch()` in Node.js for multiple users
5. **Adjust timeout** - If backend is slow, increase timeout value

### Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (recent versions)

### Node.js Compatibility

- ✅ Node.js 14+
- ✅ All major frameworks (Express, Fastify, etc.)

---

For more details, see [README.md](./README.md) and [BUILD_VERIFICATION.md](./BUILD_VERIFICATION.md)
