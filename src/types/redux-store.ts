export interface ProjectStructureQuery {
  query: string;
}

export type ProjectStructureState = {
  projectStructureQuery?: ProjectStructureQuery;
};

export type StoreRES = {
  projectStructure: ProjectStructureState;
};


