import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClmsRawComponent } from './clms-raw.component';

describe('AdminClmsRawComponent', () => {
  let component: AdminClmsRawComponent;
  let fixture: ComponentFixture<AdminClmsRawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminClmsRawComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClmsRawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
