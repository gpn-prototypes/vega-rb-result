import {
  DomainObject,
  DomainObjectPathLevel,
  GeoObjectCategories,
  ProjectStructure,
  RbDomainEntity,
} from '@app/generated/graphql';
import { SpecialColumns } from '@app/model/Table';
import { v4 as uuid } from 'uuid';

import { entitiesOptions } from '@app/types/typesTable';
import { Row } from '../../components/TableResultRbController/TableResultRb/types';

interface DefaultRows {
  id: string;
  key: string;
  // [geoCategory: SpecialColumns]: OptionEntity;
}

function getGeoObjectCategoryValue(category: GeoObjectCategories) {
  return category === GeoObjectCategories.Resources
    ? entitiesOptions.RESOURCE
    : entitiesOptions.RESERVES;
}

function prepareRows(
  domainEntities: RbDomainEntity[],
  domainObjects: DomainObject[],
): Row<DefaultRows>[] {
  return domainObjects.map(
    (
      {
        vid,
        domainObjectPath,
        geoObjectCategory,
      },
      idx,
    ) => {
      const id = (idx + 1).toString();
      const key = vid || uuid();
      const geoObjectCategoryValue = getGeoObjectCategoryValue(
        geoObjectCategory,
      );

      const domainEntitiesRows = {}

      domainObjectPath.forEach((path: DomainObjectPathLevel) => {
        domainEntitiesRows[path.code] = path.value;
      });

      return {
        id,
        key,
        [SpecialColumns.GEO_CATEGORY]: geoObjectCategoryValue,
        ...domainEntitiesRows,
      };
    },
  );
}

function constructRows<T = any>({
  domainEntities = [],
  domainObjects = [],
}: ProjectStructure): Row<any>[] {
  return [
    ...prepareRows(domainEntities, domainObjects),
  ];
}

export default constructRows;
