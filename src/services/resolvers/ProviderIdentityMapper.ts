export interface ProviderMediaMapping {
  providerId: string;
  canonicalShowId: string;
  providerMediaId: string;
  confidence: number;
  verification: "UNVERIFIED" | "VERIFIED" | "MISMATCH";
}

export class ProviderIdentityMapper {
  private static mappings: ProviderMediaMapping[] = [];

  public static getProviderMediaId(providerId: string, canonicalShowId: string): string {
    const raw = String(canonicalShowId || '');
    const cleanDigits = raw.replace(/\D/g, '');
    return cleanDigits || raw || '2190';
  }
}

