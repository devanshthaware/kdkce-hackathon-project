import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { GenericDatabaseWriter } from "convex/server";
import { emitEvent } from "./events";

export type SessionState = 
    | "NEW" 
    | "EVALUATING" 
    | "ACTIVE" 
    | "CHALLENGED" 
    | "RESTRICTED" 
    | "BLOCKED" 
    | "TERMINATED";

/**
 * Valid transitions for the session state machine.
 */
const VALID_TRANSITIONS: Record<SessionState, SessionState[]> = {
    NEW: ["EVALUATING"],
    EVALUATING: ["ACTIVE", "CHALLENGED", "RESTRICTED", "BLOCKED"],
    ACTIVE: ["EVALUATING", "CHALLENGED", "RESTRICTED", "BLOCKED", "TERMINATED"],
    CHALLENGED: ["ACTIVE", "RESTRICTED", "BLOCKED", "TERMINATED"],
    RESTRICTED: ["EVALUATING", "CHALLENGED", "BLOCKED", "TERMINATED"],
    BLOCKED: ["TERMINATED"],
    TERMINATED: [],
};

/**
 * Centralized manager for session state transitions.
 * Enforces validation and increments state version.
 */
export async function transitionSession(
    db: GenericDatabaseWriter<any>,
    sessionId: Id<"sessions">,
    nextState: SessionState,
    reason: string,
    correlationId: string
): Promise<void> {
    const session = await db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const currentState = session.state as SessionState;

    // 1. Terminal State Check
    if (currentState === "TERMINATED") {
        console.error(`Violation: Attempted to transition from terminal state ${currentState} for session ${sessionId}`);
        throw new Error(`Cannot transition from terminal state: ${currentState}`);
    }

    // 2. Already in state
    if (currentState === nextState) return;

    // 3. Validation
    const allowed = VALID_TRANSITIONS[currentState] || [];
    if (!allowed.includes(nextState)) {
        const errorMsg = `Invalid transition: ${currentState} -> ${nextState} for session ${sessionId}`;
        console.error(`[Aegis State Machine Violation] ${errorMsg}`);
        throw new Error(errorMsg);
    }

    // 4. Persistence
    await db.patch(sessionId, {
        state: nextState,
        stateVersion: (session.stateVersion ?? 0) + 1,
        updatedAt: Date.now(),
    });

    // 5. Emit Traceable Event
    await emitEvent(db, {
        type: "STATE_TRANSITIONED",
        sessionId: sessionId,
        correlationId: correlationId,
        applicationId: session.applicationId,
        payload: {
            from: currentState,
            to: nextState,
            reason: reason,
            state_version: (session.stateVersion ?? 0) + 1
        }
    });

    console.log(`[Aegis State Machine] Transitioned session ${sessionId}: ${currentState} -> ${nextState} (Correlation: ${correlationId})`);
}
