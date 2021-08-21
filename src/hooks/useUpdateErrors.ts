import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { getSameColumnKeys } from '@app/components/ExcelTable/utils';
import { ProjectContext } from '@app/components/Providers/ProjectProvider';
import { RbErrorCodes } from '@app/generated/graphql';
import { unset } from 'lodash/fp';
import errorsDuck from '@app/store/errorsDuck';
import { NormalizedErrors } from '@app/store/types';
import { Action } from 'typescript-fsa';

import useGetError from './useGetError';
import {ColumnErrors, GridColumn} from "@app/types/typesTable";

type UseUpdateErrors = (
  column: GridColumn,
  columns: GridColumn[],
) => Action<NormalizedErrors>;

function getCleanedErrorsList(
  removedColumn: GridColumn,
  columnList: GridColumn[],
  errors: ColumnErrors,
): ColumnErrors {
  return getSameColumnKeys(removedColumn, columnList).reduce<ColumnErrors>(
    (previousValue, currentValue) =>
      unset([RbErrorCodes.DuplicatingColumns, currentValue], previousValue),
    errors,
  );
}

export default function useUpdateErrors(): UseUpdateErrors {
  const { vid: projectId } = useContext(ProjectContext).project;

  const [, errors] = useGetError();
  const dispatch = useDispatch();

  return (column, columns) =>
    dispatch(
      errorsDuck.actions.updateErrors({
        id: projectId,
        errors: getCleanedErrorsList(column, columns, errors),
      }),
    );
}
