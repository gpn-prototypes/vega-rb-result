import React, { useState } from 'react';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import ErrorBoundary from '@app/components/ErrorBoundary';
import { Providers } from '@app/components/Providers';
import RbResultPage from '@app/pages/RbResult/RbResultPage';
import projectService from '@app/services/ProjectService';
import { CurrentProject, Identity, ShellToolkit } from '@app/types';
import { presetGpnDark, Theme } from '@consta/uikit/Theme';
import { useMount } from '@gpn-prototypes/vega-ui';

import './App.scss';

const getInitProps = async ({
  currentProject,
  graphqlClient,
  identity,
}: Partial<ShellToolkit>): Promise<Required<ShellToolkit>> =>
  new Promise<ShellToolkit>((resolve) => {
    if (currentProject && graphqlClient && identity)
      resolve({ currentProject, identity, graphqlClient });
  });

const App: React.FC<Partial<ShellToolkit>> = (props) => {
  const { graphqlClient, identity, currentProject } = props;
  const [isLoading, setIsLoading] = useState(true);

  useMount(() => {
    const init = async () => {
      try {
        const initProps = await getInitProps(props);
        projectService.init({
          client: initProps.graphqlClient,
          project: initProps.currentProject,
          identity: initProps.identity,
        });
      } catch (e) {
        throw Error('Service has been thrown error at initialized step');
      }
    };

    init().finally(() => setIsLoading(false));
  });

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <Theme preset={presetGpnDark} className="rb-result-app__wrapper">
          <Providers
            currentProject={currentProject as CurrentProject}
            graphqlClient={graphqlClient as ApolloClient<NormalizedCacheObject>}
            identity={identity as Identity}
          >
            <div className="rb-result-app">
              {!isLoading && <RbResultPage />}
            </div>
          </Providers>
        </Theme>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
