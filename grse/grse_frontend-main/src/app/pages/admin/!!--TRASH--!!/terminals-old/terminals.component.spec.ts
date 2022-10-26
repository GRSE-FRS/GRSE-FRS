import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTerminalsComponent } from './terminals.component';

describe('AdminTerminalsComponent', () => {
  let component: AdminTerminalsComponent;
  let fixture: ComponentFixture<AdminTerminalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTerminalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTerminalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
