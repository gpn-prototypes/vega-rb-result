import {
  AttributeValue,
  DomainObject,
  DomainObjectPathLevel,
  RiskValue,
} from '@app/generated/graphql';
import { getDiffPatcher } from '@app/utils/diffPatcher';
import { cloneDeep } from 'lodash/fp';

import { DomainObjectsDelta } from './types';

export function resolveDomainObjects(
  local: DomainObject[],
  remote: DomainObject[],
  diff: DomainObjectsDelta,
): DomainObject[] {
  const diffPatcher = getDiffPatcher();

  if (!diff || !local || local.length === 0) {
    return remote;
  }

  const localBeforeUpdate = diffPatcher.unpatch(cloneDeep(local), diff);

  let updatedState = cloneDeep(remote);
  Object.entries(diff).forEach((diffValue) => {
    const key = diffValue[0];

    if (key === '_t') return;

    if (!key.includes('_')) {
      const idxInLocal = Number.parseInt(key, 10);

      let localItem = local[idxInLocal];

      const idxInUpdatedState = remote.findIndex(
        (domainObject) => domainObject.vid === localItem.vid,
      );

      const idxInLocalBeforeUpdate = localBeforeUpdate.findIndex(
        (domainObject: DomainObject) => domainObject.vid === localItem.vid,
      );

      if (idxInUpdatedState !== -1) {
        let updatedDomainObjectPath = Array<DomainObjectPathLevel>();
        let updatedAttributeValues = Array<AttributeValue>();
        let updatedRiskValues = Array<RiskValue>();

        // resolve changing columns in domainObjectPath
        remote[0].domainObjectPath.forEach((remotePath) => {
          const pathIdx = localItem.domainObjectPath.findIndex(
            (path) => path.code === remotePath.code,
          );

          const objectPath = localItem.domainObjectPath[pathIdx];

          const remoteObjectPath = remote[
            idxInUpdatedState
          ]?.domainObjectPath?.find((path) => path.code === remotePath.code);

          if (!diffValue[1]?.domainObjectPath) {
            updatedDomainObjectPath.push(remoteObjectPath || objectPath);
            return;
          }

          const pathIdxBeforeUpdate =
            localBeforeUpdate[
              idxInLocalBeforeUpdate
            ]?.domainObjectPath.findIndex(
              (path: DomainObjectPathLevel) => path.code === remotePath.code,
            ) || -1;

          const idx = `_${pathIdxBeforeUpdate}`;
          const deletingPath = diffValue[1]?.domainObjectPath[idx];

          const isDeletingItem =
            deletingPath?.length === 3 &&
            deletingPath[1] === 0 &&
            deletingPath[2] === 0;

          const updatingPath = diffValue[1]?.domainObjectPath[pathIdx];
          const isUpdatingItem = Array.isArray(updatingPath?.value);

          if (!isDeletingItem) {
            updatedDomainObjectPath.push(
              (!isUpdatingItem && remoteObjectPath
                ? remoteObjectPath
                : objectPath) ||
                ({
                  code: remotePath.code,
                  value: null,
                } as DomainObjectPathLevel),
            );
          }
        });

        localItem.domainObjectPath.forEach((localPath, index) => {
          if (!diffValue[1]?.domainObjectPath) {
            return;
          }

          const pathIdxBeforeUpdate =
            localBeforeUpdate[
              idxInLocalBeforeUpdate
            ]?.domainObjectPath.findIndex(
              (path: DomainObjectPathLevel) => path.code === localPath.code,
            ) || -1;

          const idx = `_${index}`;
          const movingPath = diffValue[1]?.domainObjectPath[idx];

          const isMovingItem =
            movingPath?.length === 3 &&
            (movingPath[1] !== 0 || movingPath[2] !== 0);

          const isAddingItem =
            (!pathIdxBeforeUpdate || pathIdxBeforeUpdate === -1) &&
            Array.isArray(diffValue[1]?.domainObjectPath[index]);

          if (isAddingItem) {
            updatedDomainObjectPath = [
              ...updatedDomainObjectPath.slice(0, index),
              localPath,
              ...updatedDomainObjectPath.slice(index),
            ];

            return;
          }

          if (isMovingItem) {
            const movingFromIdx = pathIdxBeforeUpdate;
            const movingToIdx = movingPath[1];
            updatedDomainObjectPath = [
              ...updatedDomainObjectPath.slice(0, movingFromIdx),
              ...updatedDomainObjectPath.slice(movingFromIdx + 1),
            ];
            updatedDomainObjectPath = [
              ...updatedDomainObjectPath.slice(0, movingToIdx),
              localPath,
              ...updatedDomainObjectPath.slice(movingToIdx),
            ];
          }
        });

        // resolve changing columns in AttributeValues
        remote[0].attributeValues.forEach((remoteAttr, index) => {
          const attrIdx = localItem.attributeValues.findIndex(
            (attr) => attr.code === remoteAttr.code,
          );

          const attributeValue = localItem.attributeValues[attrIdx];

          const remoteAttributeValue = remote[
            idxInUpdatedState
          ]?.attributeValues?.find((attr) => attr.code === remoteAttr.code);

          if (!diffValue[1]?.attributeValues) {
            updatedAttributeValues.push(remoteAttributeValue || attributeValue);
            return;
          }

          const idxBeforeUpdate =
            localBeforeUpdate[
              idxInLocalBeforeUpdate
            ]?.attributeValues.findIndex(
              (attr: AttributeValue) => attr.code === remoteAttr.code,
            ) || -1;

          const idx = `_${idxBeforeUpdate}`;
          const deletingAttr = diffValue[1]?.attributeValues[idx];

          const isDeletingItem =
            deletingAttr?.length === 3 &&
            deletingAttr[1] === 0 &&
            deletingAttr[2] === 0;

          const updatingAttr = diffValue[1]?.attributeValues[attrIdx];
          const isUpdatingItem = Array.isArray(updatingAttr?.distribution);

          if (!isDeletingItem) {
            updatedAttributeValues.push(
              (!isUpdatingItem && remoteAttributeValue
                ? remoteAttributeValue
                : attributeValue) ||
                ({
                  code: remoteAttr.code,
                  distribution: null,
                } as AttributeValue),
            );
          }
        });

        localItem.attributeValues.forEach((localAttr, index) => {
          if (!diffValue[1]?.attributeValues) {
            return;
          }

          const attrIdxBeforeUpdate =
            localBeforeUpdate[
              idxInLocalBeforeUpdate
            ]?.attributeValues.findIndex(
              (attr: AttributeValue) => attr.code === localAttr.code,
            ) || -1;

          const idx = `_${index}`;
          const movingAttr = diffValue[1]?.attributeValues[idx];

          const isMovingItem =
            movingAttr?.length === 3 &&
            (movingAttr[1] !== 0 || movingAttr[2] !== 0);

          const isAddingItem =
            (!attrIdxBeforeUpdate || attrIdxBeforeUpdate === -1) &&
            Array.isArray(diffValue[1]?.attributeValues[index]);

          if (isAddingItem) {
            updatedAttributeValues = [
              ...updatedAttributeValues.slice(0, index),
              localAttr,
              ...updatedAttributeValues.slice(index),
            ];

            return;
          }

          if (isMovingItem) {
            const movingFromIdx = attrIdxBeforeUpdate;
            const movingToIdx = movingAttr[1];
            updatedAttributeValues = [
              ...updatedAttributeValues.slice(0, movingFromIdx),
              ...updatedAttributeValues.slice(movingFromIdx + 1),
            ];
            updatedAttributeValues = [
              ...updatedAttributeValues.slice(0, movingToIdx),
              localAttr,
              ...updatedAttributeValues.slice(movingToIdx),
            ];
          }
        });

        // resolve changing columns in RiskValues
        remote[0].risksValues.forEach((remoteRisk) => {
          const riskIdx = localItem.risksValues.findIndex(
            (risk) => risk.code === remoteRisk.code,
          );

          const riskValue = localItem.risksValues[riskIdx];

          const remoteRiskValue = remote[idxInUpdatedState]?.risksValues?.find(
            (risk) => risk.code === remoteRisk.code,
          );

          if (!diffValue[1]?.risksValues) {
            updatedRiskValues.push(remoteRiskValue || riskValue);
            return;
          }

          const idxBeforeUpdate =
            localBeforeUpdate[idxInLocalBeforeUpdate]?.risksValues.findIndex(
              (risk: RiskValue) => risk.code === remoteRisk.code,
            ) || -1;

          const idx = `_${idxBeforeUpdate}`;
          const deletingRisk = diffValue[1]?.risksValues[idx];

          const isDeletingItem =
            deletingRisk?.length === 3 &&
            deletingRisk[1] === 0 &&
            deletingRisk[2] === 0;

          const updatingRisk = diffValue[1]?.risksValues[riskIdx];
          const isUpdatingItem = Array.isArray(updatingRisk?.value);

          if (!isDeletingItem) {
            updatedRiskValues.push(
              (!isUpdatingItem && remoteRiskValue
                ? remoteRiskValue
                : riskValue) ||
                ({
                  code: remoteRisk.code,
                  value: null,
                } as RiskValue),
            );
          }
        });

        localItem.risksValues.forEach((localRisk, index) => {
          if (!diffValue[1]?.risksValues) {
            return;
          }

          const riskIdxBeforeUpdate =
            localBeforeUpdate[idxInLocalBeforeUpdate]?.risksValues.findIndex(
              (risk: RiskValue) => risk.code === localRisk.code,
            ) || -1;

          const idx = `_${index}`;
          const movingRisk = diffValue[1]?.risksValues[idx];

          const isMovingItem =
            movingRisk?.length === 3 &&
            (movingRisk[1] !== 0 || movingRisk[2] !== 0);

          const isAddingItem =
            (!riskIdxBeforeUpdate || riskIdxBeforeUpdate === -1) &&
            Array.isArray(diffValue[1]?.risksValues[index]);

          if (isAddingItem) {
            updatedRiskValues = [
              ...updatedRiskValues.slice(0, index),
              localRisk,
              ...updatedRiskValues.slice(index),
            ];

            return;
          }

          if (isMovingItem) {
            const movingFromIdx = riskIdxBeforeUpdate;
            const movingToIdx = movingRisk[1];
            updatedRiskValues = [
              ...updatedRiskValues.slice(0, movingFromIdx),
              ...updatedRiskValues.slice(movingFromIdx + 1),
            ];
            updatedRiskValues = [
              ...updatedRiskValues.slice(0, movingToIdx),
              localRisk,
              ...updatedRiskValues.slice(movingToIdx),
            ];
          }
        });

        let updatedGeoObjectCategory =
          remote[idxInUpdatedState]?.geoObjectCategory ||
          localItem.geoObjectCategory;

        if (diffValue[1].geoObjectCategory) {
          updatedGeoObjectCategory = localItem.geoObjectCategory;
        }

        localItem = {
          ...localItem,
          domainObjectPath:
            updatedDomainObjectPath.length !== 0
              ? updatedDomainObjectPath
              : localItem.domainObjectPath,
          attributeValues:
            updatedAttributeValues.length !== 0
              ? updatedAttributeValues
              : localItem.attributeValues,
          risksValues:
            updatedRiskValues.length !== 0
              ? updatedRiskValues
              : localItem.risksValues,
          geoObjectCategory: updatedGeoObjectCategory,
        };

        // In case of modifying existing item
        updatedState[idxInUpdatedState] = localItem;
      } else if (idxInLocal >= localBeforeUpdate.length) {
        // In case of adding new item to end of table
        updatedState = [...updatedState, localItem];
      } else {
        // In case of adding new item in the middle of table
        updatedState = [
          ...(idxInLocal > 0 ? updatedState.slice(0, idxInLocal) : []),
          localItem,
          ...updatedState.slice(idxInLocal),
        ];
      }
    } else {
      const idxInLocalBeforeUpdate = Number.parseInt(key.substring(1), 10);
      const item = localBeforeUpdate[idxInLocalBeforeUpdate];

      if (!item) return;

      const idxInUpdatedState = updatedState.findIndex(
        (domainObject) => domainObject.vid === item.vid,
      );

      if (idxInUpdatedState !== -1) {
        // In case of deleting item
        updatedState = [
          ...updatedState.slice(0, idxInUpdatedState - 1),
          ...updatedState.slice(idxInUpdatedState),
        ];
      }
    }
  });
  return updatedState;
}
