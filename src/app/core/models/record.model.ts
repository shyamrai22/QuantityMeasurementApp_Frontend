import { OperationType } from './operation.model';

export interface OperationRecord {
  id: number;
  operationType: OperationType;
  category: string;
  value1: number;
  unit1: string;
  value2?: number;
  unit2?: string;
  result: string;
  timestamp: string;
  performedBy: string;
}
