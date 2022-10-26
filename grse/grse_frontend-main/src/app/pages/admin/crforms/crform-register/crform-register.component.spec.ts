import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformRegisterComponent } from './crform-register.component';

describe('AdminCrformRegisterComponent', () => {
  let component: AdminCrformRegisterComponent;
  let fixture: ComponentFixture<AdminCrformRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
