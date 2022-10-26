import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTerminalMonitoringComponent } from './terminal-monitoring.component';

describe('AdminTerminalMonitoringComponent', () => {
  let component: AdminTerminalMonitoringComponent;
  let fixture: ComponentFixture<AdminTerminalMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTerminalMonitoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTerminalMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
