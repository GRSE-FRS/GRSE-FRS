import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformViewComponent } from './crform-view.component';

describe('AdminCrformViewComponent', () => {
  let component: AdminCrformViewComponent;
  let fixture: ComponentFixture<AdminCrformViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
