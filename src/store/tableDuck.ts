import {
  GridCell,
  GridCollection,
  GridColumn,
  GridRow,
} from 'components/ExcelTable/types';
import { cloneDeep, isEqual, set } from 'lodash/fp';
import { ofAction } from '@app/operators/ofAction';
import { Epic } from 'redux-observable';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import actionCreatorFactory, { AnyAction } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { packTableData, unpackTableData } from 'utils';
import { getDiffPatcher } from '@app/utils/diffPatcher';
import { getRowId } from '@app/utils/getRowId';

import errorsDuck from './errorsDuck';
import { EpicDependencies, RootState, TypedColumnsList } from './types';

const factory = actionCreatorFactory('table');

const actions = {
  initState: factory<GridCollection>('INIT_STATE'),
  updateColumns: factory<GridColumn[]>('UPDATE_COLUMNS'),
  updateColumnsByType: factory<TypedColumnsList>('UPDATE_COLUMNS_BY_TYPE'),
  updateRows: factory<GridRow[]>('UPDATE_ROWS'),
  updateCell: factory<GridCell>('UPDATE_CELL'),
  resetState: factory('RESET_STATE'),
  exceptionThrew: factory<{ error: string }>('EXCEPTION_THREW'),
};

const initialState: GridCollection = {
  columns: [],
  rows: [],
  version: 0,
};

const reducer = reducerWithInitialState<GridCollection>(initialState)
  .case(actions.resetState, () => initialState)
  .case(actions.initState, (state, payload) => ({
    ...state,
    rows: payload.rows,
    columns: payload.columns,
    version: payload.version,
  }))
  .case(actions.updateColumns, (state, payload) => ({
    ...state,
    columns: payload,
  }))
  .case(
    actions.updateColumnsByType,
    (state, { columns: newColumns, type: columnsType }) => {
      const columnsTypes = state.columns.map(({ type }) => type);
      const lastIndex = columnsTypes.lastIndexOf(columnsType);
      const firstIndex = columnsTypes.findIndex((type) => type === columnsType);
      const columns = [...state.columns];

      if (lastIndex !== -1 && firstIndex !== -1) {
        columns.splice(
          firstIndex,
          columnsTypes.filter((type) => type === columnsType).length,
          ...newColumns,
        );
      } else if (firstIndex !== -1) {
        columns.splice(firstIndex, 1, ...newColumns);
      }

      return {
        ...state,
        columns,
      };
    },
  )
  .case(actions.updateRows, (state, payload) => ({
    ...state,
    rows: payload,
  }))
  .case(actions.updateCell, (state, { selectedCell, cellData }) => {
    const columnKey = selectedCell.column.key;
    const rowIdx = state.rows.findIndex(
      (row) => selectedCell.row.id?.value === row.id?.value,
    );

    return set(['rows', rowIdx, columnKey], cellData, state);
  });

const diffPatcher = getDiffPatcher();

export const saveToStorageEpic: Epic<
  AnyAction,
  AnyAction,
  RootState,
  EpicDependencies
> = (action$, state$, { projectService }) =>
  action$.pipe(
    ofAction(
      actions.updateColumns,
      actions.updateRows,
      actions.updateCell,
      actions.updateColumnsByType,
    ),
    debounceTime(1500),
    switchMap(() => {
      const saveProject$ = new Observable<AnyAction>((observer) => {
        const localTableState = {
          ...JSON.parse(JSON.stringify(state$.value.table)),
          version: projectService.version,
        };
        if (!isEqual(localTableState, initialState)) {
          projectService
            .saveProject(localTableState)
            .then(async () => {
              const {
                structure: cachedData,
              } = await projectService.getCachedRbData();

              if (cachedData) {
                const structure = await projectService.getStructure();
                const localData = packTableData(localTableState, structure);
                const currentData = packTableData(
                  state$.value.table,
                  structure,
                );
                const diff = diffPatcher.diff(cachedData, localData);
                if (diff) {
                  const localChanges = diffPatcher.diff(localData, currentData);
                  if (localChanges) {
                    const updatedData = diffPatcher.patch(
                      cloneDeep(cachedData),
                      localChanges,
                    );
                    observer.next(
                      actions.initState(
                        unpackTableData(updatedData, projectService.version),
                      ),
                    );
                  } else {
                    observer.next(
                      actions.initState(
                        unpackTableData(cachedData, projectService.version),
                      ),
                    );
                  }
                }
              }
              observer.complete();
            })
            .catch((error) => observer.error(error));
        }

        return function unsubscribe() {
          projectService.abortController.abort();
        };
      });

      return saveProject$.pipe(
        catchError((error) => {
          // eslint-disable-next-line no-console
          console.error(
            'Critical exception by saving project to the server',
            error,
          );
          return of({
            type: actions.exceptionThrew.type,
            payload: error.xhr?.response,
            error: true,
          });
        }),
      );
    }),
  );

export const updateCell: Epic<AnyAction, AnyAction, RootState> = (
  action$,
  state$,
  { projectService },
) =>
  action$.pipe(
    ofAction(actions.updateCell),
    map(({ payload }) => {
      const { column, row } = payload.selectedCell;

      return errorsDuck.actions.removeErrors({
        id: projectService.projectId,
        path: [column.key, getRowId(row)],
      });
    }),
  );

export default {
  reducer,
  actions,
  epics: [saveToStorageEpic, updateCell],
};
