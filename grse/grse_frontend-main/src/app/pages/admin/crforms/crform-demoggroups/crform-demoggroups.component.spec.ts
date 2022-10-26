import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformDemoggroupsComponent } from './crform-demoggroups.component';

describe('AdminCrformDemoggroupsComponent', () => {
  let component: AdminCrformDemoggroupsComponent;
  let fixture: ComponentFixture<AdminCrformDemoggroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformDemoggroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformDemoggroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
