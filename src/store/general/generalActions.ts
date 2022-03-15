import actionCreatorFactory from 'typescript-fsa';

const factory = actionCreatorFactory('general');

export const GeneralActions = {
  resetState: factory('RESET_STATE'),
};
