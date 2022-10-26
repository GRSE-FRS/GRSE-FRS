import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformDemogmasterComponent } from './crform-demogmaster.component';

describe('AdminCrformDemogmasterComponent', () => {
  let component: AdminCrformDemogmasterComponent;
  let fixture: ComponentFixture<AdminCrformDemogmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformDemogmasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformDemogmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
