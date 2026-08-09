export interface CodeSymbol {
  filePath: string;
  imports: string[];
  exports: string[];
  componentNames: string[];
}

export class ASTCodeIndexer {
  private static symbolMap: Map<string, CodeSymbol> = new Map();

  /**
   * Scans raw file content and generates a lightweight symbol footprint.
   */
  public static indexFile(filePath: string, content: string): void {
    const importMatches = Array.from(content.matchAll(/import\s+.*?from\s+['"](.*?)['"]/g)).map(m => m[1]);
    const exportMatches = Array.from(content.matchAll(/export\s+(?:const|function|class|type)\s+([A-Za-z0-9_]+)/g)).map(m => m[1]);
    const componentMatches = Array.from(content.matchAll(/const\s+([A-Z][A-Za-z0-9_]*)\s*:\s*React\.FC/g)).map(m => m[1]);

    this.symbolMap.set(filePath, {
      filePath,
      imports: importMatches,
      exports: exportMatches,
      componentNames: componentMatches,
    });
  }

  /**
   * Generates a compact manifest (~500 tokens) representing the codebase structure.
   */
  public static getCompactRepoMap(): string {
    let summary = "CODEBASE MANIFEST:\n";
    this.symbolMap.forEach((sym, path) => {
      summary += `- ${path} | Components: [${sym.componentNames.join(', ')}] | Exports: [${sym.exports.join(', ')}]\n`;
    });
    return summary;
  }
}
