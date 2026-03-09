import React, { createContext, useContext } from "react";
import { AegisAuth } from "../client";
import { AegisConfig } from "../types";

/**
 * Context for AegisAuth client
 */
const AegisContext = createContext<AegisAuth | null>(null);

interface AegisProviderProps {
  config: AegisConfig;
  children: React.ReactNode;
}

/**
 * Provider component for AegisAuth SDK
 * Wrap your app with this to enable hooks support
 */
export const AegisProvider = ({ config, children }: AegisProviderProps) => {
  // Create client instance (could be optimized to use useMemo in real app)
  const client = React.useMemo(() => new AegisAuth(config), [config.apiKey, config.endpoint]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      client.destroy();
    };
  }, [client]);

  return <AegisContext.Provider value={client}>{children}</AegisContext.Provider>;
};

/**
 * Hook to access AegisAuth client
 */
export const useAegisClient = (): AegisAuth => {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error(
      "useAegisClient must be used inside AegisProvider. " +
      "Wrap your component tree with <AegisProvider>"
    );
  }
  return context;
};

export { AegisContext };
