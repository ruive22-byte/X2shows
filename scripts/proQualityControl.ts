// scripts/proQualityControl.ts
import { execSync } from 'child_process';
import { performance } from 'perf_hooks';

export interface QCReport {
  typeCheck: 'PASS' | 'FAIL';
  buildStatus: 'PASS' | 'FAIL';
  executionTimeMs: number;
  errors: string[];
}

export function runProQualityControl(): QCReport {
  const startTime = performance.now();
  const errors: string[] = [];
  let typeCheck: 'PASS' | 'FAIL' = 'PASS';
  let buildStatus: 'PASS' | 'FAIL' = 'PASS';

  console.log('🚀 [PRO AI-QC] Starting Super Fast Build & Quality Gate Audit...\n');

  // 1. High-Speed TypeScript Validation (Zero-Emit Type Check)
  try {
    console.log('🔍 [1/2] Running TypeScript Type Check (tsc --noEmit)...');
    execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
    console.log('✅ Type Check Passed Cleanly.');
  } catch (typeError: any) {
    typeCheck = 'FAIL';
    const output = typeError.stdout || typeError.stderr || typeError.message;
    errors.push(`[TYPE_CHECK_ERROR]\n${output}`);
    console.error('❌ Type Check Failed!');
  }

  // 2. High-Speed Production Build (SWC/Vite Rust Engine)
  if (typeCheck === 'PASS') {
    try {
      console.log('\n⚡ [2/2] Running Production Build (vite build)...');
      execSync('npx vite build', { stdio: 'pipe', encoding: 'utf-8' });
      console.log('✅ Production Build Compiled Successfully.');
    } catch (buildError: any) {
      buildStatus = 'FAIL';
      const output = buildError.stdout || buildError.stderr || buildError.message;
      errors.push(`[BUILD_ERROR]\n${output}`);
      console.error('❌ Build Failed!');
    }
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  console.log('\n==================================================');
  if (typeCheck === 'PASS' && buildStatus === 'PASS') {
    console.log(`🎉 QUALITY CONTROL PASSED in ${executionTimeMs}ms! Workspace is 100% Production Ready.`);
  } else {
    console.error(`🚨 QUALITY CONTROL FAILED in ${executionTimeMs}ms.`);
    console.error('\n--- DETAILED ERROR LOG FOR AI SELF-HEALING ---');
    errors.forEach(err => console.error(err));
  }
  console.log('==================================================\n');

  if (errors.length > 0) {
    process.exit(1);
  }

  return { typeCheck, buildStatus, executionTimeMs, errors };
}

runProQualityControl();
