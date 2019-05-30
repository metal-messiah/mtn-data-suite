import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleInfoCardComponent } from './google-info-card.component';

describe('GoogleInfoCardComponent', () => {
  let component: GoogleInfoCardComponent;
  let fixture: ComponentFixture<GoogleInfoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleInfoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
