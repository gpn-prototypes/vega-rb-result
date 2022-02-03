import { ConceptionInput, RbProjectInput } from '@app/generated/graphql';

export const getBaseApiUrl = (): string => {
  if (!process.env.BASE_API_URL || process.env.BASE_API_URL === '/') {
    return window.location.origin;
  }

  return process.env.BASE_API_URL.indexOf('://') > -1
    ? process.env.BASE_API_URL
    : window.location.origin + process.env.BASE_API_URL;
};

export const getGraphqlUri = (projectId: string): string =>
  `${getBaseApiUrl()}/graphql/${projectId}`;

// TODO: добавить plots: boolean, когда появится на бэке
export const getDownloadResultUri = (
  id: string,
  statistics: boolean,
  samples: boolean,
): string =>
  `${getBaseApiUrl()}/files/calculation_result/${id}?statistics=${statistics}&samples=${samples}`;

export const wrapConception = (conception: ConceptionInput): RbProjectInput => {
  return {
    version: '0.1.0',
    conceptions: [conception],
  };
};
