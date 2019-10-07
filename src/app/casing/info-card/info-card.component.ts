import { Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { InfoCardDirective } from '../info-card.directive';
import { InfoCardItem } from '../info-card-item';

@Component({
  selector: 'mds-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnInit, OnChanges, OnDestroy {

  @Input() infoCard: InfoCardItem;
  @Input() disabled: boolean;
  @ViewChild(InfoCardDirective, { static: true }) infoCardHost: InfoCardDirective;

  private componentRef;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadComponent();
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  private loadComponent() {
    // Get component factory for infoCard
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.infoCard.component);

    // Clear previous
    this.infoCardHost.viewContainerRef.clear();

    // Create component
    this.componentRef = this.infoCardHost.viewContainerRef.createComponent(componentFactory);

    // Set component attributes
    this.componentRef.instance.infoCardItem = this.infoCard;
    this.componentRef.instance.disabled = this.disabled;
  }

}
