import React, { useEffect, useState } from 'react';

import { rbResultService } from '@app/utils/rb-result-service';
import {ShellToolkit} from "@app/types";

export interface ProjectContextData {
  projectId: string;
  initialized: boolean;
}

const ProjectContext = React.createContext<ProjectContextData>({
  projectId: '',
  initialized: false,
});

const ProjectProvider: React.FC<ShellToolkit> = (props) => {
  const { children, graphqlClient, identity, currentProject } = props;

  const projectId = currentProject?.get()?.vid || '';
  const projectVersion = currentProject?.get()?.version || 1;

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    rbResultService.init({
      client: graphqlClient,
      projectId,
      projectVersion,
      identity,
    });

    setInitialized(true);
  }, [identity, graphqlClient, projectId, projectVersion]);

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        initialized,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
