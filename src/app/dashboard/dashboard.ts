import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { AuthService } from '../core/services/auth.service';
import { OperationService } from '../core/services/operation.service';
import { RecordService } from '../core/services/record.service';
import { OperationType, UnitCategory, OperationRequest, OperationResult } from '../core/models/operation.model';
import { FindCardPipe } from '../shared/pipes/find-card.pipe';

interface OperationCard {
  type: OperationType;
  label: string;
  icon: string;
  description: string;
  gradient: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent, FindCardPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  private fb        = inject(FormBuilder);
  private auth      = inject(AuthService);
  private opService = inject(OperationService);
  private recService= inject(RecordService);

  currentUser = this.auth.currentUser;
  isLoggedIn  = this.auth.isLoggedIn;

  operationCards: OperationCard[] = [
    { type: 'add',      label: 'Add',      icon: '➕', description: 'Sum two quantities in any compatible units', gradient: 'linear-gradient(135deg,#6c63ff,#a78bfa)' },
    { type: 'subtract', label: 'Subtract', icon: '➖', description: 'Find the difference between two measurements', gradient: 'linear-gradient(135deg,#38bdf8,#6c63ff)' },
    { type: 'compare',  label: 'Compare',  icon: '⚖️', description: 'Compare two quantities and find their relation', gradient: 'linear-gradient(135deg,#34d399,#38bdf8)' },
    { type: 'convert',  label: 'Convert',  icon: '🔄', description: 'Convert a value between compatible units', gradient: 'linear-gradient(135deg,#fbbf24,#f87171)' },
  ];

  categories: { value: UnitCategory; label: string; icon: string }[] = [
    { value: 'length',      label: 'Length',      icon: '📏' },
    { value: 'weight',      label: 'Weight',      icon: '⚖️' },
    { value: 'temperature', label: 'Temperature', icon: '🌡️' },
    { value: 'volume',      label: 'Volume',      icon: '🧪' },
  ];

  selectedOp       = signal<OperationType | null>(null);
  selectedCategory = signal<UnitCategory>('length');
  result           = signal<OperationResult | null>(null);
  isLoading        = signal(false);
  errorMsg         = signal('');

  units = computed(() => this.opService.getUnits(this.selectedCategory()));

  opForm: FormGroup = this.fb.group({
    value1:     ['', [Validators.required, Validators.min(0)]],
    unit1:      ['', Validators.required],
    value2:     [''],
    unit2:      [''],
    targetUnit: [''],
  });

  get needsSecondValue(): boolean {
    const op = this.selectedOp();
    return op === 'add' || op === 'subtract' || op === 'compare';
  }

  get needsTargetUnit(): boolean {
    return this.selectedOp() === 'convert';
  }

  selectOperation(op: OperationType): void {
    this.selectedOp.set(op);
    this.result.set(null);
    this.errorMsg.set('');
    this.opForm.reset();
    this.setRequiredValidators(op);
  }

  selectCategory(cat: UnitCategory): void {
    this.selectedCategory.set(cat);
    this.opForm.patchValue({ unit1: '', unit2: '', targetUnit: '' });
    this.result.set(null);
  }

  private setRequiredValidators(op: OperationType): void {
    const v2  = this.opForm.get('value2')!;
    const u2  = this.opForm.get('unit2')!;
    const tu  = this.opForm.get('targetUnit')!;

    v2.clearValidators(); u2.clearValidators(); tu.clearValidators();

    if (op === 'add' || op === 'subtract' || op === 'compare') {
      v2.setValidators([Validators.required, Validators.min(0)]);
      u2.setValidators(Validators.required);
    }
    if (op === 'convert') {
      tu.setValidators(Validators.required);
    }
    v2.updateValueAndValidity();
    u2.updateValueAndValidity();
    tu.updateValueAndValidity();
  }

  calculate(): void {
    if (this.opForm.invalid || !this.selectedOp()) {
      this.opForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    this.errorMsg.set('');
    this.result.set(null);

    const formVal = this.opForm.value;
    const req: OperationRequest = {
      operationType: this.selectedOp()!,
      category:      this.selectedCategory(),
      value1:        parseFloat(formVal.value1),
      unit1:         formVal.unit1,
      value2:        formVal.value2 ? parseFloat(formVal.value2) : undefined,
      unit2:         formVal.unit2 || undefined,
      targetUnit:    formVal.targetUnit || undefined,
    };

    this.opService.performOperation(req).subscribe({
      next: (res) => {
        this.result.set(res);
        this.isLoading.set(false);
        // Save to records
        this.recService.addLocalRecord({
          operationType: req.operationType,
          category:      req.category,
          value1:        req.value1,
          unit1:         req.unit1,
          value2:        req.value2,
          unit2:         req.unit2,
          result:        String(res.result) + (res.unit ? ` ${res.unit}` : ''),
          timestamp:     new Date().toISOString(),
          performedBy:   (this.currentUser()?.email || 'Guest').trim().toLowerCase(),
        });
      },
      error: (err) => {
        this.errorMsg.set(err.message || 'Calculation failed');
        this.isLoading.set(false);
      },
    });
  }

  getResultClass(): string {
    const r = this.result();
    if (!r) return '';
    if (r.operationType === 'compare') {
      if (String(r.result) === 'equal')   return 'result-equal';
      if (String(r.result) === 'greater') return 'result-greater';
      return 'result-lesser';
    }
    return '';
  }

  getResultIcon(): string {
    const r = this.result();
    if (!r) return '';
    if (r.operationType === 'compare') {
      if (String(r.result) === 'equal')   return '⚖️';
      if (String(r.result) === 'greater') return '⬆️';
      return '⬇️';
    }
    return '✅';
  }

  resetOperation(): void {
    this.selectedOp.set(null);
    this.result.set(null);
    this.errorMsg.set('');
    this.opForm.reset();
  }
}
