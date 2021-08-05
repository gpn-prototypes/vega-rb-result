const defaultStrategy = (state: any) => state;

function createReducer(strategyMap: Record<string, any>, initialState: any) {
  return (state = initialState, action: any): any => {
    return strategyMap[action.type] !== undefined
      ? strategyMap[action.type](state, action)
      : defaultStrategy(state);
  };
}

export default createReducer;
