import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShiftsComponent } from './shifts.component';

describe('AdminShiftsComponent', () => {
  let component: AdminShiftsComponent;
  let fixture: ComponentFixture<AdminShiftsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminShiftsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminShiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
