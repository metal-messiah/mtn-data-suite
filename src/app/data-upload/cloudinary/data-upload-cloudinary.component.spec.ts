import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUploadCloudinaryComponent } from './data-upload-cloudinary.component';

describe('DataUploadCloudinaryComponent', () => {
    let component: DataUploadCloudinaryComponent;
    let fixture: ComponentFixture<DataUploadCloudinaryComponent>;

    beforeEach(
        async(() => {
            TestBed.configureTestingModule({
                declarations: [DataUploadCloudinaryComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(DataUploadCloudinaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
