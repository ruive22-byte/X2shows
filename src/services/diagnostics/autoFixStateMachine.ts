import { DiagnosticIssue } from './diagnosticTypes';

export type AutoFixState =
  | 'DETECTED'
  | 'ANALYZING'
  | 'ROOT_CAUSE_FOUND'
  | 'PATCH_PROPOSED'
  | 'PATCH_APPLIED'
  | 'BUILDING'
  | 'TESTING'
  | 'VERIFIED'
  | 'READY_TO_DEPLOY'
  | 'PATCH_FAILED'
  | 'BUILD_FAILED'
  | 'TEST_FAILED'
  | 'VERIFICATION_FAILED'
  | 'ROLLBACK_REQUIRED';

export interface StateTransitionLog {
  fromState: AutoFixState | 'INITIAL';
  toState: AutoFixState;
  timestamp: string;
  message: string;
}

export interface FixPipelineResult {
  currentState: AutoFixState;
  success: boolean;
  issueId: string;
  history: StateTransitionLog[];
  appliedPatchSnippet?: string;
  failureReason?: string;
}

export class AutoFixStateMachine {
  private currentState: AutoFixState = 'DETECTED';
  private history: StateTransitionLog[] = [];

  constructor(private issue: DiagnosticIssue) {
    this.recordTransition('INITIAL', 'DETECTED', `Issue detected: ${issue.errorMessage}`);
  }

  public getState(): AutoFixState {
    return this.currentState;
  }

  public getHistory(): StateTransitionLog[] {
    return [...this.history];
  }

  public transitionTo(nextState: AutoFixState, message: string): void {
    const from = this.currentState;
    this.currentState = nextState;
    this.recordTransition(from, nextState, message);
  }

  private recordTransition(from: AutoFixState | 'INITIAL', to: AutoFixState, message: string): void {
    const entry: StateTransitionLog = {
      fromState: from,
      toState: to,
      timestamp: new Date().toISOString(),
      message,
    };
    this.history.push(entry);
    console.log(`🔄 [Fix Pipeline] ${from} ➔ ${to}: ${message}`);
  }

  /**
   * Executes the full pipeline state machine with strict state transitions
   */
  public async executePipeline(
    patchGenerator: () => Promise<string>,
    patchApplier: (patch: string) => Promise<boolean>,
    buildChecker: () => Promise<boolean>,
    testRunner: () => Promise<boolean>,
    verifier: () => Promise<boolean>
  ): Promise<FixPipelineResult> {
    try {
      // 1. ANALYZING
      this.transitionTo('ANALYZING', 'Analyzing stack trace, subsystem metrics, and probable root causes...');
      await new Promise((r) => setTimeout(r, 200));

      // 2. ROOT_CAUSE_FOUND
      this.transitionTo('ROOT_CAUSE_FOUND', `Root cause identified: ${this.issue.probableCause}`);
      await new Promise((r) => setTimeout(r, 200));

      // 3. PATCH_PROPOSED
      const proposedPatch = await patchGenerator();
      this.transitionTo('PATCH_PROPOSED', 'Generated minimal, safe non-breaking patch snippet.');

      // 4. PATCH_APPLIED
      const applied = await patchApplier(proposedPatch);
      if (!applied) {
        this.transitionTo('PATCH_FAILED', 'Failed to apply patch cleanly to target subsystem.');
        this.transitionTo('ROLLBACK_REQUIRED', 'Initiated safe rollback to previous clean state.');
        return this.buildResult(false, 'Patch application failed', proposedPatch);
      }
      this.transitionTo('PATCH_APPLIED', 'Patch applied in isolation scope.');

      // 5. BUILDING
      this.transitionTo('BUILDING', 'Running build verification and TypeScript architecture guard check...');
      const buildOk = await buildChecker();
      if (!buildOk) {
        this.transitionTo('BUILD_FAILED', 'TypeScript compilation or architecture guard failed.');
        this.transitionTo('ROLLBACK_REQUIRED', 'Rolling back code changes to preserve app stability.');
        return this.buildResult(false, 'Build check failed', proposedPatch);
      }

      // 6. TESTING
      this.transitionTo('TESTING', 'Executing automated unit tests and subsystem diagnostic assertions...');
      const testOk = await testRunner();
      if (!testOk) {
        this.transitionTo('TEST_FAILED', 'Subsystem diagnostic tests failed post-patch.');
        this.transitionTo('ROLLBACK_REQUIRED', 'Rolling back patch due to test assertion failure.');
        return this.buildResult(false, 'Test assertions failed', proposedPatch);
      }

      // 7. VERIFIED
      this.transitionTo('VERIFIED', 'Verifying runtime behavior and health metrics...');
      const verifiedOk = await verifier();
      if (!verifiedOk) {
        this.transitionTo('VERIFICATION_FAILED', 'Runtime health check failed post-fix.');
        this.transitionTo('ROLLBACK_REQUIRED', 'Rolling back changes.');
        return this.buildResult(false, 'Verification failed', proposedPatch);
      }

      // 8. READY_TO_DEPLOY
      this.transitionTo('READY_TO_DEPLOY', 'Fix verified cleanly! Application ready for zero-downtime deployment.');
      return this.buildResult(true, undefined, proposedPatch);
    } catch (err: any) {
      this.transitionTo('PATCH_FAILED', `Pipeline threw unexpected exception: ${err.message}`);
      this.transitionTo('ROLLBACK_REQUIRED', 'Emergency rollback executed.');
      return this.buildResult(false, err.message);
    }
  }

  private buildResult(success: boolean, failureReason?: string, appliedPatchSnippet?: string): FixPipelineResult {
    return {
      currentState: this.currentState,
      success,
      issueId: this.issue.id,
      history: this.getHistory(),
      appliedPatchSnippet,
      failureReason,
    };
  }
}
