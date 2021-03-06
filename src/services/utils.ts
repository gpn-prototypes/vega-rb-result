import { ConceptionInput, RbProjectInput } from '@app/generated/graphql';

export const getBaseApiUrl = (): string => {
  if (!process.env.BASE_API_URL || process.env.BASE_API_URL === '/') {
    return window.location.origin;
  }

  return process.env.BASE_API_URL.indexOf('://') > -1
    ? process.env.BASE_API_URL
    : window.location.origin + process.env.BASE_API_URL;
};

export const isSecureBaseApiUrl = (): boolean => {
  if (!process.env.HTTP_SCHEME) {
    return false;
  }

  return process.env.HTTP_SCHEME === 'https';
};

export const getGraphqlUri = (projectId: string): string =>
  `${getBaseApiUrl()}/graphql/${projectId}`;

export const getDownloadResultUri = (
  id: string,
  statistics: boolean,
  samples: boolean,
  plots: boolean,
): string =>
  `${getBaseApiUrl()}/files/calculation_result/${id}?statistics=${statistics}&samples=${samples}&plots=${plots}`;

export const wrapConception = (conception: ConceptionInput): RbProjectInput => {
  return {
    version: '0.1.0',
    conceptions: [conception],
  };
};
