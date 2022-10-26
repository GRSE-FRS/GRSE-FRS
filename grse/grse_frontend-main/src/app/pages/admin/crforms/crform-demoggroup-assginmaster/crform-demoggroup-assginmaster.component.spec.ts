import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformDemoggroupAssginmasterComponent } from './crform-demoggroup-assginmaster.component';

describe('AdminCrformDemoggroupAssginmasterComponent', () => {
  let component: AdminCrformDemoggroupAssginmasterComponent;
  let fixture: ComponentFixture<AdminCrformDemoggroupAssginmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformDemoggroupAssginmasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformDemoggroupAssginmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
