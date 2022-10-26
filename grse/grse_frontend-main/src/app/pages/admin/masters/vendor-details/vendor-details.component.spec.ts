import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminVendorDetailsComponent } from './vendor-details.component';

describe('AdminVendorDetailsComponent', () => {
  let component: AdminVendorDetailsComponent;
  let fixture: ComponentFixture<AdminVendorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminVendorDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVendorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
