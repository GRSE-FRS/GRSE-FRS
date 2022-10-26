import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCrformBucketComponent } from './crform-bucket.component';

describe('UserCrformBucketComponent', () => {
  let component: UserCrformBucketComponent;
  let fixture: ComponentFixture<UserCrformBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCrformBucketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCrformBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
