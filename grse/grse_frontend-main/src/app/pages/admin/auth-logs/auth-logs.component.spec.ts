import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuthLogsComponent } from './auth-logs.component';

describe('AdminAuthLogsComponent', () => {
  let component: AdminAuthLogsComponent;
  let fixture: ComponentFixture<AdminAuthLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAuthLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAuthLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
