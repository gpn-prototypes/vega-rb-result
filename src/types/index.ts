import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

export interface Identity {
  getToken(): Promise<string>;
}

type ProjectVID = string;

interface Project {
  vid: ProjectVID;
  version: number;
}

export interface CurrentProject {
  get(): Project | null;
}

export interface ShellToolkit {
  graphqlClient?: ApolloClient<NormalizedCacheObject>;
  identity?: Identity;
  currentProject?: CurrentProject;
}
