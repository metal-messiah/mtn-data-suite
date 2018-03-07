import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasingComponent } from './casing.component';
import { CasingModule } from '../casing.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('CasingComponent', () => {
  let component: CasingComponent;
  let fixture: ComponentFixture<CasingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CasingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
