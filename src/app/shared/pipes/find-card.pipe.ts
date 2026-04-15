import { Pipe, PipeTransform } from '@angular/core';
import { OperationType } from '../../core/models/operation.model';

interface Card { type: OperationType; label: string; icon: string }

@Pipe({ name: 'findCard', standalone: true, pure: true })
export class FindCardPipe implements PipeTransform {
  transform(cards: Card[], type: OperationType | null): string {
    if (!type) return '';
    const found = cards.find(c => c.type === type);
    return found ? `${found.icon} ${found.label}` : '';
  }
}
