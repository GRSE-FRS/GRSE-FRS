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
  selector: 'app-admin-designations',
  templateUrl: './designations.component.html',
  styleUrls: ['./designations.component.css']
})
export class AdminDesignationsComponent implements OnInit {
  designations: any[] = [];
  tableOptions: TableOptions;
  designationForm: FormGroup;
  editActionId: String;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
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

    this.designationForm = formBuilder.group({
      "code": [null, Validators.compose([Validators.required])],
      "name": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Designations", "", "Designations")
    });

    this.fetch()
  }

  fetch(page: any = null) {
    $('#designation-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    let searchKeyword: any = ($('#designation-view-section').find('#table-search').val() ?? "")

    this.adminService.fetchDesignations({
      "pageno": this.tableOptions.page,
      "search": searchKeyword?.trim(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.designations = res.designation;

        /** CALCULATING THE PAGINATION NUMBERS */
        let totalDocs = res.count;
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
        this.designations = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.designations = [];
        this.toastr.error(res.message);
      }

      $('#designation-view-section').find('.table-processing').hide()
    }, (err) => {
      this.designations = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#designation-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    this.designationForm.reset();
    Global.scrollToQuery('#designation-view-section')
  }

  add(event: any) {
    this.designationForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.designationForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.createDesignation({
        'code': this.designationForm.value.code,
        'name': this.designationForm.value.name,
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
    this.designationForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.designationForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateDesignation({
        'code': this.designationForm.value.code,
        'name': this.designationForm.value.name,
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
    this.adminService.updateDesignationStatus({
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
        this.adminService.deleteDesignation({
          'id': item.id,
        }).subscribe(res => {
          if (res.status == 'success') {
            // this.toastr.success(res.message);
            this.toastr.success("Designation deleted successfully");
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

  getEdit(item: any) {
    Global.scrollToQuery('#designation-submit-section')
    this.editActionId = item.id;

    this.designationForm.patchValue({
      code: item.code,
      name: item.name,
    });
  }
}
