import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OperationRequest, OperationResult, UnitOption, UnitCategory } from '../models/operation.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OperationService {
  private readonly API_BASE = 'http://localhost:5000/api';

  private readonly unitMap: Record<UnitCategory, UnitOption[]> = {
    length: [
      { label: 'Millimeter (mm)', value: 'mm' },
      { label: 'Centimeter (cm)', value: 'cm' },
      { label: 'Meter (m)',        value: 'm' },
      { label: 'Kilometer (km)',   value: 'km' },
      { label: 'Inch (in)',        value: 'in' },
      { label: 'Foot (ft)',        value: 'ft' },
      { label: 'Yard (yd)',        value: 'yd' },
      { label: 'Mile (mi)',        value: 'mi' },
    ],
    weight: [
      { label: 'Milligram (mg)', value: 'mg' },
      { label: 'Gram (g)',       value: 'g' },
      { label: 'Kilogram (kg)', value: 'kg' },
      { label: 'Tonne (t)',      value: 't' },
      { label: 'Ounce (oz)',     value: 'oz' },
      { label: 'Pound (lb)',     value: 'lb' },
    ],
    temperature: [
      { label: 'Celsius (°C)',    value: 'celsius' },
      { label: 'Fahrenheit (°F)', value: 'fahrenheit' },
      { label: 'Kelvin (K)',      value: 'kelvin' },
    ],
    volume: [
      { label: 'Milliliter (ml)', value: 'ml' },
      { label: 'Liter (L)',       value: 'l' },
      { label: 'Gallon (gal)',    value: 'gal' },
      { label: 'Fluid Ounce (fl oz)', value: 'fl_oz' },
      { label: 'Cup',             value: 'cup' },
    ],
  };

  // Conversion factors to base unit (metre, kg, kelvin, litre)
  private readonly factors: Record<string, number> = {
    // length → metre
    mm: 0.001, cm: 0.01, m: 1, km: 1000,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
    // weight → kg
    mg: 0.000001, g: 0.001, kg: 1, t: 1000, oz: 0.0283495, lb: 0.453592,
    // volume → litre
    ml: 0.001, l: 1, gal: 3.78541, fl_oz: 0.0295735, cup: 0.236588,
  };

  constructor(private http: HttpClient, private auth: AuthService) {}

  getUnits(category: UnitCategory): UnitOption[] {
    return this.unitMap[category] ?? [];
  }

  performOperation(req: OperationRequest): Observable<OperationResult> {
    // Try real API first; fall back to local computation on error
    // Uncomment below for real API call:
    // return this.http.post<OperationResult>(
    //   `${this.API_BASE}/operations`,
    //   req,
    //   { headers: this.auth.getAuthHeaders() }
    // );
    return of(this.computeLocally(req));
  }

  private computeLocally(req: OperationRequest): OperationResult {
    const ts = new Date().toISOString();
    const { operationType, value1, unit1, value2, unit2, targetUnit, category } = req;

    if (operationType === 'convert') {
      const target = targetUnit ?? unit1;
      const result = this.convert(value1, unit1, target, category);
      return {
        operationType,
        result: parseFloat(result.toFixed(6)),
        unit: target,
        description: `${value1} ${unit1} = ${result.toFixed(4)} ${target}`,
        timestamp: ts,
      };
    }

    if (operationType === 'add') {
      const v2inU1 = this.convert(value2 ?? 0, unit2 ?? unit1, unit1, category);
      const result = value1 + v2inU1;
      return {
        operationType,
        result: parseFloat(result.toFixed(6)),
        unit: unit1,
        description: `${value1} ${unit1} + ${value2} ${unit2} = ${result.toFixed(4)} ${unit1}`,
        timestamp: ts,
      };
    }

    if (operationType === 'subtract') {
      const v2inU1 = this.convert(value2 ?? 0, unit2 ?? unit1, unit1, category);
      const result = value1 - v2inU1;
      return {
        operationType,
        result: parseFloat(result.toFixed(6)),
        unit: unit1,
        description: `${value1} ${unit1} − ${value2} ${unit2} = ${result.toFixed(4)} ${unit1}`,
        timestamp: ts,
      };
    }

    if (operationType === 'compare') {
      const v2inU1 = this.convert(value2 ?? 0, unit2 ?? unit1, unit1, category);
      const diff = value1 - v2inU1;
      let cmp = diff === 0 ? 'equal' : diff > 0 ? 'greater' : 'lesser';
      return {
        operationType,
        result: cmp,
        description: `${value1} ${unit1} is ${cmp} than ${value2} ${unit2}`,
        timestamp: ts,
      };
    }

    return { operationType, result: 0, description: 'Unknown operation', timestamp: ts };
  }

  private convert(value: number, from: string, to: string, category: UnitCategory): number {
    if (from === to) return value;

    if (category === 'temperature') return this.convertTemperature(value, from, to);

    const fromFactor = this.factors[from] ?? 1;
    const toFactor   = this.factors[to]   ?? 1;
    return (value * fromFactor) / toFactor;
  }

  private convertTemperature(value: number, from: string, to: string): number {
    // Convert to Celsius first
    let celsius: number;
    switch (from) {
      case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
      case 'kelvin':     celsius = value - 273.15;        break;
      default:           celsius = value;
    }
    switch (to) {
      case 'fahrenheit': return celsius * 9 / 5 + 32;
      case 'kelvin':     return celsius + 273.15;
      default:           return celsius;
    }
  }
}
