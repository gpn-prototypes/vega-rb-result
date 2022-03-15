import { ProjectDecimal } from '@app/interfaces/DecimalInterface';
import projectService from '@app/services/ProjectService';
import { DecimalFixed } from '@app/types/typesTable';

export async function loadDecimalData(): Promise<DecimalFixed> {
  const projectDecimals: ProjectDecimal[] =
    await projectService.getDecimalData();

  const decimalFixed = {} as DecimalFixed;

  projectDecimals.forEach((decimal: ProjectDecimal) => {
    decimalFixed[decimal.code] = decimal.decimalPlace;
  });

  return decimalFixed;
}

export async function setDecimalData(
  attributeCode: string,
  decimal: number,
): Promise<void> {
  await projectService.setDecimalData(attributeCode, decimal);
}
