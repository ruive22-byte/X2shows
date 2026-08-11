const fs = require('fs');

let watch = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');

if (!watch.includes("import { assertIdentity, ContentIdentityMismatchError }")) {
    watch = watch.replace(
      "import { ContentIdentityValidator } from '../services/resolvers/ContentIdentityValidator';",
      "import { ContentIdentityValidator, assertIdentity, ContentIdentityMismatchError } from '../services/resolvers/ContentIdentityValidator';"
    );
}

const target = `      const checkedCandidate = await NewStreamResolver.checkCandidate(candidate);`;
const replace = `      // Verify Identity BEFORE Activation
      try {
          assertIdentity(
              orchestratedMedia.resolution.identity,
              candidate.identity
          );
      } catch (e) {
          if (e instanceof ContentIdentityMismatchError) {
              setPlaybackError("IDENTITY_MISMATCH: The selected candidate violates the required media identity. Rejecting source.");
              setPlaybackHealth("failed");
              tryCandidate(idx + 1);
              return;
          }
      }

      const checkedCandidate = await NewStreamResolver.checkCandidate(candidate);`;

if (!watch.includes("Verify Identity BEFORE Activation")) {
    watch = watch.replace(target, replace);
}

fs.writeFileSync('src/components/WatchPage.tsx', watch);
