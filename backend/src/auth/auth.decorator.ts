import { SetMetadata } from '@nestjs/common';

export const CLAIMS_KEY = 'claims';
export const IS_PUBLIC_KEY = 'isPublic';
export const ANY_CLAIMS_KEY = 'anyClaims';

export const RequireClaims = (
  ...claims: string[]
): ReturnType<typeof SetMetadata> => SetMetadata(CLAIMS_KEY, claims);

export const RequireAnyClaims = (
  ...claims: string[]
): ReturnType<typeof SetMetadata> => SetMetadata(ANY_CLAIMS_KEY, claims);

export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(IS_PUBLIC_KEY, true);

export const RequireClaim = (claim: string): ReturnType<typeof SetMetadata> =>
  SetMetadata(CLAIMS_KEY, [claim]);
