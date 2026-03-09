# AegisAuth SDK

Production-grade TypeScript SDK for Adaptive Authentication with device fingerprinting, risk assessment, and continuous session monitoring.

## Features

✨ **Lightweight & Framework-Agnostic** - Zero dependencies except axios, works with any framework  
🔐 **Device Fingerprinting** - Privacy-safe browser signal collection  
⚡ **Risk Assessment** - Real-time adaptive authentication risk scoring  
👁️ **Continuous Monitoring** - Track session risk throughout user lifecycle  
🛡️ **Error Resilience** - Graceful fallback strategy for backend outages  
📦 **TypeScript-First** - Full type safety and IDE support  
⚙️ **Framework Integration** - React hooks included with optional installation  

## Installation

### Core SDK
```bash
npm install @aegis/auth-sdk
```

### With React Support (Optional)
```bash
npm install @aegis/auth-sdk react@18
```

## Quick Start

### Core SDK Example (5 minutes)

```typescript
import { AegisAuth, LoginPayload } from "@aegis/auth-sdk";

// Initialize client
const client = new AegisAuth({
  apiKey: "your-api-key",
  endpoint: "https://api.aegisauth.com",
});

// Protect login
const risk = await client.protectLogin({
  userId: "user-123",
  email: "user@example.com",
});

// Handle based on risk
if (client.isCritical(risk)) {
  // Block login, require MFA
} else if (client.isHighRisk(risk)) {
  // Step-up authentication
} else {
  // Proceed normally
}
```

### React Integration

```typescript
import { AegisProvider, useAegisAuth } from "@aegis/auth-sdk/react";

function App() {
  return (
    <AegisProvider config={{
      apiKey: "your-api-key",
      endpoint: "https://api.aegisauth.com",
    }}>
      <LoginPage />
    </AegisProvider>
  );
}

function LoginPage() {
  const { protectLogin, risk, loading } = useAegisAuth();

  const handleLogin = async () => {
    const assessment = await protectLogin({
      userId: "user-123",
      email: "user@example.com",
    });

    if (assessment.risk_level === "CRITICAL") {
      // Show MFA prompt
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

## Continuous Monitoring

Monitor session risk throughout the user's authentication lifecycle:

```typescript
const client = new AegisAuth({
  apiKey: "your-api-key",
  endpoint: "https://api.aegisauth.com",
});

// Start automatic monitoring
client.startMonitoring((risk) => {
  if (client.isCritical(risk)) {
    // Terminate session immediately
    logout();
  } else if (client.isHighRisk(risk)) {
    // Force re-authentication
    redirectToMFA();
  }
});

// Stop when session ends
client.stopMonitoring();
```

## Risk Handling Patterns

### Step-Up Authentication

```typescript
const risk = await client.protectLogin(payload);

switch (risk.risk_level) {
  case "LOW":
    // Normal authentication
    break;
  case "MEDIUM":
    // Request additional verification
    await verifyEmail(user.email);
    break;
  case "HIGH":
    // Require MFA
    await requireMFA();
    break;
  case "CRITICAL":
    // Block + notify security team
    blockLogin();
    notifySecurityTeam(risk);
    break;
}
```

### Device Change Detection

```typescript
if (client.hasDeviceChanged()) {
  // Require re-verification
  await resendVerificationEmail();
}
```

## API Reference

### AegisAuth Class

#### Constructor

```typescript
constructor(config: AegisConfig)
```

**Config Options:**
- `apiKey` (string, required) - API key for authentication
- `endpoint` (string, required) - Backend endpoint for risk evaluation
- `autoMonitor` (boolean, optional) - Auto-start monitoring after login (default: false)
- `monitorInterval` (number, optional) - Monitoring check interval in ms (default: 5000)
- `timeout` (number, optional) - API request timeout in ms (default: 10000)
- `retries` (number, optional) - Retry attempts for failed requests (default: 1)
- `debug` (boolean, optional) - Enable console logging (default: false)

#### Methods

##### `protectLogin(payload: LoginPayload): Promise<RiskResponse>`

Assess risk for a login attempt and collect device fingerprint.

```typescript
const risk = await client.protectLogin({
  userId: "user-123",
  email: "user@example.com",
  metadata: { ipAddress: "192.168.1.1" },
});
```

##### `checkRisk(payload?: Partial<LoginPayload>): Promise<RiskResponse>`

Re-evaluate risk without full login flow, useful for mid-session checks.

```typescript
const risk = await client.checkRisk({ userId: "user-123" });
```

##### `startMonitoring(handler: (risk: RiskResponse) => void): string`

Start continuous session monitoring at configured interval.

```typescript
const monitoringId = client.startMonitoring((risk) => {
  console.log(`Risk update: ${risk.risk_level}`);
});
```

##### `stopMonitoring(): void`

Stop active monitoring session.

```typescript
client.stopMonitoring();
```

##### `isHighRisk(risk: RiskResponse): boolean`

Check if risk is HIGH or CRITICAL level.

```typescript
if (client.isHighRisk(risk)) {
  // Handle high risk
}
```

##### `isCritical(risk: RiskResponse): boolean`

Check if risk is CRITICAL level.

```typescript
if (client.isCritical(risk)) {
  // Block access
}
```

### Types

#### RiskResponse

```typescript
interface RiskResponse {
  risk_score: number;        // 0-1 score
  risk_level: RiskLevel;     // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  components: Record<string, number>;  // Individual risk components
  timestamp?: number;        // Assessment timestamp
}
```

#### LoginPayload

```typescript
interface LoginPayload {
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
}
```

#### FingerprintPayload

```typescript
interface FingerprintPayload {
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency: number;
  language: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  timestamp: number;
}
```

## Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import { AegisAuth, NetworkError, TimeoutError, AegisError } from "@aegis/auth-sdk";

try {
  await client.protectLogin(payload);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error(`Network issue: ${error.statusCode}`);
  } else if (error instanceof TimeoutError) {
    console.error(`Request timed out: ${error.duration}ms`);
  } else if (error instanceof AegisError) {
    console.error(`SDK error: ${error.message}`);
  }
}
```

## Privacy & Security

- **No PII Collection** - Device fingerprinting uses only non-identifying signals
- **No Cookie Storage** - Fingerprints are computed, not stored
- **Timeout Protection** - Default 10s timeout prevents hanging requests
- **Retry Logic** - Automatic exponential backoff for transient failures
- **Graceful Degradation** - Safe fallback to LOW risk if backend unreachable

## Performance

- **Lightweight** - ~15KB minified & gzipped
- **No External Dependencies** - Only axios for network requests
- **Async/Await** - Non-blocking operations
- **Lazy Evaluation** - Fingerprints computed on-demand

## Browser Compatibility

- Chrome/Edge: ✅ 90+
- Firefox: ✅ 88+
- Safari: ✅ 14+
- Mobile browsers: ✅ Modern versions

## Node.js Support

Works in Node.js environments via @aegis/auth-node package.

## Examples

See [example/demo.ts](./example/demo.ts) for comprehensive usage patterns.

## License

MIT

## Support

For issues, feature requests, or questions:
- GitHub Issues: [aegis/auth-sdk](https://github.com/aegis/auth-sdk)
- Documentation: [docs.aegisauth.com](https://docs.aegisauth.com)
- Email: sdk-support@aegisauth.com

---

**Built with ❤️ by AegisAuth Team**
