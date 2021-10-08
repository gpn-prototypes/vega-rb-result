export interface IDomainEntity {
  code: string;
  name: string;
}

export interface IAttribute {
  code: string;
  name: string;
  shortName: string;
  units: string;
}

export interface IDomainObject {
  parents: {
    code: string;
    name: string;
  }[];

  geoType: {
    code: string;
    shortName: string;
  };

  geoCategory: {
    code: string;
    shortName: string;
  };

  attributeValues: {
    code: string;
    percentiles: number[];
    values: number[];
  }[];
}

export interface IData {
  domainEntities: IDomainEntity[];
  attributes: IAttribute[];
  domainObjects: IDomainObject[];
}

//
//
//

export const data: IData = {
  domainEntities: [
    {
      code: 'AREA',
      name: 'Лиц. Участок',
    },
    {
      code: 'DEPOSIT',
      name: 'Месторождение',
    },
    {
      code: 'LAYER',
      name: 'Пласт',
    },
    {
      code: 'MINE',
      name: 'Залежь',
    },
  ],
  attributes: [
    // types.Attribute(
    //     code="GAS", name="Газ", short_name="Г", units=""
    // ),
    // types.Attribute(
    //     code="RESOURCE", name="Pесурс", short_name="P", units=""
    // ),
    {
      code: 'PERCENTILE',
      name: 'Процентиль',
      shortName: 'Процентиль',
      units: '',
    },
    {
      code: 'OIL_POOL_AREA',
      name: 'Площадь залежи',
      shortName: 'F',
      units: 'тыс. м²',
    },
    {
      code: 'OIL_POOL_NET_THICKNESS',
      name: 'Эффективная толщина залежи',
      shortName: 'H эфф.нн',
      units: 'м',
    },
    {
      code: 'FORMATION_POROSITY_RATIO',
      name: 'Коэффициент пористости пласта',
      shortName: 'Кп',
      units: 'д. ед.',
    },
    {
      code: 'FORMATION_OIL_SATURATION_FACTOR',
      name: 'Коэффициент нефтенасыщенности пласта',
      shortName: 'Кн',
      units: 'д. ед.',
    },
    {
      code: 'DENSITY',
      name: 'Плотность',
      shortName: 'Плотность',
      units: 'г/см³',
    },
    {
      code: 'CONVERSION_FACTOR',
      name: 'Пересчетный коэффициент',
      shortName: 'Пересч. коэф.',
      units: 'д. ед.',
    },
    {
      code: 'NGZ_NGR',
      name: 'НГЗ/НГР нефти',
      shortName: 'НГЗ/НГР нефти',
      units: 'тыс. т',
    },
  ],
  domainObjects: [
    {
      parents: [
        {
          code: 'AREA',
          name: 'Лиц. Участок1',
        },
        {
          code: 'DEPOSIT',
          name: 'Месторождение 1',
        },
        {
          code: 'LAYER',
          name: 'Пласт 1',
        },
      ],
      geoType: {
        code: 'GAS',
        shortName: 'Г',
      },
      geoCategory: {
        code: 'RESOURCE',
        shortName: 'P',
      },
      attributeValues: [
        {
          code: 'PERCENTILE',
          percentiles: [90, 50, 10],
          values: [90, 50, 10],
        },
        {
          code: 'OIL_POOL_AREA',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'OIL_POOL_NET_THICKNESS',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_POROSITY_RATIO',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_OIL_SATURATION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'DENSITY',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'CONVERSION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'NGZ_NGR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
      ],
    },
    {
      parents: [
        {
          code: 'AREA',
          name: 'Лиц. Участок1',
        },
        {
          code: 'DEPOSIT',
          name: 'Месторождение 1',
        },
        {
          code: 'LAYER',
          name: 'Пласт 2',
        },
      ],
      geoType: {
        code: 'GAS',
        shortName: 'Г',
      },
      geoCategory: {
        code: 'RESOURCE',
        shortName: 'P',
      },
      attributeValues: [
        {
          code: 'PERCENTILE',
          percentiles: [90, 50, 10],
          values: [90, 50, 10],
        },
        {
          code: 'OIL_POOL_AREA',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'OIL_POOL_NET_THICKNESS',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_POROSITY_RATIO',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_OIL_SATURATION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'DENSITY',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'CONVERSION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'NGZ_NGR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
      ],
    },
    {
      parents: [
        {
          code: 'AREA',
          name: 'Лиц. Участок1',
        },
        {
          code: 'DEPOSIT',
          name: 'Месторождение 2',
        },
        {
          code: 'LAYER',
          name: 'Пласт 1',
        },
      ],
      geoType: {
        code: 'GAS',
        shortName: 'Г',
      },
      geoCategory: {
        code: 'RESOURCE',
        shortName: 'P',
      },
      attributeValues: [
        {
          code: 'PERCENTILE',
          percentiles: [90, 50, 10],
          values: [90, 50, 10],
        },
        {
          code: 'OIL_POOL_AREA',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'OIL_POOL_NET_THICKNESS',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_POROSITY_RATIO',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'FORMATION_OIL_SATURATION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'DENSITY',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'CONVERSION_FACTOR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
        {
          code: 'NGZ_NGR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
      ],
    },
    {
      parents: [
        {
          code: 'AREA',
          name: 'Лиц. Участок1',
        },
        {
          code: 'DEPOSIT',
          name: 'Месторождение 2',
        },
        {
          code: 'LAYER',
          name: 'Всего',
        },
      ],
      geoType: {
        code: 'GAS',
        shortName: 'Г',
      },
      geoCategory: {
        code: 'RESOURCE',
        shortName: 'P',
      },
      attributeValues: [
        {
          code: 'PERCENTILE',
          percentiles: [90, 50, 10],
          values: [90, 50, 10],
        },
        {
          code: 'NGZ_NGR',
          percentiles: [90, 50, 10],
          values: [12.9, 30.44, 32.23],
        },
      ],
    },
  ],
};
