const fs = require('fs');
let auth = fs.readFileSync('src/components/Auth.tsx', 'utf-8');

auth = auth.replace(
    '</form>',
    `          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>`
);

fs.writeFileSync('src/components/Auth.tsx', auth);
