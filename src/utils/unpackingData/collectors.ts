import { ReactText } from 'react';
import {
  AttributeValue,
  Distribution,
  Maybe,
  VisibleValue,
} from '@app/generated/graphql';
import { get, has, reduce, set } from 'lodash/fp';
import { NoopFunction, Nullable } from '@app/types';
import { omitTypename } from '@app/utils/omitTypename';
import {GridCellArguments, GridCellProperties, GridRow} from "@app/types/typesTable";

interface IData {
  code: string;
  value?: Maybe<ReactText>;
}

const parseVisibleValueObject = (
  visibleValue: VisibleValue,
  distribution?: Nullable<Distribution>,
) => {
  const clearDistribution = (
    distributionValue: Distribution,
  ): GridCellArguments => omitTypename(distributionValue) as GridCellArguments;

  return {
    value: get(['value'], visibleValue) || '',
    args: distribution ? clearDistribution(distribution) : undefined,
  };
};

function collector<T extends { code: string }>(
  valuesList: T[],
  consumer: NoopFunction<T, GridCellProperties | undefined>,
) {
  return reduce<T, GridRow>(
    (prev, curr) => set<GridRow>([curr.code], consumer(curr), prev),
    {},
    valuesList,
  );
}

function collectValues<T extends IData>(values: T[]): GridRow {
  return collector<T>(values, ({ value }) => {
    return value ? { value } : undefined;
  });
}

function collectValuesWithDistribution(values: AttributeValue[]): GridRow {
  const consumer = ({
    visibleValue,
    distribution,
  }: AttributeValue): GridCellProperties | undefined => {
    if (
      visibleValue.__typename === 'VisibleValue' &&
      has(['value'], visibleValue)
    ) {
      return parseVisibleValueObject(visibleValue, distribution);
    }

    return undefined;
  };

  return collector<AttributeValue>(values, consumer);
}

export { collectValues, collectValuesWithDistribution };
