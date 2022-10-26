import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformCrgroupsComponent } from './crform-crgroups.component';

describe('AdminCrformCrgroupsComponent', () => {
  let component: AdminCrformCrgroupsComponent;
  let fixture: ComponentFixture<AdminCrformCrgroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformCrgroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformCrgroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
