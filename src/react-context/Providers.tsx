import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Loader } from '@gpn-prototypes/vega-ui';
import { PersistGate } from 'redux-persist/es/integration/react';

import { ProjectProvider } from './ProjectProvider';

import { persistor, store } from '@/redux-store';
import { ShellToolkit } from '@/types';
import { vegaApi } from '@/utils/api-clients/vega-api';

export const Providers: React.FC<ShellToolkit> = (props) => {
  const { graphqlClient = vegaApi, identity, currentProject, children } = props;

  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={graphqlClient}>
        <PersistGate loading={<Loader size="m" />} persistor={persistor}>
          <BrowserRouter>
            <ProjectProvider
              currentProject={currentProject}
              graphqlClient={graphqlClient}
              identity={identity}
            >
              {children}
            </ProjectProvider>
          </BrowserRouter>
        </PersistGate>
      </ApolloProvider>
    </ReduxProvider>
  );
};
