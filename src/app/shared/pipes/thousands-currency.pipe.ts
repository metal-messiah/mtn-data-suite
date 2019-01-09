import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousandsCurrency'
})
export class ThousandsCurrencyPipe implements PipeTransform {

  transform(value: number): any {
    const number = Math.round(value / 1000);
    return `$${number.toLocaleString()}k`;
  }

}
