import fs from 'fs';
import path from 'path';

console.log('🛡️  Running X2Shows Architecture Guard Check...\n');

let errors: string[] = [];
let warnings: string[] = [];

const projectRoot = process.cwd();

// 1. Check package.json for unauthorized packages (Next.js)
const packageJsonPath = path.join(projectRoot, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  errors.push('CRITICAL: package.json is missing!');
} else {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (allDeps['next']) {
    errors.push('FORBIDDEN DEPENDENCY DETECTED: "next" is in package.json. X2Shows is strictly a Vite + React + Express app!');
  } else {
    console.log('✅ Package dependencies verified (No Next.js detected).');
  }

  // Verify build script
  if (!pkg.scripts?.build || !pkg.scripts.build.includes('vite build')) {
    errors.push('BUILD SCRIPT INVALID: package.json "build" script must use "vite build".');
  } else {
    console.log('✅ Build script verified (Uses Vite + esbuild for Express).');
  }
}

// 2. Check for Next.js forbidden files/directories
const forbiddenFiles = [
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'next.config.cjs',
  '.next'
];

forbiddenFiles.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  if (fs.existsSync(filePath)) {
    errors.push(`FORBIDDEN FILE/DIRECTORY DETECTED: "${file}". Next.js artifacts are strictly prohibited in this architecture.`);
  }
});
if (!forbiddenFiles.some(f => fs.existsSync(path.join(projectRoot, f)))) {
  console.log('✅ No Next.js config files or .next directories found.');
}

// 3. Verify Vite config exists
const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
if (!fs.existsSync(viteConfigPath)) {
  errors.push('MISSING VITE CONFIG: vite.config.ts does not exist!');
} else {
  console.log('✅ vite.config.ts present.');
}

// 4. Verify Express server.ts exists
const serverTsPath = path.join(projectRoot, 'server.ts');
if (!fs.existsSync(serverTsPath)) {
  errors.push('MISSING EXPRESS SERVER: server.ts does not exist!');
} else {
  const serverContent = fs.readFileSync(serverTsPath, 'utf-8');
  if (!serverContent.includes('express()')) {
    errors.push('INVALID SERVER: server.ts does not appear to initialize Express.');
  } else {
    console.log('✅ server.ts Express backend verified.');
  }
}

// 5. Verify vercel.json API rewrites
const vercelJsonPath = path.join(projectRoot, 'vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  errors.push('MISSING VERCEL CONFIG: vercel.json does not exist!');
} else {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
    const apiRewrite = vercelConfig.rewrites?.find((r: any) => r.source === '/api/(.*)');
    if (!apiRewrite || apiRewrite.destination === '/index.html') {
      errors.push('INVALID VERCEL REWRITE: vercel.json must proxy /api/(.*) to Express backend (Render), NOT to /index.html.');
    } else {
      console.log(`✅ vercel.json verified (Proxies /api/* -> ${apiRewrite.destination}).`);
    }
  } catch (err: any) {
    errors.push(`INVALID VERCEL JSON: Could not parse vercel.json: ${err.message}`);
  }
}

// 6. Verify environment secrets safety
const envExamplePath = path.join(projectRoot, '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  if (envContent.includes('VITE_SESSION_SECRET') || envContent.includes('VITE_SITE_PASSWORD')) {
    errors.push('SECURITY LEAK: SESSION_SECRET or SITE_PASSWORD must NEVER be exposed as VITE_* client variables!');
  } else {
    console.log('✅ Environment variable safety verified (Secrets are server-only).');
  }
}

// Final Report
console.log('\n----------------------------------------');
if (errors.length > 0) {
  console.error('❌ ARCHITECTURE GUARD FAILED\n');
  console.error('Reason(s):');
  errors.forEach((err, idx) => console.error(`  - ${err}`));
  console.error('\n💥 BUILD ABORTED.\n');
  console.error('X2Shows architecture must strictly remain:');
  console.error('  Frontend: Vite + React -> Vercel/Render (serves dist/)');
  console.error('  Backend:  Express / Node.js -> Render (proxied via /api/*)');
  console.log('----------------------------------------\n');
  process.exit(1);
} else {
  console.log('🎉 ARCHITECTURE GUARD PASSED PERFECTLY!');
  console.log('   Architecture: Vite + React Frontend | Express Render Backend | Vercel API Proxied');
  console.log('----------------------------------------\n');
  process.exit(0);
}
