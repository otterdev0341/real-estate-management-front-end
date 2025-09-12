export interface PropertyForcaseDto {
  propertyId: string;
  propertyName: string;
  fsp: number;
  newFsp: number;
  currentExpense: number;
  additionalExpense: number;
  budget: number;
}

export function getTotalExpense(dto: PropertyForcaseDto): number {
  return dto.currentExpense + dto.additionalExpense;
}

export function getBudgetUsedPercent(dto: PropertyForcaseDto): number {
  if (!dto.budget) return 0;
  return (getTotalExpense(dto) / dto.budget) * 100;
}

export function getProfit(dto: PropertyForcaseDto): number {
  const baseFsp = dto.newFsp > 0 ? dto.newFsp : dto.fsp;
  return baseFsp - getTotalExpense(dto);
}