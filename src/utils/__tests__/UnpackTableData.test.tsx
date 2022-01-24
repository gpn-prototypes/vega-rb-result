import { AttributesMock } from '../../__tests__/AttributesMock';
import { DomainEntitiesMock } from '../../__tests__/DomainEntitiesMock';
import { DomainObjectsMock } from '../../__tests__/DomainObjectsMock';
import {
  Column,
  RowEntity,
} from '../../components/TableResultRbController/TableResultRb/types';
import { RbDomainEntityInput } from '../../generated/graphql';
import {
  getNameWithParents,
  prepareColumns,
  prepareRows,
  unpackTableData,
} from '../unpackTableData';

function isCorrectCompileColumns(columns: Column<RbDomainEntityInput>[]) {
  return (
    columns.find(
      (column) =>
        column.accessor === undefined ||
        column.title === undefined ||
        column.renderCell === undefined ||
        column.visible === undefined,
    ) === undefined
  );
}

function isCorrectCompileRows(rows: RowEntity[]) {
  return (
    rows.find((row) => {
      return (
        Object.keys(row).find((key: string) => {
          const currentEntity = row[key];

          return (
            currentEntity.code === undefined ||
            currentEntity.value === undefined ||
            currentEntity.formattedValue === undefined
          );
        }) === undefined
      );
    }) === undefined
  );
}

describe('UnpackTableData', () => {
  test('prepareColumns', async () => {
    const columns = prepareColumns({
      domainEntities: DomainEntitiesMock,
      attributes: AttributesMock,
      domainObjects: DomainObjectsMock,
    });

    expect(isCorrectCompileColumns(columns)).toEqual(true);
  });

  test('prepareRows', async () => {
    const rows = prepareRows({
      domainEntities: DomainEntitiesMock,
      attributes: AttributesMock,
      domainObjects: DomainObjectsMock,
    });

    expect(isCorrectCompileRows(rows)).toEqual(true);
  });

  test('getNameWithParents', async () => {
    const rows = prepareRows({
      domainEntities: DomainEntitiesMock,
      attributes: AttributesMock,
      domainObjects: DomainObjectsMock,
    });

    const nameWithParents = getNameWithParents(
      0,
      rows[0],
      DomainEntitiesMock[0],
      DomainEntitiesMock,
    );

    const nameWithParentsSecondRow = getNameWithParents(
      0,
      rows[1],
      DomainEntitiesMock[1],
      DomainEntitiesMock,
    );

    const nameWithParentsNotRoot = getNameWithParents(
      1,
      rows[0],
      DomainEntitiesMock[0],
      DomainEntitiesMock,
    );

    const nameWithParentsNotRoot2 = getNameWithParents(
      2,
      rows[0],
      DomainEntitiesMock[0],
      DomainEntitiesMock,
    );

    expect(nameWithParents).toEqual('концепция 1');
    expect(nameWithParentsSecondRow).toEqual('Архангеловский');
    expect(nameWithParentsNotRoot).toEqual('концепция 1,Архангеловский');
    expect(nameWithParentsNotRoot2).toEqual(
      'концепция 1,Архангеловский,2_Месторождение',
    );
  });

  test('unpackTableData', async () => {
    const { columns, rows, version } = unpackTableData(
      {
        domainEntities: DomainEntitiesMock,
        attributes: AttributesMock,
        domainObjects: DomainObjectsMock,
      },
      1,
      jest.fn(),
    );

    expect(isCorrectCompileColumns(columns)).toEqual(true);
    expect(version).toEqual(1);
    expect(isCorrectCompileRows(rows)).toEqual(true);
  });
});
