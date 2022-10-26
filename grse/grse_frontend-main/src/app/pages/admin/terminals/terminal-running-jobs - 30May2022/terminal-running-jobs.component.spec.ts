import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTerminalRunningJobsComponent } from './terminal-running-jobs.component';

describe('AdminTerminalRunningJobsComponent', () => {
  let component: AdminTerminalRunningJobsComponent;
  let fixture: ComponentFixture<AdminTerminalRunningJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTerminalRunningJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTerminalRunningJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
