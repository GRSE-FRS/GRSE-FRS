import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { UserLayoutComponent } from '../../layouts/user/user.component';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class AdminUserListComponent implements OnInit {
  users: any[] = [];
  regStatusMaster: any[] = [];
  userStatusMaster: any[] = [];
  tableOptions: TableOptions;
  quickUserDetails: any = null;
  filterSearchForm: FormGroup;
  tableSearchForm: FormGroup;

  fromPanel: string = "";

  PageType = {
    'slug': "",
    'name': "",
    'key': "",
    'role_id': 0,
  }

  constructor(
    public UserLayoutComponent: UserLayoutComponent,
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private excelService: ExcelExportService,
    private router: Router,
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

    this.filterSearchForm = formBuilder.group({
      "alpeta_reg_start_date": [null],
      "alpeta_reg_end_date": [null],
      "alpeta_registration": [null],
      "user_status": [null],
    });

    this.tableSearchForm = formBuilder.group({
      "employee_id": [null],
      "cost_cntr": [null],
      "name": [null],
    });

    this.fromPanel = (this.router.url.split('/'))[1] ?? "";

    switch (activatedRoute.snapshot.url[0]?.path) {
      case 'employees':
        this.PageType = {
          'slug': "employees",
          'name': "Employees",
          'key': "employee",
          'role_id': 3,
        }
        break;

      case 'contractlabour':
        this.PageType = {
          'slug': "contractlabour",
          'name': "Contract Labour",
          'key': "contractlabour",
          'role_id': 2,
        }
        break;
    }

    this.regStatusMaster = [
      { 'value': "pending", 'description': "Pending" },
      { 'value': "completed", 'description': "Completed" },
    ];

    this.userStatusMaster = [
      { 'value': "active", 'description': "Active" },
      { 'value': "inactive", 'description': "Inactive" },
    ];
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.fromPanel == 'user')
        this.UserLayoutComponent.loadPageTitle("Manage " + this.PageType.name, "", this.PageType.name)
      else
        this.AdminLayoutComponent.loadPageTitle("Manage " + this.PageType.name, "", this.PageType.name)

      this.fetch()
    })

  }

  fetch({
    page = <any>null,
    xlx_export = <Boolean>false
  } = {}) {
    if (page != null) {
      this.tableOptions.page = page;
    }

    if (xlx_export) {
      this.spinner.show();
    } else {
      $('#user-view-section').find('.table-processing').show()
    }

    let employee_id = String(this.tableSearchForm.value.employee_id ?? "").trim();
    let name = String(this.tableSearchForm.value.name ?? "").trim();

    let cost_cntr = '';
    let aadhar = '';
    if (this.PageType.key == 'contractlabour') {
      aadhar = String(this.tableSearchForm.value.cost_cntr ?? "").trim();
    } else {
      cost_cntr = String(this.tableSearchForm.value.cost_cntr ?? "").trim();
    }


    this.adminService.fetchUsers({
      "role": this.PageType.role_id,
      "pageno": xlx_export == true ? 1 : this.tableOptions.page,

      "emoloyee_id": employee_id,
      "cost_cntr": cost_cntr,
      "aadhar": aadhar,
      "name": name,

      "Filter": (this.getFilterParamsForFetch().alpeta_user_id || this.getFilterParamsForFetch().Alpeta_Reg_date == true || this.getFilterParamsForFetch().status != "not deleted") ? true : false,
      "filter_params": this.getFilterParamsForFetch(),

      "search_status": (employee_id || cost_cntr || aadhar || name) ? true : false,
      "export": xlx_export,
    }).subscribe(res => {
      if (xlx_export) {
        if (res.status == 'success') {
          let users = res.Users;

          let exportData: any[] = [];
          users.forEach((user: any) => {
            if ([3].includes(this.PageType.role_id)) {
              exportData.push({
                "Employee ID": user.employee_id,
                "Cost Center": user.costcntr,
                "Shop Name": user.shop_name,
                "Unit Name": user.unit,
                "Full Name": user.full_name,
                "Employment Type": user.employment_type,
                "Status": user.status,
                "Alpeta User ID": user.alpeta_user_id,
                "Alpeta Registration Date": user.alpeta_created_date,
              })
            } else if ([2].includes(this.PageType.role_id)) {
              exportData.push({
                "Employee ID": user.employee_id,
                "Aadhaar Number": user.costcntr,
                "Full Name": user.full_name,
                "Employment Type": user.employment_type,
                "Status": user.status,
                "Alpeta User ID": user.alpeta_user_id,
                "Alpeta Registration Date": user.alpeta_created_date,
              })
            }
          });

          this.excelService.exportAsExcelFile(exportData, 'usersdata');
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
      } else {
        if (res.status == 'success') {
          this.users = res.Users;

          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.SearchCount;
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
          this.users = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.users = [];
          this.toastr.error(res.message);
        }

        $('#user-view-section').find('.table-processing').hide()
      }
    }, (err) => {
      this.users = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#user-view-section').find('.table-processing').hide()
    });
  }

  quickView(user_id: any) {
    this.spinner.show();
    this.adminService.viewUserDetails(user_id)
      .subscribe(res => {
        this.spinner.hide();
        if (res.status == 'success') {
          $('#open-user-quickview-modal').click();
          this.quickUserDetails = res.user_data?.UserDetails
          this.quickUserDetails.department = res.user_data?.DepartmentDetails ?? null;
          this.quickUserDetails.designation = res.user_data?.DEsignationDetails ?? null;
          this.quickUserDetails.shift = res.user_data?.ShiftDetails ?? null;
          this.quickUserDetails.group_info = res.user_data?.Group_info ?? null;
          this.quickUserDetails.assignedTerminals = res.user_data?.TerminalDetails ?? [];

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

  resetFilterSearchForm() {
    Global.resetForm(this.filterSearchForm);
    Global.resetForm(this.tableSearchForm);
    $('#user-filter-modal').find('[data-bs-dismiss="modal"]').click();
    this.fetch({ page: 1 });
  }

  submitFilterSearchForm(event: any) {
    this.filterSearchForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.filterSearchForm.valid) {
      Global.resetForm(this.tableSearchForm);
      $('#user-filter-modal').find('[data-bs-dismiss="modal"]').click();
      this.fetch({ page: 1 });
    }
  }

  getFilterParamsForFetch() {
    let obj = {
      "status": this.filterSearchForm.value.user_status?.value ?? "not deleted",

      "alpeta_user_id": this.filterSearchForm.value.alpeta_registration?.value ? (this.filterSearchForm.value.alpeta_registration?.value == 'completed' ? "not null" : "null") : "",
      "biometric_reg": this.filterSearchForm.value.alpeta_registration?.value == 'completed' ? true : false,
      // "biometric_reg": false,

      "start_date": this.filterSearchForm.value.alpeta_reg_start_date ?? null,
      "end_date": this.filterSearchForm.value.alpeta_reg_end_date ?? null,
      "Alpeta_Reg_date": (this.filterSearchForm.value.alpeta_reg_start_date || this.filterSearchForm.value.alpeta_reg_end_date) ? true : false,
    }

    if (obj.Alpeta_Reg_date) {
      if (!obj.start_date) {
        obj.start_date = "2021-01-01";
      }

      if (!obj.end_date) {
        obj.end_date = new Date().toLocaleDateString('en-CA');
      }

      obj.start_date = obj.start_date + " 00:00:00";
      obj.end_date = obj.end_date + " 11:59:59";
    }

    return obj;
  }
}

