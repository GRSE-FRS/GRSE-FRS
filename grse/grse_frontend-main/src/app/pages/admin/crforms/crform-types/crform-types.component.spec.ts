import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformTypesComponent } from './crform-types.component';

describe('AdminCrformTypesComponent', () => {
  let component: AdminCrformTypesComponent;
  let fixture: ComponentFixture<AdminCrformTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
