import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainXyDataFormComponent } from './chain-xy-data-form.component';

describe('ChainXyDataFormComponent', () => {
  let component: ChainXyDataFormComponent;
  let fixture: ComponentFixture<ChainXyDataFormComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ChainXyDataFormComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainXyDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
