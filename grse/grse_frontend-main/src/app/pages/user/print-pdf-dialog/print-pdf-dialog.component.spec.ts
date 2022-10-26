import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintPdfDialogComponent } from './print-pdf-dialog.component';

describe('PrintPdfDialogComponent', () => {
  let component: PrintPdfDialogComponent;
  let fixture: ComponentFixture<PrintPdfDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintPdfDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintPdfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
