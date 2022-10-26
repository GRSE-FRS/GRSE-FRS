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
  selector: 'app-admin-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class AdminShiftsComponent implements OnInit {
  shifts: any[] = [];
  tableOptions: TableOptions;
  shiftForm: FormGroup;
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

    this.shiftForm = formBuilder.group({
      "code": [null, Validators.compose([Validators.required])],
      "name": [null, Validators.compose([Validators.required])],
      "shift_start_time": [null, Validators.compose([Validators.required])],
      "shift_end_time": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Shifts", "", "Shifts")
    });

    this.fetch()
  }

  fetch(page: any = null) {
    $('#shift-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    let searchKeyword: any = ($('#shift-view-section').find('#table-search').val() ?? "")

    this.adminService.fetchShifts({
      "pageno": this.tableOptions.page,
      "search": searchKeyword?.trim(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.shifts = res.shift;

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
        this.shifts = [];
        this.tableOptions = Global.resetTableOptions();
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.shifts = [];
        this.tableOptions = Global.resetTableOptions();
        this.toastr.error(res.message);
      }

      $('#shift-view-section').find('.table-processing').hide()
    }, (err) => {
      this.shifts = [];
      this.tableOptions = Global.resetTableOptions();
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#shift-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    this.shiftForm.reset();
    Global.scrollToQuery('#shift-view-section')
  }

  add(event: any) {
    this.shiftForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.shiftForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.createShift({
        'code': this.shiftForm.value.code,
        'name': this.shiftForm.value.name,
        'shift_start_time': this.shiftForm.value.shift_start_time,
        'shift_end_time': this.shiftForm.value.shift_end_time,
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
    this.shiftForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.shiftForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateShift({
        'code': this.shiftForm.value.code,
        'name': this.shiftForm.value.name,
        'shift_start_time': this.shiftForm.value.shift_start_time,
        'shift_end_time': this.shiftForm.value.shift_end_time,
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
    this.adminService.updateShiftStatus({
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
        this.adminService.deleteShift({
          'id': item.id,
        }).subscribe(res => {
          if (res.status == 'success') {
            // this.toastr.success(res.message);
            this.toastr.success("Shift deleted successfully");
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
    Global.scrollToQuery('#shift-submit-section')
    this.editActionId = item.id;

    this.shiftForm.patchValue({
      shift_start_time: item.shift_start_time,
      shift_end_time: item.shift_end_time,
      name: item.name,
      code: item.code,
    });
  }
}
