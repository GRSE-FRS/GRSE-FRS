import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminResponsiveHeaderComponent } from './responsive-header.component';

describe('AdminResponsiveHeaderComponent', () => {
  let component: AdminResponsiveHeaderComponent;
  let fixture: ComponentFixture<AdminResponsiveHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminResponsiveHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminResponsiveHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
