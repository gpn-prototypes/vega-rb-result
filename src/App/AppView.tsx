import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '@gpn-prototypes/vega-ui';

import { cnApp } from './cn-app';

import './App.css';
import '../styles/colors.css';

import { fetchProjectSchema } from '@/redux-store/project-structure/actions';
import { StoreRES } from '@/types/redux-store';
import {ProjectContext} from "@/react-context";
import ResultPage from "@/pages/RbResult/ResultPage";

export const AppView = (): React.ReactElement => {
  const dispatch = useDispatch();

  const { initialized } = useContext(ProjectContext);

  const isLoading = useSelector<StoreRES, boolean>(
    (state) => !state.projectStructure.projectStructureQuery,
  );

  useEffect(() => {
    if (initialized) {
      dispatch(fetchProjectSchema());
    }
  }, [dispatch, initialized]);

  return (
    <div className={cnApp('App')}>
      {isLoading ? <Loader size="m" /> : <ResultPage />}
    </div>
  );
};
