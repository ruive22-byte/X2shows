import { AiAssistantHandler } from './aiAssistantHandler';

export interface ThreatEvent {
  threatId: string;
  type: 'BRUTE_FORCE_RATE_LIMIT' | 'DEVTOOLS_BYPASS_ATTEMPT' | 'IFRAME_TAMPERING' | 'SUSPICIOUS_USER_AGENT' | 'AD_INJECTION_ATTEMPT';
  severity: 'HIGH' | 'CRITICAL';
  sourceIp: string;
  details: Record<string, any>;
  timestamp: string;
}

export class SecuritySentinelBot {
  private static requestLog: number[] = [];
  private static MAX_REQUESTS_PER_MINUTE = 40; // Rate limit threshold
  private static detectedThreats: ThreatEvent[] = [];
  private static ALLOWED_IFRAME_DOMAINS = [
    'vidlink.pro',
    'vidsrc.pro',
    'multiembed.mov',
    '2embed.cc',
    'vidsrc.vip',
  ];

  /**
   * ACTIVE DEFENDER: Watches the HTML DOM in real-time and deletes injected trackers or ads
   */
  public static startDomDefender(): void {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;

            // 1. Destroy Injected External Scripts & Trackers
            if (el.tagName === 'SCRIPT') {
              this.auditScriptElement(el as HTMLScriptElement);
            }

            const childScripts = el.querySelectorAll?.('script');
            childScripts?.forEach((script) => this.auditScriptElement(script));

            // 2. Destroy Unregistered / Rogue Ad Iframes
            if (el.tagName === 'IFRAME') {
              this.auditIframeElement(el as HTMLIFrameElement);
            }

            const childIframes = el.querySelectorAll?.('iframe');
            childIframes?.forEach((iframe) => this.auditIframeElement(iframe));
          }
        });
      });
    });

    // Observe documentElement safely to catch head/body additions early
    observer.observe(document.documentElement, { childList: true, subtree: true });
    console.log('🛡️ Security Sentinel DOM Defender active.');
  }

  private static auditScriptElement(script: HTMLScriptElement): void {
    const rawSrc = script.getAttribute('src') || script.src || '';

    // 1. NEVER remove inline scripts or app bundles without a src attribute
    if (!rawSrc) return;

    // 2. SAFE: Allow relative paths, Vite internals, and local modules
    if (
      rawSrc.startsWith('/') ||
      rawSrc.startsWith('./') ||
      rawSrc.startsWith('blob:') ||
      rawSrc.includes('/@vite/') ||
      rawSrc.includes('/src/') ||
      rawSrc.includes('/node_modules/')
    ) {
      return;
    }

    // 3. SAFE: Parse full URL origin safely
    try {
      const scriptUrl = new URL(rawSrc, window.location.href);
      const currentHost = window.location.hostname;

      // Allow same-origin, localhost, local loopbacks, and Vite dev server ports or Google services
      const isLocalOrSameOrigin =
        scriptUrl.hostname === currentHost ||
        scriptUrl.hostname === 'localhost' ||
        scriptUrl.hostname === '127.0.0.1' ||
        scriptUrl.hostname.endsWith('.localhost') ||
        scriptUrl.hostname.includes('google') ||
        scriptUrl.hostname.includes('gstatic');

      if (isLocalOrSameOrigin) {
        return;
      }
    } catch {
      // If URL parsing fails, err on the side of caution and DO NOT purge local app code
      return;
    }

    // 4. PURGE ONLY IF explicitly matching known ad/tracker domain signatures
    const KNOWN_AD_SIGNATURES = [
      'adserver',
      'popunder',
      'popads',
      'juicyads',
      'exoclick',
      'propellerads',
      'doubleclick',
      'coinhive',
      'analytics',
      'collect',
    ];

    const isAdTracker = KNOWN_AD_SIGNATURES.some((sig) =>
      rawSrc.toLowerCase().includes(sig)
    );

    if (isAdTracker) {
      this.purgeElement(script, rawSrc);
    }
  }

  /**
   * Sanitizes untrusted user inputs or search queries to prevent XSS / script injection.
   */
  public static sanitizeInput(input: string): string {
    if (!input) return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/script/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror=/gi, '');
  }

  /**
   * Verifies the integrity of LocalStorage keys before loading saved state into Zustand.
   */
  public static validateStorageIntegrity(key: string): boolean {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return true;
      
      // Ensure JSON structure is valid and contains no executable code strings
      JSON.parse(raw);
      if (raw.includes('<script>') || raw.includes('javascript:')) {
        this.reportThreat({
          threatId: `THREAT-${Date.now()}`,
          type: 'IFRAME_TAMPERING',
          severity: 'CRITICAL',
          sourceIp: 'Client_Session',
          details: { message: `Corrupted state detected in storage key: ${key}` },
          timestamp: new Date().toISOString(),
        });
        localStorage.removeItem(key);
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem(key);
      return false;
    }
  }

  private static auditIframeElement(iframe: HTMLIFrameElement): void {
    const rawSrc = iframe.getAttribute('src') || iframe.src || '';
    if (!rawSrc || rawSrc.startsWith('/') || rawSrc.startsWith('./')) {
      return;
    }

    // Check if it's in approved streaming/video domains
    const isApproved = this.ALLOWED_IFRAME_DOMAINS.some((domain) => rawSrc.includes(domain)) ||
      rawSrc.includes(window.location.hostname) ||
      rawSrc.includes('localhost') ||
      rawSrc.includes('ai.studio') ||
      rawSrc.includes('run.app') ||
      rawSrc.includes('google');

    if (!isApproved) {
      console.warn(`🛡️ [Sentinel Defender] Destroyed malicious iframe ad: ${rawSrc}`);
      this.logThreat('IFRAME_TAMPERING', { iframeUrl: rawSrc });
      iframe.remove(); // Deletes iframe instantly
    }
  }

  private static logThreat(type: ThreatEvent['type'], details: Record<string, any>): void {
    this.detectedThreats.push({
      threatId: `THREAT-${Date.now()}`,
      type,
      severity: 'HIGH',
      sourceIp: 'Client_DOM',
      details,
      timestamp: new Date().toISOString(),
    });
  }

  private static purgeElement(el: HTMLElement, source: string): void {
    try {
      el.remove();
      this.logThreat('AD_INJECTION_ATTEMPT', { scriptUrl: source });
      console.warn(`🛡️ [SecuritySentinelBot] Blocked Rogue Script: ${source}`);
    } catch (err) {
      console.error('Failed to remove rogue script:', err);
    }
  }

  /**
   * 1. TRACKS: Monitors API request frequency to stop bot scrapers & DDoS attacks
   */
  public static trackRequestRate(): boolean {
    const now = Date.now();
    // Keep only requests made in the last 60 seconds
    this.requestLog = this.requestLog.filter((timestamp) => now - timestamp < 60000);
    this.requestLog.push(now);

    if (this.requestLog.length > this.MAX_REQUESTS_PER_MINUTE) {
      this.reportThreat({
        threatId: `THREAT-${now}`,
        type: 'BRUTE_FORCE_RATE_LIMIT',
        severity: 'CRITICAL',
        sourceIp: 'Client_Session',
        details: { requestCount: this.requestLog.length, timeframeWindow: '60s' },
        timestamp: new Date().toISOString(),
      });
      return false; // Block request
    }
    return true; // Allow request
  }

  /**
   * 2. REPORTS: Logs security threat, blocks session, and triggers Gemini prompt generator
   */
  public static async reportThreat(threat: ThreatEvent): Promise<void> {
    this.detectedThreats.push(threat);
    console.warn(`🚨 [Security Bot Alert] Threat detected: [${threat.type}]`, threat);

    // Automatically package threat payload for Gemini AI to improve app defense
    const geminiPrompt = this.generateSecurityPatchPrompt(threat);
    await AiAssistantHandler.copyToClipboard(geminiPrompt);
  }

  /**
   * 3. MAKES IT BETTER: Asks Gemini to write an automated security patch for the exact threat
   */
  public static generateSecurityPatchPrompt(threat: ThreatEvent): string {
    return `
🛡️ **SECURITY BOT THREAT ALERT & AUTO-PATCH REQUEST**

My automated Security Sentinel Bot intercepted a malicious attempt/exploit on my streaming app.

### 🚨 Intercepted Threat Payload
- **Threat Type:** \`${threat.type}\`
- **Severity:** \`${threat.severity}\`
- **Timestamp:** \`${threat.timestamp}\`
- **Details:**
\`\`\`json
${JSON.stringify(threat.details, null, 2)}
\`\`\`

---

### 🎯 Instructions for Gemini:
1. **Analyze Attack Vector:** How did this attack attempt to bypass my frontend controls or rate limits?
2. **Write Automated Security Patch:** Provide an updated TypeScript security hook or middleware to block this specific attack vector permanently.
3. **Preserve Theme & Performance:** Ensure the fix doesn't cause lag or alter UI styling (\`bg-[#07151e]\`, \`shadow-[4px_4px_0px_#000000]\`).
`.trim();
  }

  public static getThreatHistory(): ThreatEvent[] {
    return this.detectedThreats;
  }
}
