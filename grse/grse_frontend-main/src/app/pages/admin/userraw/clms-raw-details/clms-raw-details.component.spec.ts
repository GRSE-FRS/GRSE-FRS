import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminClmsRawDetailsComponent } from './clms-raw-details.component';

describe('AdminClmsRawDetailsComponent', () => {
  let component: AdminClmsRawDetailsComponent;
  let fixture: ComponentFixture<AdminClmsRawDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminClmsRawDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminClmsRawDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
