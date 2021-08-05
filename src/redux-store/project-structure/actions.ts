import { gql } from '@apollo/client';

import { AnyAction } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { clearStores } from '../clear/actions';

import { ProjectStructureActionTypes } from './action-types';

import { ProjectStructureQuery, StoreRES } from '@/types/redux-store';
import { logicConstructorService } from '@/utils/lc-service';

interface DomainObject {
  vid: string;
  name: string;
  typename: string;

  [key: string]: DomainObject[] | string;
}

interface Entity {
  name: string;
  vid: string;
}

interface EntityImageAttribute {
  name: string;
  attrType: string;
  entity: Entity;
}

interface EntityImage {
  vid: string;
  name: string;
  attributes: EntityImageAttribute[];
  entity: Entity;
}

const setProjectStructureQuery = (projectStructureQuery: ProjectStructureQuery) => ({
  type: ProjectStructureActionTypes.SET_PROJECT_STRUCTURE_QUERY,
  projectStructureQuery,
});

const DEFAULT_QUERY = `{
  project {
    vid
    domain{
      projectList{
        vid name
      }
    }
  }
}`;

function buildStructureQuery(entityImages: EntityImage[]): ProjectStructureQuery {
  if (!entityImages.length) return { query: '' };

  const image = entityImages.find((ei) => ei.name === 'GeoEconomicAppraisalProject');
  let query = `{ project { vid domain { geoEconomicAppraisalProjectList { typename:__typename vid name `;

  const loadedImages: string[] = [];

  function buildAttributeQuery(attr: EntityImageAttribute | undefined): string {
    if (!attr) {
      return '';
    }
    const found = entityImages.find(
      (ei) => ei.entity.vid === attr.entity.vid && loadedImages.indexOf(ei.vid) < 0,
    );
    if (found) {
      loadedImages.push(found.vid);
      const attributeFound = found.attributes.find((i) => i.attrType === '[*]');

      return `${attr.name} { typename:__typename ... on ${
        found.name
      }_Type { vid name ${buildAttributeQuery(attributeFound)} } }`;
    }

    return '';
  }

  if (image) {
    const attributeFound = image.attributes.find((i) => i.attrType === '[*]');
    query += buildAttributeQuery(attributeFound);
  }

  query += '} } } }';

  return {
    query
  };
}

const fetchProjectSchema = (): ThunkAction<void, StoreRES, unknown, AnyAction> => async (
  dispatch,
): Promise<void> => {
  dispatch(clearStores());

  try {
    const response = await logicConstructorService.projectStructureQuery();

    if (response?.data) {
      const structureQuery = buildStructureQuery(response.data?.project.domainSchema.entityImages);

      dispatch(setProjectStructureQuery(structureQuery));
    } else {
      //TODO notify
    }
  } catch (e) {
    if (e.networkError?.result) {
      const { errors } = e.networkError?.result;
      if (
        Array.isArray(errors) &&
        errors.find((error) => error.message === 'badly formed hexadecimal UUID string')
      ) {
        const message = 'В url не корректный UUID проекта';
        //TODO notify
      }
    }
  }
};

export {
  fetchProjectSchema
};
