import { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProjectContext } from '@app/components/Providers';
import { TableError } from '@app/generated/graphql';
import { RootState } from '@app/store/types';
import { ColumnErrors } from '@app/types/typesTable';
import { get, getOr } from 'lodash/fp';

type PropertyPath = string | (string | number)[];

export default function useGetError(
  path?: PropertyPath,
): [TableError, ColumnErrors] {
  const errors = useSelector(
    ({ errors: errorsState }: RootState) => errorsState,
  );
  const { vid: projectId } = useContext(ProjectContext).project;
  const errorsList = useMemo<ColumnErrors>(
    () => getOr({}, ['byId', projectId], errors),
    [errors, projectId],
  );
  const getError = (propertyPath?: PropertyPath): TableError => {
    return propertyPath ? get(propertyPath, errorsList) : ({} as TableError);
  };

  return [getError(path), errorsList];
}
