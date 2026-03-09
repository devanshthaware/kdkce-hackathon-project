/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as admin from "../admin.js";
import type * as applications from "../applications.js";
import type * as messages from "../messages.js";
import type * as ml from "../ml.js";
import type * as organizations from "../organizations.js";
import type * as riskPolicies from "../riskPolicies.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as support from "../support.js";
import type * as test from "../test.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  admin: typeof admin;
  applications: typeof applications;
  messages: typeof messages;
  ml: typeof ml;
  organizations: typeof organizations;
  riskPolicies: typeof riskPolicies;
  seed: typeof seed;
  sessions: typeof sessions;
  support: typeof support;
  test: typeof test;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
