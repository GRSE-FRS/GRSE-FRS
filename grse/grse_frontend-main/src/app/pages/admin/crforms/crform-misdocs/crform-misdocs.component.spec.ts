import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrformMisdocsComponent } from './crform-misdocs.component';

describe('AdminCrformMisdocsComponent', () => {
  let component: AdminCrformMisdocsComponent;
  let fixture: ComponentFixture<AdminCrformMisdocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCrformMisdocsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCrformMisdocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
