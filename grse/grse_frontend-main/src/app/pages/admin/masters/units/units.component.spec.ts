import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUnitsComponent } from './units.component';

describe('AdminUnitsComponent', () => {
  let component: AdminUnitsComponent;
  let fixture: ComponentFixture<AdminUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminUnitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
