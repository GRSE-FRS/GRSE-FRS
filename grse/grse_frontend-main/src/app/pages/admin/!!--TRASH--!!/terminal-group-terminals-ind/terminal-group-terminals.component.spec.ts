import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTerminalGroupTerminalsComponent } from './terminal-group-terminals.component';

describe('AdminTerminalGroupTerminalsComponent', () => {
  let component: AdminTerminalGroupTerminalsComponent;
  let fixture: ComponentFixture<AdminTerminalGroupTerminalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTerminalGroupTerminalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTerminalGroupTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
