import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import { ExcelExportService } from 'src/app/services/excel-export.service';

@Component({
  selector: 'app-admin-auth-logs',
  templateUrl: './auth-logs.component.html',
  styleUrls: ['./auth-logs.component.css']
})
export class AdminAuthLogsComponent implements OnInit {
  tableSearchForm: FormGroup;
  authlogs: any[] = [];

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private excelService: ExcelExportService
  ) {
    this.tableSearchForm = formBuilder.group({
      "date": [null, Validators.compose([Validators.required])],
    });;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Attendance", "", "Attendance Logs")
    });

    this.tableSearchForm.patchValue({
      "date": new Date().toLocaleDateString('en-CA')
    });

    this.fetch();
  }

  fetch() {
    $('#authlog-view-section').find('.table-processing').show()
    this.spinner.show();

    this.adminService.fetchAuthLogsForExport({
      "date": this.tableSearchForm.value.date ?? "",
    }).subscribe(res => {
      if (res.status == 'Success') {
        this.authlogs = res.Auth_list;
      } else if (res.status == 'val_error') {
        this.authlogs = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.authlogs = [];
        this.toastr.error(res.message);
      }

      $('#authlog-view-section').find('.table-processing').hide()
      this.spinner.hide();
    }, (err) => {
      this.authlogs = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#authlog-view-section').find('.table-processing').hide()
      this.spinner.hide();
    });
  }

  export() {
    let exportdata: any[] = [];

    this.authlogs.forEach(element => {
      exportdata.push({
        'PERNR': element.PERNR,
        'TIMR6': element.TIMR6,
        'CHOIC': element.CHOIC,
        'LDATE': element.LDATE,
        'LTIME': element.LTIME,
        'SATZA': element.SATZA,
        'TERMINAL_id': element.TERMINAL_id,
        'SERVER_TIME': element.SERVER_TIME,
      })
    });

    this.excelService.exportAsExcelFile(exportdata, 'authlogs');
  }
}
