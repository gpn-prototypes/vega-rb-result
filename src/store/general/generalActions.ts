import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('general');

export const GeneralActions = {
  setNotFound: factory<boolean>('SET_NOT_FOUND'),
  resetState: factory('RESET_STATE'),
};
