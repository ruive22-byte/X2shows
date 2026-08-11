const fs = require('fs');
let auth = fs.readFileSync('src/components/Auth.tsx', 'utf-8');

const shortcutDiv = `<div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2 text-slate-500 font-mono">or shortcut</span>
          </div>
        </div>`;

auth = auth.replace(shortcutDiv, "");
fs.writeFileSync('src/components/Auth.tsx', auth);
