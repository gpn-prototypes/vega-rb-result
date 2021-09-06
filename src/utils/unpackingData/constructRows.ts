import {
  DomainObject,
  DomainObjectPathLevel,
  GeoObjectCategories,
  ProjectStructure,
  RbDomainEntity,
  RiskValue,
} from '@app/generated/graphql';
import { SpecialColumns } from '@app/model/Table';
import { v4 as uuid } from 'uuid';

import { collectValues, collectValuesWithDistribution } from './collectors';
import {entitiesOptions, GridRow} from "@app/types/typesTable";

function generateEmptyRows(count: number): Array<GridRow> {
  const getOrderNumber = (index: number) => {
    return count === 2 ? index + 1 : Math.abs(count - 2 - index - 1);
  };

  return Array.from({ length: count }, (val, index) => ({
    id: {
      value: getOrderNumber(index),
    },
    key: { value: uuid() },
  }));
}

function getGeoObjectCategoryValue(category: GeoObjectCategories) {
  return category === GeoObjectCategories.Resources
    ? entitiesOptions.RESOURCE
    : entitiesOptions.RESERVES;
}

function prepareRows(
  domainEntities: RbDomainEntity[],
  domainObjects: DomainObject[],
): GridRow[] {
  return domainObjects.map(
    (
      {
        vid,
        domainObjectPath,
        geoObjectCategory,
        attributeValues,
        risksValues,
      },
      idx,
    ) => {
      const id = { value: idx + 1 };
      const key = { value: vid || uuid() };
      const geoObjectCategoryValue = getGeoObjectCategoryValue(
        geoObjectCategory,
      );
      const domainEntitiesList = collectValues<DomainObjectPathLevel>(
        domainObjectPath,
      );
      const attributesList = collectValuesWithDistribution(attributeValues);
      const risksList = collectValues<RiskValue>(risksValues);

      return {
        id,
        key,
        [SpecialColumns.GEO_CATEGORY]: geoObjectCategoryValue,
        ...domainEntitiesList,
        ...attributesList,
        ...risksList,
      };
    },
  );
}

function constructRows({
  domainEntities = [],
  domainObjects = [],
}: ProjectStructure): GridRow[] {
  const rowsCount = 2 - domainObjects.length;

  return [
    ...prepareRows(domainEntities, domainObjects),
    ...generateEmptyRows(rowsCount),
  ];
}

export default constructRows;
