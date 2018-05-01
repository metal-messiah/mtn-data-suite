import { Injectable } from '@angular/core';
import { Color } from '../functionalEnums/Color';

@Injectable()
export class LabelService {

  constructor() { }

  getLabel(labelText: string, labelColor: Color) {
    return {
      color: labelColor,
      fontWeight: 'bold',
      text: labelText
    };
  }
}
