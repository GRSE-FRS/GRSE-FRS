import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTerminalGroupsComponent } from './terminal-groups.component';

describe('AdminTerminalGroupsComponent', () => {
  let component: AdminTerminalGroupsComponent;
  let fixture: ComponentFixture<AdminTerminalGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTerminalGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTerminalGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
