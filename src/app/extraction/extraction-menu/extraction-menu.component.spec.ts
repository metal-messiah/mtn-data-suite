import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractionMenuComponent } from './extraction-menu.component';

describe('ExtractionMenuComponent', () => {
  let component: ExtractionMenuComponent;
  let fixture: ComponentFixture<ExtractionMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtractionMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtractionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
