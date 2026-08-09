export const initAntiDebuggerTrap = (enabled = true) => {
  if (!enabled || typeof window === 'undefined') return () => {};

  const intervalId = setInterval(() => {
    const startTime = performance.now();
    // Triggers a breakpoint pause if DevTools is open
    try {
      (function () {}.constructor('debugger')());
    } catch {
      // Ignored
    }
    const endTime = performance.now();

    // Log warning if DevTools detected, do NOT redirect to about:blank
    if (endTime - startTime > 100) {
      console.warn('🛡️ [Security Sentinel] DevTools inspection or debugger pause detected.');
    }
  }, 1000);

  return () => clearInterval(intervalId);
};
