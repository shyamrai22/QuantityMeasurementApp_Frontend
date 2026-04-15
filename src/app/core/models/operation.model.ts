export type OperationType = 'add' | 'subtract' | 'compare' | 'convert';
export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume';

export interface OperationRequest {
  operationType: OperationType;
  value1: number;
  unit1: string;
  value2?: number;
  unit2?: string;
  targetUnit?: string;
  category: UnitCategory;
}

export interface OperationResult {
  operationType: OperationType;
  result: number | boolean | string;
  unit?: string;
  description: string;
  timestamp?: string;
}

export interface UnitOption {
  label: string;
  value: string;
}
