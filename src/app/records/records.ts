import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { RecordService } from '../core/services/record.service';
import { OperationRecord } from '../core/models/record.model';
import { OperationType } from '../core/models/operation.model';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class RecordsComponent implements OnInit {
  private recService = inject(RecordService);

  records   = signal<OperationRecord[]>([]);
  isLoading = signal(true);
  errorMsg  = signal('');
  searchTerm= signal('');
  filterOp  = signal<OperationType | 'all'>('all');

  opTypes: { value: OperationType | 'all'; label: string }[] = [
    { value: 'all',      label: 'All' },
    { value: 'add',      label: 'Add' },
    { value: 'subtract', label: 'Subtract' },
    { value: 'compare',  label: 'Compare' },
    { value: 'convert',  label: 'Convert' },
  ];

  get filteredRecords(): OperationRecord[] {
    let list = this.records();
    const op = this.filterOp();
    const term = this.searchTerm().trim().toLowerCase();

    if (op !== 'all') {
      list = list.filter(r => r.operationType === op);
    }

    if (term) {
      list = list.filter(r =>
        (r.category?.toLowerCase() || '').includes(term) ||
        (r.result?.toLowerCase() || '').includes(term) ||
        (r.unit1?.toLowerCase() || '').includes(term) ||
        (r.operationType?.toLowerCase() || '').includes(term) ||
        (r.performedBy?.toLowerCase() || '').includes(term)
      );
    }
    return list;
  }

  ngOnInit(): void {
    this.recService.getRecords().subscribe({
      next: (list) => {
        this.records.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.message);
        this.isLoading.set(false);
      },
    });
  }

  setFilter(op: OperationType | 'all'): void {
    this.filterOp.set(op);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  deleteRecord(id: number): void {
    this.recService.deleteRecord(id).subscribe(() => {
      this.records.update(list => list.filter(r => r.id !== id));
    });
  }

  getOpIcon(op: OperationType): string {
    const map: Record<OperationType, string> = { add: '➕', subtract: '➖', compare: '⚖️', convert: '🔄' };
    return map[op] ?? '📊';
  }

  getOpBadgeClass(op: OperationType): string {
    const map: Record<OperationType, string> = {
      add: 'badge-primary', subtract: 'badge-info', compare: 'badge-warn', convert: 'badge-success',
    };
    return `badge ${map[op] ?? 'badge-primary'}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
