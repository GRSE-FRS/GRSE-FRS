import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCrformViewComponent } from './crform-view.component';

describe('UserCrformViewComponent', () => {
  let component: UserCrformViewComponent;
  let fixture: ComponentFixture<UserCrformViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCrformViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCrformViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
