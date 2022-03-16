import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { DomainObject, RbDomainEntityIcons } from '@app/generated/graphql';
import type { History } from 'history';

type ProjectVID = string;

export interface Project {
  vid: ProjectVID;
  version: number;
}

export interface CurrentProject {
  get(): Project;
}

export interface Identity {
  getToken(): Promise<string>;
}

export interface ShellToolkit {
  graphqlClient: ApolloClient<NormalizedCacheObject>;
  identity: Identity;
  currentProject: CurrentProject;
  history: History<unknown>;
}

interface Structure {
  __typename?: string;
}

export interface GeoCategory extends Structure {
  name: string;
  icon: RbDomainEntityIcons;
  code: string;
  visible?: {
    table: boolean;
    calc: boolean;
    tree: boolean;
  };
}

export interface CalculationParam extends Structure {
  code: string;
  name: string;
  shortName: string;
  units: string;
  decimalPlace: number;
}

export interface Risk extends Structure {
  code: string;
  name: string;
}

export interface ProjectStructure {
  domainEntities: GeoCategory[];
  calculationParameters: CalculationParam[];
  risks: Risk[];
  domainObjects: DomainObject[];
}

export type TableStructures = GeoCategory | CalculationParam | Risk;

export type Nullable<T> = T | null;

export type DomainObjectsProps = {
  domainEntitiesColumns: any[];
  attributeColumns: any[];
  riskColumns: any[];
  rows: any[];
};

export type NoopFunction<T, R = void> = (data: T) => R;

export interface IData<T> {
  code: string;
  value: Nullable<T>;
}

export interface IValuableStructure {
  value: string;
}
