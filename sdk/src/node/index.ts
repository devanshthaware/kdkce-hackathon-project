/**
 * AegisAuth Node.js Integration
 * Server-side adapter for Express and other Node.js frameworks
 */

export { AegisAuthNode } from "./client";

export {
  createAegisMiddleware,
  aegisMiddleware,
  requireLowRisk,
  aegisErrorHandler,
} from "./middleware";

export type { AegisRequest } from "./middleware";
