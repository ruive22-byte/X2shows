const fs = require('fs');

let auth = fs.readFileSync('src/components/Auth.tsx', 'utf-8');
auth = auth.replace(/const handleQuickAutoLogin = useCallback\([\s\S]*?\}, \[\]\);/, "");
auth = auth.replace(/\/\/ Keyboard shortcut \(Ctrl \+ Shift \+ A\) to automatically sign in[\s\S]*?\}, \[handleQuickAutoLogin\]\);/, "");

fs.writeFileSync('src/components/Auth.tsx', auth);
