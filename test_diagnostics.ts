import { DiagnosticSanitizer } from './src/services/diagnostics/diagnosticSanitizer';
import { ErrorCollector } from './src/services/diagnostics/errorCollector';
import { DiagnosticEngine } from './src/services/diagnostics/diagnosticEngine';
import { FixEngine } from './src/services/diagnostics/fixEngine';

async function runTests() {
  console.log('🧪 Running Developer Diagnostics Unit Tests...\n');

  // Test 1: Secret Sanitization
  console.log('1️⃣  Testing DiagnosticSanitizer...');
  const sensitiveStr = 'Failed login with key: AIzaSyDASyJIPuvho1GsFpUp7n5PLMdLcqKQrI0 and password: secretpassword123';
  const sanitizedStr = DiagnosticSanitizer.sanitizeString(sensitiveStr);

  if (sanitizedStr.includes('secretpassword123') || sanitizedStr.includes('AIzaSy')) {
    console.error('❌ Sanitizer failed to redact API key/password:', sanitizedStr);
    process.exit(1);
  } else {
    console.log('  ✅ Secret Sanitization passed.');
  }

  // Test 2: Error Collector
  console.log('2️⃣  Testing ErrorCollector...');
  ErrorCollector.clearErrors();
  ErrorCollector.captureError(new Error('Test API error'), {
    subsystem: 'TEST_SUBSYSTEM',
    category: 'API_FAILURE',
    severity: 'ERROR',
  });

  const errors = ErrorCollector.getRecentErrors();
  if (errors.length !== 1 || errors[0].subsystem !== 'TEST_SUBSYSTEM') {
    console.error('❌ ErrorCollector failed to capture error correctly');
    process.exit(1);
  } else {
    console.log('  ✅ ErrorCollector passed.');
  }

  // Test 3: System Health Summary
  console.log('3️⃣  Testing DiagnosticEngine.getSystemHealth...');
  const health = await DiagnosticEngine.getSystemHealth('http://localhost:3000');
  if (!health.overallStatus || !health.subsystems.server) {
    console.error('❌ DiagnosticEngine health check failed');
    process.exit(1);
  } else {
    console.log(`  ✅ Health check passed. Overall Status: ${health.overallStatus}`);
  }

  // Test 4: Fix Report Generator
  console.log('4️⃣  Testing FixEngine.generateFixReport...');
  const fixReport = await FixEngine.generateFixReport({
    id: 'TEST-1',
    category: 'METADATA_MISSING',
    severity: 'WARNING',
    timestamp: new Date().toISOString(),
    subsystem: 'CATALOG',
    affectedFile: 'src/utils/posterResolver.ts',
    errorMessage: 'Show poster path missing',
    probableCause: 'Poster URL empty',
    confidenceLevel: 'HIGH',
    recommendedFix: 'Add fallback image',
    verificationProcedure: 'Inspect poster',
  });

  if (!fixReport.problem || !fixReport.verificationSteps.length) {
    console.error('❌ FixEngine failed to produce FixReport');
    process.exit(1);
  } else {
    console.log('  ✅ FixEngine report generation passed.');
  }

  // Test 5: Deployment Guardian
  console.log('5️⃣  Testing DeploymentGuardian...');
  const { DeploymentGuardian } = await import('./src/services/diagnostics/deploymentGuardian');
  const preResult = await DeploymentGuardian.runPreDeployCheck();
  if (!preResult.checks.length) {
    console.error('❌ DeploymentGuardian pre-deploy failed');
    process.exit(1);
  } else {
    console.log(`  ✅ DeploymentGuardian pre-deploy passed with ${preResult.checks.length} checks.`);
  }

  console.log('\n🎉 ALL DIAGNOSTICS UNIT TESTS PASSED PERFECTLY!\n');
}

runTests().catch((err) => {
  console.error('💥 Test suite crashed:', err);
  process.exit(1);
});
