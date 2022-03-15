import React, { useMemo } from 'react';
import { CurrentProject, Identity, Project } from '@app/types';
import { History } from 'history';

interface IProps {
  currentProject: CurrentProject;
  identity: Identity;
  history: History<unknown>;
}

interface ProjectContextProps {
  project: Project;
  history?: History<unknown>;
  identity?: Identity;
}

const ProjectContext = React.createContext<ProjectContextProps>({
  project: {
    vid: '',
    version: 0,
  },
});

const ProjectProvider: React.FC<IProps> = ({
  currentProject,
  identity,
  children,
  history,
}) => {
  const providerValue = useMemo(() => {
    return {
      project: currentProject.get(),
      identity,
      history,
    };
  }, [currentProject, identity, history]);

  return (
    <ProjectContext.Provider value={providerValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
