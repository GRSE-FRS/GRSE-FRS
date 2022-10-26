import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';

@Component({
  selector: 'app-admin-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class AdminDepartmentsComponent implements OnInit {
  departments: any[] = [];
  subareaMaster: any[] = [];

  hodUserMaster: any[] = [];
  nodalUserMaster: any[] = [];
  nodalSecurityMaster: any[] = [];
  nodalMedicalMaster: any[] = [];
  nodalHrMaster: any[] = [];
  nodalAjsMaster: any[] = [];
  nodalSafetyMaster: any[] = [];
  hodFunctionalUserMaster: any[] = [];

  tableOptions: TableOptions;
  employeeTableOptions: TableOptions;

  departmentForm: FormGroup;
  editActionId: String;
  fieldNameSearched: any = null;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.employeeTableOptions = this.tableOptions = {
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

    this.departmentForm = formBuilder.group({
      "clms_nodal_ajs": [null, Validators.compose([])],
      "clms_nodal_hr": [null, Validators.compose([])],
      "clms_nodal_medical": [null, Validators.compose([])],
      "clms_nodal_safety": [null, Validators.compose([])],
      "clms_nodal_secu": [null, Validators.compose([])],
      "clms_nodal_user": [null, Validators.compose([])],
      "costcntr": [null, Validators.compose([Validators.required])],
      "dept_group": [null, Validators.compose([Validators.required])],
      "hod_functional_area": [null, Validators.compose([Validators.required])],
      "hod_man": [null, Validators.compose([Validators.required])],
      "shop_name": [null, Validators.compose([Validators.required])],
      // "status": [null, Validators.compose([Validators.required])],
      "subarea_id": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Departments", "", "Departments")
    });

    this.fetch()
    this.fetchMaster();
  }

  fetch(page: any = null) {
    $('#department-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    let searchKeyword: any = ($('#department-view-section').find('#table-search').val() ?? "")

    this.adminService.fetchDepartments({
      "page_no": this.tableOptions.page,
      "search": searchKeyword?.trim(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.departments = res.Department_List ?? [];

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
        this.departments = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.departments = [];
        this.toastr.error(res.message);
      }

      $('#department-view-section').find('.table-processing').hide()
    }, (err) => {
      this.departments = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#department-view-section').find('.table-processing').hide()
    });
  }

  fetchMaster() {
    this.spinner.show();

    this.adminService.fetchSubareas({}).subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.subareaMaster = [];
        res.subarea.forEach((element: any) => {
          this.subareaMaster.push({
            'id': element.id,
            'description': element.name,
          })
        });
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

  cancelSubmit() {
    this.editActionId = '';
    Global.resetForm(this.departmentForm)
    Global.scrollToQuery('#department-view-section')
  }

  add(event: any) {
    this.departmentForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.departmentForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.createDepartment({
        'clms_nodal_ajs': this.departmentForm.value.clms_nodal_ajs?.employee_id ?? "",
        'clms_nodal_hr': this.departmentForm.value.clms_nodal_hr?.employee_id ?? "",
        'clms_nodal_medical': this.departmentForm.value.clms_nodal_medical?.employee_id ?? "",
        'clms_nodal_safety': this.departmentForm.value.clms_nodal_safety?.employee_id ?? "",
        'clms_nodal_secu': this.departmentForm.value.clms_nodal_secu?.employee_id ?? "",
        'clms_nodal_user': this.departmentForm.value.clms_nodal_user?.employee_id ?? "",
        'costcntr': this.departmentForm.value.costcntr ?? "",
        'dept_group': this.departmentForm.value.dept_group ?? "",
        'hod_functional_area': this.departmentForm.value.hod_functional_area?.employee_id ?? "",
        'hod_man': this.departmentForm.value.hod_man?.employee_id ?? "",
        'shop_name': this.departmentForm.value.shop_name ?? "",
        'subarea_id': this.departmentForm.value.subarea_id?.id ?? "",
        'status': 'active',
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.fetch(this.tableOptions.page)
          this.cancelSubmit();
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        event.target.classList.remove('btn-loading');
      }, (err) => {
        event.target.classList.remove('btn-loading');
        this.toastr.error(Global.showServerErrorMessage(err));
      });
    }
  }

  edit(event: any) {
    this.departmentForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.departmentForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateDepartment({
        'clms_nodal_ajs': this.departmentForm.value.clms_nodal_ajs?.employee_id ?? "",
        'clms_nodal_hr': this.departmentForm.value.clms_nodal_hr?.employee_id ?? "",
        'clms_nodal_medical': this.departmentForm.value.clms_nodal_medical?.employee_id ?? "",
        'clms_nodal_safety': this.departmentForm.value.clms_nodal_safety?.employee_id ?? "",
        'clms_nodal_secu': this.departmentForm.value.clms_nodal_secu?.employee_id ?? "",
        'clms_nodal_user': this.departmentForm.value.clms_nodal_user?.employee_id ?? "",
        'costcntr': this.departmentForm.value.costcntr ?? "",
        'dept_group': this.departmentForm.value.dept_group ?? "",
        'hod_functional_area': this.departmentForm.value.hod_functional_area?.employee_id ?? "",
        'hod_man': this.departmentForm.value.hod_man?.employee_id ?? "",
        'shop_name': this.departmentForm.value.shop_name ?? "",
        'subarea_id': this.departmentForm.value.subarea_id?.id ?? "",
        'status': 'active',
        'id': this.editActionId,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.fetch(this.tableOptions.page)
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        event.target.classList.remove('btn-loading');
      }, (err) => {
        event.target.classList.remove('btn-loading');
        this.toastr.error(Global.showServerErrorMessage(err));
      });
    }
  }

  changeStatus(item: any) {
    this.adminService.updateDepartmentStatus({
      'id': item.id,
      'status': (item.status == "active") ? 'inactive' : 'active',
    }).subscribe(res => {
      this.fetch(this.tableOptions.page)
      if (res.status == 'success') {
        this.toastr.success(res.message);
      } else if (res.status == 'val_error') {
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.toastr.error(res.message);
      }
    }, (err) => {
      this.fetch(this.tableOptions.page)
      this.toastr.error(Global.showServerErrorMessage(err));
    });
  }

  deleteItem(item: any) {
    swal.fire({
      title: 'Are you sure want to remove?',
      text: 'You will not be able to recover this data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.adminService.deleteDepartment({
          'id': item.id,
        }).subscribe(res => {
          if (res.status == 'success') {
            this.toastr.success(res.message);
            this.fetch(this.tableOptions.page)
          } else {
            this.toastr.error(res.message);
          }
        }, (err) => {
          this.toastr.error(Global.showServerErrorMessage(err));
        });
      } else if (result.dismiss === swal.DismissReason.cancel) {
        swal.fire(
          'Cancelled',
          'Your data is safe :)',
          'error'
        )
      }
    })
  }

  async getEdit(item: any) {
    this.spinner.show();
    this.editActionId = item.id;
    Global.resetForm(this.departmentForm);

    await this.userListSearched('hod', item.hod_man);
    await this.userListSearched('nodaluser', item.clms_nodal_user);
    await this.userListSearched('nodalsecurity', item.clms_nodal_secu);
    // await this.userListSearched('nodalmedical', item.clms_nodal_medical);
    await this.userListSearched('nodalhr', item.clms_nodal_hr);
    await this.userListSearched('nodalajs', item.clms_nodal_ajs);
    // await this.userListSearched('nodalsafety', item.clms_nodal_safety);
    await this.userListSearched('hodfunct', item.hod_functional_area);

    this.departmentForm.patchValue({
      'clms_nodal_ajs': this.nodalAjsMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_ajs ?? null
      }) ?? null,
      'clms_nodal_hr': this.nodalHrMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_hr ?? null
      }) ?? null,
      'clms_nodal_medical': this.nodalMedicalMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_medical ?? null
      }) ?? null,
      'clms_nodal_safety': this.nodalSafetyMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_safety ?? null
      }) ?? null,
      'clms_nodal_secu': this.nodalSecurityMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_secu ?? null
      }) ?? null,
      'clms_nodal_user': this.nodalUserMaster.find((obj: any) => {
        return obj.employee_id == item.clms_nodal_user ?? null
      }) ?? null,
      'costcntr': item.costcntr ?? "",
      'dept_group': item.dept_group ?? "",
      'hod_functional_area': this.hodFunctionalUserMaster.find((obj: any) => {
        return obj.employee_id == item.hod_functional_area ?? null
      }) ?? null,
      'hod_man': this.hodUserMaster.find((obj: any) => {
        return obj.employee_id == item.hod_man ?? null
      }) ?? null,
      'shop_name': item.shop_name ?? "",
      'subarea_id': this.subareaMaster.find((obj: any) => {
        return obj.id == item.subarea_id ?? null
      }) ?? null,
    });

    this.spinner.hide();
    Global.scrollToQuery('#department-submit-section')
  }

  // openEmployeeSearchModal({
  //   field_name = <any>null,
  // }) {
  //   this.fieldNameSearched = field_name;
  //   $('#open-user-fetch-modal').click();
  //   this.fetchEmployees();
  // }

  // fetchEmployees() {
  //   this.spinner.show();

  //   // let employee_id = String(this.tableSearchForm.value.employee_id ?? "").trim();
  //   // let cost_cntr = String(this.tableSearchForm.value.cost_cntr ?? "").trim();
  //   // let name = String(this.tableSearchForm.value.name ?? "").trim();

  //   let employee_id = "";
  //   let name = "";

  //   this.adminService.fetchUsers({
  //     "role": 3,
  //     // "pageno": this.employeeTableOptions.page,
  //     "pageno": 1,
  //     "emoloyee_id": employee_id,
  //     "name": name,
  //     "search_status": (employee_id || name) ? true : false,

  //     "cost_cntr": "",
  //     "Filter": false,
  //     "filter_params": {
  //       "status": "",
  //       "alpeta_user_id": "",
  //       "biometric_reg": "",
  //       "start_date": "",
  //       "end_date": "",
  //       "Alpeta_Reg_date": "",
  //     },
  //     "export": false,
  //   }).subscribe(res => {
  //     this.spinner.hide();
  //     if (res.status == 'success') {
  //       this.userList = res.Users;

  //       /** CALCULATING THE PAGINATION NUMBERS */
  //       let totalDocs = res.SearchCount;
  //       let totalPages = Math.ceil(totalDocs / Global.TableLength);
  //       this.employeeTableOptions = {
  //         page: this.employeeTableOptions.page,
  //         limit: Global.TableLength,
  //         pagingCounter: (this.employeeTableOptions.page - 1) * Global.TableLength,
  //         totalDocs: totalDocs,
  //         totalPages: totalPages,
  //         hasNextPage: (this.employeeTableOptions.page < totalPages),
  //         hasPrevPage: (this.employeeTableOptions.page > 1),
  //         nextPage: (this.employeeTableOptions.page + 1 < totalPages) ? this.employeeTableOptions.page + 1 : null,
  //         prevPage: (this.employeeTableOptions.page > 1) ? this.employeeTableOptions.page - 1 : null
  //       }
  //       /** CALCULATING THE PAGINATION NUMBERS */
  //     } else if (res.status == 'val_error') {
  //       this.userList = [];
  //       this.toastr.error(Global.showValidationMessage(res.errors));
  //     } else {
  //       this.userList = [];
  //       this.toastr.error(res.message);
  //     }
  //   }, (err) => {
  //     this.userList = [];
  //     this.toastr.error(Global.showServerErrorMessage(err));
  //     $('#user-view-section').find('.table-processing').hide()
  //   });

  // }

  // useEmployeeId(field_name: any, employee_id: any) {
  //   this.departmentForm.patchValue({
  //     [field_name]: employee_id
  //   });

  //   $('#user-fetch-modal').find('[data-bs-dismiss="modal"]').click();
  // }

  userListSearched(type: any, event: any) {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.adminService.fetchUsers({
        "role": 3,
        "emoloyee_id": event,
        "search_status": event ? true : false,

        "pageno": 1,
        "name": "",
        "cost_cntr": "",
        "aadhar": "",
        "Filter": false,
        "export": true,
        "filter_params": {
          "status": "",
          "alpeta_user_id": "",
          "biometric_reg": "",
          "start_date": "",
          "end_date": "",
          "Alpeta_Reg_date": "",
        },
      }).subscribe(res => {
        let userList: any[] = [];
        if (res.status == 'success') {
          res.Users.forEach((element: any) => {
            userList.push({ 'id': element.id, 'employee_id': element.employee_id, 'full_name': element.full_name, 'description': element.full_name + " (#" + element.employee_id + ")" })
          });
        } else if (res.status == 'val_error') {
          $this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          $this.toastr.error(res.message);
        }

        $this.defineUserValue(type, userList);
        resolve(true);
      }, (err) => {
        $this.defineUserValue(type, []);
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  defineUserValue(type: any, users: any[]) {
    switch (type) {
      case 'hod':
        this.hodUserMaster = users;
        break;

      case 'nodaluser':
        this.nodalUserMaster = users;
        break;

      case 'nodalsecurity':
        this.nodalSecurityMaster = users;
        break;

      case 'nodalmedical':
        this.nodalMedicalMaster = users;
        break;

      case 'nodalhr':
        this.nodalHrMaster = users;
        break;

      case 'nodalajs':
        this.nodalAjsMaster = users;
        break;

      case 'nodalsafety':
        this.nodalSafetyMaster = users;
        break;

      case 'hodfunct':
        this.hodFunctionalUserMaster = users;
        break;

      default:
        this.toastr.error("Invalid Search Type");
        return;
    }
  }
}
