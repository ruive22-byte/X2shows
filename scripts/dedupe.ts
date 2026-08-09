import { Project, SyntaxKind } from 'ts-morph';

async function runDeduplication() {
  console.log('🔍 Scanning src/data/tmdbData.ts for duplicate entries using ts-morph...');

  const project = new Project();
  const sourceFile = project.addSourceFileAtPath('src/data/tmdbData.ts');

  const catalogVar = sourceFile.getVariableDeclaration('TMDB_ANIMATED_CATALOG');
  const arrayLiteral = catalogVar?.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);

  if (!arrayLiteral) {
    console.error('❌ Could not locate TMDB_ANIMATED_CATALOG array in source file.');
    process.exit(1);
  }

  const seenKeys = new Set<string>();
  const elements = arrayLiteral.getElements();
  let removedCount = 0;

  // Reverse loop ensures safe element removal without index shifts
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const text = element.getText();

    const idMatch = text.match(/id:\s*['"]([^'"]+)['"]/);
    const tmdbIdMatch = text.match(/tmdbId:\s*(\d+)/);
    const titleMatch = text.match(/(?:title|name):\s*['"]([^'"]+)['"]/);
    const mediaTypeMatch = text.match(/mediaType:\s*['"]([^'"]+)['"]/);

    const id = idMatch ? idMatch[1] : null;
    const tmdbId = tmdbIdMatch ? tmdbIdMatch[1] : null;
    const title = titleMatch ? titleMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '') : null;
    const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : 'tv';

    const idKey = id ? `id-${id}` : null;
    const tmdbKey = tmdbId ? `tmdb-${tmdbId}` : null;
    const titleKey = title ? `title-${title}-${mediaType}` : null;

    let isDuplicate = false;

    if (idKey && seenKeys.has(idKey)) isDuplicate = true;
    if (tmdbKey && seenKeys.has(tmdbKey)) isDuplicate = true;
    if (titleKey && seenKeys.has(titleKey)) isDuplicate = true;

    if (isDuplicate) {
      console.log(`🧹 Removing duplicate record: id=${id} tmdbId=${tmdbId} title="${titleMatch ? titleMatch[1] : ''}"`);
      arrayLiteral.removeElement(element);
      removedCount++;
    } else {
      if (idKey) seenKeys.add(idKey);
      if (tmdbKey) seenKeys.add(tmdbKey);
      if (titleKey) seenKeys.add(titleKey);
    }
  }

  if (removedCount > 0) {
    sourceFile.saveSync();
    console.log(`✅ File updated cleanly! Removed ${removedCount} duplicates.`);
  } else {
    console.log('✨ No duplicate keys found in src/data/tmdbData.ts.');
  }
}

runDeduplication().catch(console.error);

