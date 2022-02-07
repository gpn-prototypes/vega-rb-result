import React, { useMemo } from 'react';
import { CurrentProject, Identity, Project } from '@app/types';

interface IProps {
  currentProject: CurrentProject;
  identity: Identity;
}

interface ProjectContextProps {
  project: Project;
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
}) => {
  const providerValue = useMemo(() => {
    return {
      project: currentProject.get(),
      identity,
    };
  }, [currentProject, identity]);

  return (
    <ProjectContext.Provider value={providerValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
