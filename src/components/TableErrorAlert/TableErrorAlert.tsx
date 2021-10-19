import React, { useEffect, useMemo, useState } from 'react';
import { RbErrorCodes } from '@app/generated/graphql';
import useGetError from '@app/hooks/useGetError';
import { ErrorWrapper } from '@app/types/typesTable';
import { Item } from '@consta/uikit/SnackBar';
import { IconAlert, SnackBar } from '@gpn-prototypes/vega-ui';
import { defaultTo, get } from 'lodash/fp';

import { cnTableErrorAlert } from './cn-table-error-alert';

import './TableErrorAlert.css';

const errorMessages = {
  [RbErrorCodes.DuplicatingColumns]:
    'Требуется проверка названий столбцов. Названия не являются уникальными',
  [RbErrorCodes.IdenticalRowInTableData]:
    'В таблице есть одинаковые строки. Удалите их или отредактируйте, чтобы запустить расчет',
  [RbErrorCodes.MustBeAtLeastOneCell]:
    'Недостаточно данных. Для выполнения расчета в строке таблицы структуры должна быть заполнена хотя бы одна ячейка',
  [RbErrorCodes.EmptyDomainEntities]:
    'Для запуска расчёта необходимо добавить объекты',
};

export const TableErrorAlert: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [, errors] = useGetError();
  const tableRowErrors = useMemo(
    () =>
      Object.keys(errors)
        .filter((key) => key.match('row'))
        .map((key) => errors[key]),
    [errors],
  );

  const tableColumnError = useMemo<ErrorWrapper>(
    () => errors[RbErrorCodes.DuplicatingColumns],
    [errors],
  );

  const emptyTableError = useMemo(
    () => errors[RbErrorCodes.EmptyDomainObjects],
    [errors],
  );

  useEffect(() => {
    const generateItem = (errorCode: RbErrorCodes): Item => ({
      key: errorCode,
      message: defaultTo('', get([errorCode], errorMessages)),
      icon: IconAlert,
      status: 'alert',
      onClose: () => {
        setItems((prevArr) => prevArr.filter(({ key }) => key !== errorCode));
      },
    });

    if (tableColumnError) {
      setItems((prevState) => [
        ...prevState,
        generateItem(RbErrorCodes.DuplicatingColumns),
      ]);
    }

    if (tableRowErrors.length) {
      const errorCodes = Array.from(
        new Set(
          tableRowErrors
            .flatMap((errorWrapper) => Object.values(errorWrapper))
            .map((error) => error.code),
        ),
      );

      const newTableRowErrors: Item[] = errorCodes.map((errorCode) =>
        generateItem(errorCode),
      );

      setItems((prevState) => {
        return [...prevState, ...newTableRowErrors];
      });
    }

    if (emptyTableError) {
      setItems((prevItems) => [
        ...prevItems,
        generateItem(RbErrorCodes.EmptyDomainEntities),
      ]);
    }
  }, [emptyTableError, tableColumnError, tableRowErrors]);

  return (
    <div className={cnTableErrorAlert()}>
      <SnackBar items={items} />
    </div>
  );
};
