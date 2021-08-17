import { Config as DiffPatcherConfig } from 'jsondiffpatch';
import * as jsonDiffPatch from 'jsondiffpatch';

export const getDiffPatcher = (): jsonDiffPatch.DiffPatcher => {
  const diffPatcherConfig: DiffPatcherConfig = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectHash(item: any, index: number) {
      return item?.vid || item?.code || `$$index:${index}`;
    },
    textDiff: {
      minLength: Infinity,
    },
    propertyFilter(name: string, context: jsonDiffPatch.DiffContext) {
      const isDomainObjectVisibleProperty =
        name === 'visible' && context.parent?.childName === 'domainObjects';

      return (
        !['__typename', 'version', 'vid', 'visibleValue'].includes(name) &&
        !isDomainObjectVisibleProperty
      );
    },
  };

  return jsonDiffPatch.create(diffPatcherConfig);
};
