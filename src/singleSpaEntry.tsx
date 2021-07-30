import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

import './set-public-path';

import { App } from './App/App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  suppressComponentDidCatchWarning: true,
} as singleSpaReact.Options);

export const { bootstrap, mount, unmount } = lifecycles;
