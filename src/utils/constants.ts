export const ADMIN_CREDENTIALS = {
  identifier: '+963980453436',
  identifierWithoutPlus: '963980453436',
  password: '12345678',
} as const;

export const ADMIN_USER = {
  id: 1,
  name: 'admin',
  national_id: '00000000000',
  identifier: '+963980453436',
  role: 'admin',
} as const;

export const ADMIN_TOKEN = 'admin_token_963980453436';

export const normalizeIdentifier = (identifier: string): string => {
  const trimmed = identifier.trim();
  if (trimmed === ADMIN_CREDENTIALS.identifierWithoutPlus || trimmed === ADMIN_CREDENTIALS.identifier) {
    return ADMIN_CREDENTIALS.identifier;
  }
  if (trimmed.startsWith('+')) {
    return trimmed;
  }
  return trimmed;
};

export const isAdminIdentifier = (identifier: string): boolean => {
  const normalized = normalizeIdentifier(identifier);
  return normalized === ADMIN_CREDENTIALS.identifier;
};

