import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[mdsInfoCard]'
})
export class InfoCardDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
