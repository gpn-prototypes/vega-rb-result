import React from 'react';
import { Button, Root } from '@gpn-prototypes/vega-ui';

import { AppConfig } from '../../app-config';

import './App.css';

declare global {
  interface Window {
    appConfig: AppConfig;
  }
}

export const App = (): React.ReactElement => {
  return (
    <Root className="App" defaultTheme="dark" initialPortals={[{ name: 'portalRoot' }]}>
      <Button label="Кнопка" />
    </Root>
  );
};
