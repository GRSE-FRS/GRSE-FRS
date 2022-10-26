import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSubareasComponent } from './subareas.component';

describe('AdminSubareasComponent', () => {
  let component: AdminSubareasComponent;
  let fixture: ComponentFixture<AdminSubareasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSubareasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminSubareasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
