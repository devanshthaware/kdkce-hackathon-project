import { useState, useCallback } from "react";
import { useAegisClient } from "./AegisProvider";
import { LoginPayload, RiskResponse } from "../types";

interface UseAegisAuthReturn {
  risk: RiskResponse | null;
  loading: boolean;
  error: Error | null;
  protectLogin: (payload: LoginPayload) => Promise<RiskResponse>;
  checkRisk: (payload?: Partial<LoginPayload>) => Promise<RiskResponse>;
  startMonitoring: (handler: (risk: RiskResponse) => void) => string;
  stopMonitoring: () => void;
}

/**
 * React hook for AegisAuth functionality
 * Provides risk assessment and monitoring in React components
 */
export function useAegisAuth(): UseAegisAuthReturn {
  const client = useAegisClient();
  const [risk, setRisk] = useState<RiskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Protect login with risk assessment
   */
  const protectLogin = useCallback(
    async (payload: LoginPayload): Promise<RiskResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.protectLogin(payload);
        setRisk(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  /**
   * Check risk without login flow
   */
  const checkRisk = useCallback(
    async (payload?: Partial<LoginPayload>): Promise<RiskResponse> => {
      setLoading(true);
      setError(null);
      try {
        const result = await client.checkRisk(payload);
        setRisk(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  /**
   * Start session monitoring
   */
  const startMonitoring = useCallback(
    (handler: (risk: RiskResponse) => void): string => {
      return client.startMonitoring((riskResponse) => {
        setRisk(riskResponse);
        handler(riskResponse);
      });
    },
    [client]
  );

  /**
   * Stop session monitoring
   */
  const stopMonitoring = useCallback(() => {
    client.stopMonitoring();
  }, [client]);

  return {
    risk,
    loading,
    error,
    protectLogin,
    checkRisk,
    startMonitoring,
    stopMonitoring,
  };
}
