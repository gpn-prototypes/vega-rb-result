import { ConceptionInput, RbProjectInput } from '@app/generated/graphql';

export const getBaseApiUrl = (): string | undefined => {
  if (process.env.BASE_API_URL === undefined) {
    return undefined;
  }
  let baseApiUrl =
    process.env.BASE_API_URL.indexOf('://') > -1
      ? process.env.BASE_API_URL
      : window.location.origin + process.env.BASE_API_URL;

  if (baseApiUrl.slice(-1) === '/') {
    baseApiUrl = baseApiUrl.slice(0, -1);
  }
  return baseApiUrl;
};

export const getGraphqlUri = (projectId: string): string =>
  `${getBaseApiUrl()}/graphql/${projectId}`;

export const getDownloadResultUri = (id: string): string =>
  `${getBaseApiUrl()}/files/calculation_result/${id}`;

export const wrapConception = (conception: ConceptionInput): RbProjectInput => {
  return {
    version: '0.1.0',
    conceptions: [conception],
  };
};
