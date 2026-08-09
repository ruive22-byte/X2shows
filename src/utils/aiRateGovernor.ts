export type RequestPriority = 'USER' | 'BACKGROUND';

export class AIRateGovernor {
  // Circuit Breaker States: CLOSED (Healthy), OPEN (Paused), HALF_OPEN (Testing)
  private static state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private static failureCount = 0;
  private static failureThreshold = 2; // Trip circuit after 2 consecutive 429s
  private static resetTimeoutMs = 120000; // Wait 2 minutes when circuit trips
  private static lastStateChange = Date.now();

  // Sliding Window Rate Limiting (e.g. max 10 requests per minute)
  private static requestTimestamps: number[] = [];
  private static MAX_RPM = 10;
  private static WINDOW_MS = 60000;

  /**
   * Safe execution wrapper for all Gemini API calls
   */
  public static async execute<T>(
    apiCall: () => Promise<T>,
    priority: RequestPriority = 'USER',
    fallbackValue?: T
  ): Promise<T | undefined> {
    const now = Date.now();

    // 1. Check Circuit Breaker State
    if (this.state === 'OPEN') {
      if (now - this.lastStateChange > this.resetTimeoutMs) {
        console.log('🔄 [AI Governor] Cooldown expired. Transitioning to HALF_OPEN to test API...');
        this.state = 'HALF_OPEN';
      } else {
        // Drop background requests immediately without touching the network
        if (priority === 'BACKGROUND') {
          console.warn('⛔ [AI Governor] Circuit OPEN. Dropping background request to preserve quota.');
          return fallbackValue;
        }
      }
    }

    // 2. Enforce Sliding Window Rate Limit
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < this.WINDOW_MS);
    
    if (this.requestTimestamps.length >= this.MAX_RPM) {
      if (priority === 'BACKGROUND') {
        console.warn('⏳ [AI Governor] Rate limit threshold reached. Suppressing background prompt.');
        return fallbackValue;
      }
      // Delay user requests slightly instead of failing outright
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 3. Execute API Call with 429 Error Interception
    try {
      this.requestTimestamps.push(Date.now());
      const result = await apiCall();

      // Reset circuit on successful request
      if (this.state === 'HALF_OPEN' || this.failureCount > 0) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log('✅ [AI Governor] API connection healthy. Circuit CLOSED.');
      }

      return result;
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');

      if (isRateLimit) {
        this.failureCount++;
        console.info(`ℹ️ [AI Governor] Gemini Rate Limit 429 intercepted. Engaging circuit breaker fallback.`);

        if (this.failureCount >= this.failureThreshold) {
          this.state = 'OPEN';
          this.lastStateChange = Date.now();
          console.info('ℹ️ [AI Governor] Circuit Breaker engaged. Background API calls paused temporarily.');
        }
      }

      if (fallbackValue !== undefined) return fallbackValue;
      throw error;
    }
  }

  public static getStatus() {
    return {
      state: this.state,
      activeRequestsInWindow: this.requestTimestamps.length,
      failures: this.failureCount,
    };
  }
}
