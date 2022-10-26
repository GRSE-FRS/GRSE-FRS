import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCrformRegisterComponent } from './crform-register.component';

describe('UserCrformRegisterComponent', () => {
  let component: UserCrformRegisterComponent;
  let fixture: ComponentFixture<UserCrformRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCrformRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCrformRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
