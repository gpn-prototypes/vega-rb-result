import React from 'react';
import { Root } from '@gpn-prototypes/vega-ui';

import { AppView } from './AppView';
import { cnApp } from './cn-app';

import './App.css';

import { Providers } from '@app/react-context';
import {ShellToolkit} from "@app/types";


export const App: React.FC<ShellToolkit> = (props) => {
  const { graphqlClient, identity, currentProject } = props;

  return (
    <Root
      initialPortals={[{ name: 'modalRoot' }]}
      defaultTheme="dark"
      className={cnApp('App-Wrapper').toString()}
    >
      <Providers currentProject={currentProject} graphqlClient={graphqlClient} identity={identity}>
        <AppView />
      </Providers>
    </Root>
  );
};
