import {
  ApolloClient,
  DocumentNode,
  FetchPolicy,
  MutationOptions,
  NormalizedCacheObject,
  OperationVariables,
  QueryOptions,
} from '@apollo/client';

//TODO
import {
  PROJECT_STRUCTURE_QUERY,
} from '../queries';

import { config } from '@app/config/config.public';
import { Identity } from '@app/types';

export type Data = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface ObjectGroupUpdateMutationVariables {
  vids: string[];
  vid: string;
  version?: number;
}

export interface ObjectGroupCreateMutationVariables {
  name: string;
  version?: number;
}

export interface ServiceConfig {
  client?: ApolloClient<NormalizedCacheObject>;
  identity?: Identity;
  projectId: string;
  fetchPolicy: FetchPolicy;
  getDiffResolvingConfig: () => Data;
}

export interface ServiceInitProps {
  client?: ApolloClient<NormalizedCacheObject>;
  identity?: Identity;
  projectId: string;
  projectVersion: number;
}

class RbResultService {
  private _client: ApolloClient<NormalizedCacheObject> | undefined;

  private _projectId = '';

  private _identity: Identity | undefined;

  private _fetchPolicy: FetchPolicy = 'no-cache';

  private _projectVersion = 1;

  private _isMutationConflict = false;

  get client() {
    return this._client;
  }

  get isMutationConflict() {
    return this._isMutationConflict;
  }

  get projectId() {
    return this._projectId;
  }

  get projectVersion() {
    return this._projectVersion;
  }

  get identity() {
    return this._identity;
  }

  get fetchPolicy() {
    return this._fetchPolicy;
  }

  setIsMutationConflictResolved() {
    this._isMutationConflict = false;
  }

  setProjectVersion(version: number | undefined) {
    if (typeof version === 'number') {
      this._projectVersion = version;
    }
  }

  public getGraphQlUri() {
    return `${config.baseApiUrl}/graphql/${this.projectId}`;
  }

  init({ client, identity, projectId, projectVersion }: ServiceInitProps): void {
    this._client = client;
    this._identity = identity;
    this._projectVersion = projectVersion;
    this._projectId = projectId;
  }

  query(body: DocumentNode, projectQuery?: boolean, options?: Partial<QueryOptions>) {
    let request: QueryOptions = {
      ...options,
      query: body,
    };

    if (projectQuery) {
      request = {
        ...request,
        context: {
          uri: this.getGraphQlUri(),
        },
        fetchPolicy: this._fetchPolicy,
      };
    }

    return this.client?.watchQuery(request).result();
  }

  async mutation(body: DocumentNode, variables: OperationVariables) {
    const request: MutationOptions = {
      mutation: body,
      variables: { version: this.projectVersion, ...variables },
      context: {
        uri: this.getGraphQlUri(),
        projectDiffResolving: this.getDiffResolvingConfig(),
      },
    };

    try {
      const response = await this.client?.mutate(request);

      if (response?.errors) {
        return undefined;
      }

      return response;
    } catch (err) {
      throw new Error(err);
    }
  }

  public projectStructureQuery() {
    return this.query(PROJECT_STRUCTURE_QUERY, false, {
      fetchPolicy: this._fetchPolicy,
      variables: {
        projectId: this.projectId,
      },
    });
  }

  public getDiffResolvingConfig() {
    return {
      maxAttempts: 20,
      errorTypename: 'UpdateProjectInnerDiff',
      mergeStrategy: {
        default: 'smart',
      },
      projectAccessor: {
        fromDiffError: (data: Record<string, unknown>) => ({
          remote: data.remoteProject,
          local: {
            vid: this.projectId,
            version: this.projectVersion,
          },
        }),
        fromVariables: (vars: Record<string, any>) => ({
          ...vars,
        }),
        toVariables: (vars: Record<string, unknown>, patched: Record<string, any>) => {
          this.setProjectVersion(patched.version);
          this._isMutationConflict = true;

          return {
            ...vars,
            ...patched,
            vid: vars.vid,
            version: patched.version,
          };
        },
      },
    };
  }
}

export const rbResultService = new RbResultService();
