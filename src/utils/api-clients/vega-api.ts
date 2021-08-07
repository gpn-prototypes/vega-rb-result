import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'cross-fetch';

import { getProjectId } from '../project-id';
import { authHeader } from '../set-auth-token';

import { config } from '@app/config/config.public';

const headers = {
  ...authHeader(config.authToken),
};

export const getMainLink = (): HttpLink =>
  new HttpLink({
    uri: `${config.baseApiUrl}/graphql`,
    headers,
    fetch,
  });

export const getProjectLink = (): HttpLink =>
  new HttpLink({
    uri: `${config.baseApiUrl}/graphql/${getProjectId()}`,
    headers,
    fetch,
  });

export const vegaApi = new ApolloClient({
  link: new HttpLink({ uri: `${config.baseApiUrl}/graphql`, headers, fetch }),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          logic: {
            merge: false,
          },
          domain: {
            merge: false,
          },
        },
      },
    },
  }),
});
