import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDepartmentsComponent } from './departments.component';

describe('AdminDepartmentsComponent', () => {
  let component: AdminDepartmentsComponent;
  let fixture: ComponentFixture<AdminDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDepartmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
