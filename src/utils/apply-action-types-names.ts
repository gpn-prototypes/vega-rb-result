import Prefixer from './prefixier';

function applyActionTypesNames(actionTypes: Record<string, string>, prefix: string): void {
  const prefixer = new Prefixer(prefix, { delimiter: '_' });

  Object.keys(actionTypes).forEach((type) => {
    // eslint-disable-next-line no-param-reassign
    actionTypes[type] = prefixer.applyTo(type);
  });
}

export { applyActionTypesNames };
