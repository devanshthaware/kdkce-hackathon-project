/**
 * Session monitoring module
 * Handles periodic risk checks during active sessions
 */

let monitoringInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start session monitoring at specified interval
 * @param interval - Interval in milliseconds between checks
 * @param callback - Function to call on each interval
 */
export function startSessionMonitoring(interval: number, callback: () => void): void {
  // Clear existing interval if running
  stopSessionMonitoring();

  if (interval <= 0) {
    throw new Error("Monitoring interval must be greater than 0");
  }

  monitoringInterval = setInterval(() => {
    try {
      callback();
    } catch (error) {
      console.error("[AegisAuth] Session monitoring callback error:", error);
    }
  }, interval);
}

/**
 * Stop session monitoring
 */
export function stopSessionMonitoring(): void {
  if (monitoringInterval !== null) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Check if monitoring is currently active
 */
export function isMonitoring(): boolean {
  return monitoringInterval !== null;
}

/**
 * Get current monitoring status
 */
export function getMonitoringStatus(): {
  active: boolean;
  intervalId: string | null;
} {
  return {
    active: isMonitoring(),
    intervalId: monitoringInterval ? `interval-${monitoringInterval}` : null,
  };
}
