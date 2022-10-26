import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRawAuthLogsComponent } from './raw-auth-logs.component';

describe('AdminRawAuthLogsComponent', () => {
  let component: AdminRawAuthLogsComponent;
  let fixture: ComponentFixture<AdminRawAuthLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRawAuthLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRawAuthLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
