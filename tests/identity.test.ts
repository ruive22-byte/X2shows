import { assertIdentity, ContentIdentityMismatchError } from '../src/services/resolvers/ContentIdentityValidator';

try {
  assertIdentity(
    { showId: '123', seasonNumber: 1, episodeNumber: 2 },
    { showId: '123', seasonNumber: 1, episodeNumber: 2 }
  );
  console.log("PASS: Exact match");
} catch(e) {
  console.error("FAIL: Exact match should pass");
}

try {
  assertIdentity(
    { showId: '123', seasonNumber: 1, episodeNumber: 2 },
    { showId: '124', seasonNumber: 1, episodeNumber: 2 }
  );
  console.error("FAIL: Mismatch showId should throw");
} catch(e) {
  if (e instanceof ContentIdentityMismatchError) {
    console.log("PASS: Mismatch showId throws correctly");
  }
}
