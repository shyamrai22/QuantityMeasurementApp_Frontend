import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OperationRecord } from '../models/record.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly API_BASE = 'http://localhost:5000/api';

  private mockRecords: OperationRecord[] = [
    { id: 1,  operationType: 'convert',  category: 'length',      value1: 100, unit1: 'cm', result: '1 m',                     timestamp: '2026-03-31T09:15:00Z', performedBy: 'demo@example.com' },
    { id: 2,  operationType: 'add',      category: 'weight',      value1: 5,   unit1: 'kg', value2: 500, unit2: 'g', result: '5.5 kg',  timestamp: '2026-03-31T09:30:00Z', performedBy: 'demo@example.com' },
    { id: 3,  operationType: 'compare',  category: 'temperature', value1: 100, unit1: 'celsius', value2: 212, unit2: 'fahrenheit', result: 'equal', timestamp: '2026-03-31T10:00:00Z', performedBy: 'demo@example.com' },
    { id: 4,  operationType: 'subtract', category: 'length',      value1: 10,  unit1: 'm',  value2: 500, unit2: 'cm', result: '5 m',     timestamp: '2026-03-31T10:20:00Z', performedBy: 'demo@example.com' },
    { id: 5,  operationType: 'convert',  category: 'weight',      value1: 1,   unit1: 'lb', result: '0.4536 kg',               timestamp: '2026-03-31T10:45:00Z', performedBy: 'demo@example.com' },
    { id: 6,  operationType: 'add',      category: 'volume',      value1: 2,   unit1: 'l',  value2: 500, unit2: 'ml', result: '2.5 l',   timestamp: '2026-03-31T11:00:00Z', performedBy: 'demo@example.com' },
    { id: 7,  operationType: 'convert',  category: 'temperature', value1: 0,   unit1: 'celsius', result: '32 °F',               timestamp: '2026-03-31T11:15:00Z', performedBy: 'demo@example.com' },
    { id: 8,  operationType: 'compare',  category: 'weight',      value1: 1,   unit1: 'kg', value2: 1000, unit2: 'g', result: 'equal',   timestamp: '2026-03-31T11:30:00Z', performedBy: 'demo@example.com' },
    { id: 9,  operationType: 'subtract', category: 'volume',      value1: 5,   unit1: 'l',  value2: 2,   unit2: 'l',  result: '3 l',    timestamp: '2026-03-31T12:00:00Z', performedBy: 'demo@example.com' },
    { id: 10, operationType: 'convert',  category: 'length',      value1: 1,   unit1: 'mi', result: '1609.344 m',              timestamp: '2026-03-31T12:30:00Z', performedBy: 'demo@example.com' },
  ];

  constructor(private http: HttpClient, private auth: AuthService) {}

  getRecords(): Observable<OperationRecord[]> {
    const user = this.auth.currentUser();
    const userEmail = user?.email || 'guest';
    const normalizedEmail = userEmail.trim().toLowerCase();

    // Filter mock records with case-insensitivity
    const filtered = this.mockRecords.filter(r => {
      const recordEmail = (r.performedBy || 'guest').trim().toLowerCase();
      return recordEmail === normalizedEmail;
    });

    return of([...filtered].reverse());
  }

  addLocalRecord(record: Omit<OperationRecord, 'id'>): void {
    const newId = Math.max(...this.mockRecords.map(r => r.id)) + 1;
    this.mockRecords.push({ ...record, id: newId });
  }

  deleteRecord(id: number): Observable<void> {
    // return this.http.delete<void>(`${this.API_BASE}/records/${id}`, { headers: this.auth.getAuthHeaders() });
    this.mockRecords = this.mockRecords.filter(r => r.id !== id);
    return of(undefined);
  }
}
