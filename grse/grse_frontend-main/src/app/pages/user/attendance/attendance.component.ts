import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as Global from 'src/app/globals';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import TableOptions from 'src/app/models/TableOptions';
import * as moment from "moment";
import { UserLayoutComponent } from '../../layouts/user/user.component';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class UserAttendanceComponent implements OnInit {
  filterSearchForm: FormGroup;
  tableOptions: TableOptions;
  authlogs: any[] = [];
  authlogDetails: any = null;
  attendanceFilterMaster: any[] = [];

  constructor(
    public UserLayoutComponent: UserLayoutComponent,
    private userService: UserService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe,
    private excelService: ExcelExportService
  ) {
    this.filterSearchForm = formBuilder.group({
      "start_date": [null, Validators.compose([Validators.required])],
      "end_date": [null, Validators.compose([Validators.required])],
      "employee_id": [null, Validators.compose([])],
      "attendance": [null, Validators.compose([])],
    });

    this.tableOptions = {
      'page': 1,
      'limit': Global.TableLength,
      'pagingCounter': 0,
      'totalDocs': 0,
      'totalPages': 0,
      'hasNextPage': false,
      'hasPrevPage': false,
      'nextPage': '',
      'prevPage': '',
    };

    this.attendanceFilterMaster = [
      { 'value': "P10", 'description': "P10" },
      { 'value': "P20", 'description': "P20" },
    ]
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.UserLayoutComponent.loadPageTitle("Raw Auth Logs", "", "Raw Auth Logs")
    });

    this.resetFilterForm();
  }

  fetch({ page = <any>null, xlx_export = <Boolean>false } = {}) {
    if (!this.filterSearchForm.valid) {
      this.filterSearchForm.markAllAsTouched();
      setTimeout(function () {
        $('#open-user-filter-modal')?.click();
      }, 500);
      return;
    } else {
      setTimeout(function () {
        $('#open-user-filter-modal')?.find('[data-bs-dismiss="modal"]').click();
      }, 500);
    }

    if (page != null) {
      this.tableOptions.page = page;
    }

    if (xlx_export) {
      this.spinner.show();
    } else {
      $('#authlog-view-section').find('.table-processing').show()
    }

    let params: any = this.getFilterParams();
    params.pageno = xlx_export == true ? 1 : this.tableOptions.page;
    params.export = xlx_export;

    this.userService.fetchUserAttendance(params).subscribe(res => {
      if (xlx_export) {
        if (res.status == 'Success') {
          let authlogs: any[] = [];
          if (res.Total_search && Array.isArray(res.Total_search)) {
            authlogs = res.Total_search ?? [];
          }

          let exportData: any[] = [];
          authlogs.forEach((item: any) => {
            exportData.push({
              "Auth_result": item.Auth_result,
              "Auth_type": item.Auth_type,
              "PERNR": item.PERNR,
              "TIMR6": item.TIMR6,
              "CHOIC": item.CHOIC,
              "LDATE": item.LDATE,
              "LTIME": item.LTIME,
              "SATZA": item.SATZA,
              "TERMINAL_id": item.TERMINAL_id,
              "SERVER_TIME": item.SERVER_TIME,
              "SAP_sync_status": item.SAP_sync_status,
              "SAP_sync_date_time": item.SAP_sync_date_time,
            })
          });

          this.excelService.exportAsExcelFile(exportData, 'rawauthlog');
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
      } else {
        if (res.status == 'Success') {
          this.authlogs = [];
          if (res.Search && Array.isArray(res.Search)) {
            this.authlogs = res.Search ?? [];
          }

          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.All_Search_count;
          let totalPages = Math.ceil(totalDocs / Global.TableLength);
          this.tableOptions = {
            page: this.tableOptions.page,
            limit: Global.TableLength,
            pagingCounter: (this.tableOptions.page - 1) * Global.TableLength,
            totalDocs: totalDocs,
            totalPages: totalPages,
            hasNextPage: (this.tableOptions.page < totalPages),
            hasPrevPage: (this.tableOptions.page > 1),
            nextPage: (this.tableOptions.page + 1 < totalPages) ? this.tableOptions.page + 1 : null,
            prevPage: (this.tableOptions.page > 1) ? this.tableOptions.page - 1 : null
          }
          /** CALCULATING THE PAGINATION NUMBERS */
        } else if (res.status == 'val_error') {
          this.authlogs = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.authlogs = [];
          this.toastr.error(res.message);
        }

        $('#authlog-view-section').find('.table-processing').hide()
      }
    }, (err) => {
      this.authlogs = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#authlog-view-section').find('.table-processing').hide()
      this.spinner.hide();
    });
  }

  fetchDetails(item: any) {
    this.spinner.show();
    this.userService.fetchUserAttendanceDetails({
      'IndexKey': item?.IndexKey ?? "",
      'UniqueID': item?.PERNR ?? "",
    }).subscribe(res => {
      if (res?.status == "Success") {
        $('#open-attendance-details-modal')?.click();
        item.details = res?.Auth_list ?? null;
        this.authlogDetails = item;
      } else {
        this.authlogDetails = null;
        this.toastr.error(res.message);
      }

      this.spinner.hide();
    }, (err) => {
      this.authlogDetails = null;
      this.toastr.error(Global.showServerErrorMessage(err));
      this.spinner.hide();
    });
  }

  openfilterModal() {
    $('#open-user-filter-modal')?.click();
  }

  resetFilterForm() {
    Global.resetForm(this.filterSearchForm);

    this.filterSearchForm.patchValue({
      // "start_date": moment("2021-01-01", 'YYYY-MM-DD').format('YYYY-MM-DDTHH:MM'),
      // "end_date": moment().format('YYYY-MM-DDTHH:MM'),
      "start_date": moment().format('DD-MM-YYYY') + ' 12:00 AM',
      "end_date": moment().format('DD-MM-YYYY') + ' 11:59 PM',
    });

    this.fetch({ page: 1 })
  }

  getFilterParams() {
    let search_status: boolean = false;
    let start_date: any = "";
    let start_time: any = "";
    let end_date: any = "";
    let end_time: any = "";
    let employee_id: any = "";
    let attendance: any[] = [];

    if (this.filterSearchForm.value.start_date) {
      let start = moment(this.filterSearchForm.value.start_date, 'DD-MM-YYYY hh:mm A');

      // start_date = start.format('DD.MM.YYYY')
      start_date = start.format('YYYY-MM-DD')
      start_time = start.format('HH:mm') + ':00'
      search_status = true;
    }

    if (this.filterSearchForm.value.end_date) {
      let end = moment(this.filterSearchForm.value.end_date, 'DD-MM-YYYY hh:mm A');

      // end_date = end.format('DD.MM.YYYY');
      end_date = end.format('YYYY-MM-DD');
      end_time = end.format('HH:mm') + ':59';
      search_status = true;
    }

    if (this.filterSearchForm.value.employee_id) {
      employee_id = this.filterSearchForm.value.employee_id;
      search_status = true;
    }

    if (this.filterSearchForm.value.attendance && Array.isArray(this.filterSearchForm.value.attendance) && this.filterSearchForm.value.attendance.length > 0) {
      search_status = true;

      attendance = [];
      this.filterSearchForm.value.attendance.forEach((element: any) => {
        attendance.push(element.value)
      });
    }

    let params = {
      "search_status": search_status,
      // "start_date": start_date,
      // "start_time": start_time,
      // "end_date": end_date,
      // "end_time": end_time,
      "start_date": start_date + " " + start_time,
      "end_date": end_date + " " + end_time,
      // "employee_id": employee_id,
      "attendance": attendance.length > 0 ? attendance : ["", "P10", "P20"],
    }

    return params;
  }
}
