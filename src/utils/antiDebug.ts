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

    // If execution was delayed significantly (>100ms), DevTools is active
    if (endTime - startTime > 100) {
      window.location.href = 'about:blank';
    }
  }, 1000);

  return () => clearInterval(intervalId);
};
