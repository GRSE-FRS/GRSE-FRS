import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AdminAttendanceComponent implements OnInit {
  attendancelogs: any[] = [];
  attendancelogDetails: any;
  searchCategoryMaster: any[];
  tableOptions: TableOptions;
  searchForm: FormGroup;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private datePipe: DatePipe
  ) {
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

    this.searchForm = formBuilder.group({
      "daterange": [null, Validators.compose([])],
      "search_category": [null, Validators.compose([])],
      "search_keyword": [null],
    });

    this.searchCategoryMaster = [
      { 'value': 'terminal_id', 'description': "Search by Terminal ID" },
      { 'value': 'terminal_name', 'description': "Search by Terminal Name" },
      { 'value': 'user_id', 'description': "Seach by Alpeta User ID" },
      { 'value': 'user_name', 'description': "Search by User Name" },
    ];

    this.searchForm.get('search_category')?.valueChanges.subscribe(val => {
      $('#search-form').find('#search-keyword').val('');
      if (!val.value) {
        $('#search-form').find('#search-keyword').attr('disabled', 'true');
      } else {
        $('#search-form').find('#search-keyword').removeAttr('disabled');
      }
    });

    this.attendancelogDetails = null;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Attendance Logs", "", "Attendance Logs")
    });

    const vle = this
    setTimeout(function () {
      $('#search-form').find('#search-keyword').attr('disabled', 'true');
      vle.fetch()
    }, 1000);
  }

  fetch(page: any = null) {
    $('#attendancelog-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    var daterange: any = $('#search-form').find('#daterange-picker').val();
    var start_date = null;
    var end_date = null;
    if (daterange) {
      start_date = daterange.split('-')[0];
      end_date = daterange.split('-')[0];

      start_date = this.datePipe.transform(start_date, 'YYYY-MM-dd')
      end_date = this.datePipe.transform(end_date, 'YYYY-MM-dd')
    }

    this.adminService.fetchAttendanceLogs({
      "pageno": this.tableOptions.page,
      "start_date": start_date,
      "end_date": end_date,
      "search_category": this.searchForm.value.search_category?.value,
      "search_keyword": this.searchForm.value.search_keyword,
    }).subscribe(res => {
      if (res.status == 'success') {
        this.attendancelogs = res.authlogs.docs;

        this.tableOptions = {
          page: res.authlogs.page,
          limit: res.authlogs.limit,
          pagingCounter: res.authlogs.pagingCounter,
          totalDocs: res.authlogs.totalDocs,
          totalPages: res.authlogs.totalPages,
          hasNextPage: res.authlogs.hasNextPage,
          hasPrevPage: res.authlogs.hasPrevPage,
          nextPage: res.authlogs.nextPage,
          prevPage: res.authlogs.prevPage,
        }
      } else if (res.status == 'val_error') {
        this.attendancelogs = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.attendancelogs = [];
        this.toastr.error(res.message);
      }

      $('#attendancelog-view-section').find('.table-processing').hide()
    }, (err) => {
      this.attendancelogs = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#attendancelog-view-section').find('.table-processing').hide()
    });
  }

  resetSearchForm() {
    this.searchForm.reset();

    let searchForm: any = $('#search-form');
    if (searchForm) {
      searchForm[0].reset();
    }

    let daterangepicker: any = $('#search-form').find('#daterange-picker');
    if (daterangepicker) {
      daterangepicker.daterangepicker("refresh");
    }

    this.submitSearchForm();
  }

  submitSearchForm() {
    this.tableOptions.page = 1;
    this.fetch();
  }

  viewDetails(item: any) {
    this.spinner.show();
    this.adminService.viewAttendanceLogDetails({
      'logIndex': item.IndexKey
    }).subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.attendancelogDetails = res.authlog;
        console.log(this.attendancelogDetails);
        $('#open-attendance-details-modal').click();
      } else if (res.status == 'val_error') {
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.toastr.error(res.message);
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error(Global.showServerErrorMessage(err));
    });
  }
}

