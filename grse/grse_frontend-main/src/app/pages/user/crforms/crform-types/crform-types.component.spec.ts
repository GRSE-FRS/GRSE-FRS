import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCrformTypesComponent } from './crform-types.component';

describe('UserCrformTypesComponent', () => {
  let component: UserCrformTypesComponent;
  let fixture: ComponentFixture<UserCrformTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCrformTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCrformTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
