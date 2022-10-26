import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPurchaseordersComponent } from './purchaseorders.component';

describe('AdminPurchaseordersComponent', () => {
  let component: AdminPurchaseordersComponent;
  let fixture: ComponentFixture<AdminPurchaseordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPurchaseordersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPurchaseordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
