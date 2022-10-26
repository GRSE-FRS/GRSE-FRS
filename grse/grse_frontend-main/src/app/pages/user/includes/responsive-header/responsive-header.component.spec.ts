import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResponsiveHeaderComponent } from './responsive-header.component';

describe('UserResponsiveHeaderComponent', () => {
  let component: UserResponsiveHeaderComponent;
  let fixture: ComponentFixture<UserResponsiveHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserResponsiveHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserResponsiveHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
