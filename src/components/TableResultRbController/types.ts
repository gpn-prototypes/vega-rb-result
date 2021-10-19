import { ProjectStructureInput } from '@app/generated/graphql';

interface Conception {
  probability: string | null;
  structure: ProjectStructureInput;
  name?: string;
}

export interface TemplateProjectData {
  resourceBase: {
    project: {
      template: {
        version: string;
        conceptions: Conception[];
      };
    };
  };
}
