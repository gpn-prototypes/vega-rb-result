import React from 'react';
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
  return (
    <ProjectContext.Provider
      value={{
        project: currentProject.get(),
        identity,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectProvider, ProjectContext };
