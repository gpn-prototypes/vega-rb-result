import createReducer from "@/utils/create-reducer";

import { ClearActionTypes } from '../clear/action-types';

import { ProjectStructureActionTypes } from './action-types';

import initialState from './initial-state';

import { ProjectStructureQuery, ProjectStructureState } from '@/types/redux-store';

const setProjectStructureQuerySuccessStrategy = (
  state: ProjectStructureState,
  { projectStructureQuery }: { projectStructureQuery: ProjectStructureQuery },
): ProjectStructureState => ({
  ...state,
  projectStructureQuery,
});

const clearStoreStrategy = (): ProjectStructureState => ({
  ...initialState,
});

const strategyMap = {
  [ProjectStructureActionTypes.SET_PROJECT_STRUCTURE_QUERY]: setProjectStructureQuerySuccessStrategy,
  [ClearActionTypes.CLEAR_STORES]: clearStoreStrategy,
};

const projectStructureReducer = createReducer(strategyMap, initialState);

export default projectStructureReducer;
