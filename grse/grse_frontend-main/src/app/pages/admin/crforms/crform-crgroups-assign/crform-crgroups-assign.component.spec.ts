import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformCrgroupsAssignComponent } from './crform-crgroups-assign.component';

describe('AdminCrformCrgroupsAssignComponent', () => {
  let component: AdminCrformCrgroupsAssignComponent;
  let fixture: ComponentFixture<AdminCrformCrgroupsAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformCrgroupsAssignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformCrgroupsAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
