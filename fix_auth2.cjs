const fs = require('fs');
let auth = fs.readFileSync('src/components/Auth.tsx', 'utf-8');

const badButton = `        <button
          type="button"
          onClick={handleQuickAutoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-cyan-400 hover:text-cyan-300 font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
          title="Auto Sign-In as sylenul (Ctrl+Shift+A)"
        >
          <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Quick Secure Access</span>
        </button>`;

auth = auth.replace(badButton, "");
fs.writeFileSync('src/components/Auth.tsx', auth);
