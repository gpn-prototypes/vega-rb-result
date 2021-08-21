import { ConceptionInput, RbProjectInput } from '@app/generated/graphql';

const baseApiUrl = process.env.BASE_API_URL;

export const getGraphqlUri = (projectId: string): string =>
  `${baseApiUrl}/graphql/${projectId}`;

export const wrapConception = (conception: ConceptionInput): RbProjectInput => {
  return {
    version: '0.1.0',
    conceptions: [conception],
  };
};
