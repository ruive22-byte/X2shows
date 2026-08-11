const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
if (!code.includes("dotenv/config")) {
    code = "import 'dotenv/config';\n" + code;
    fs.writeFileSync('server.ts', code);
}
