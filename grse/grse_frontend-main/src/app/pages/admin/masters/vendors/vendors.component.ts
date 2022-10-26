import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';

@Component({
  selector: 'app-admin-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.css']
})
export class AdminVendorsComponent implements OnInit {
  vendors: any[] = [];
  tableOptions: TableOptions;
  vendorForm: FormGroup;
  editActionId: String;

  vendorDetails: any = null;
  vendorPOUsers: any[] = [];

  fromPanel: string = "";

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    public UserLayoutComponent: UserLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
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

    this.vendorForm = formBuilder.group({
      "name": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';

    this.fromPanel = (this.router.url.split('/'))[1] ?? "";
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.fromPanel == 'user')
        this.UserLayoutComponent.loadPageTitle("Manage Contractors", "", "Contractors")
      else
        this.AdminLayoutComponent.loadPageTitle("Manage Contractors", "", "Contractors")

      this.fetch()
    })
  }

  fetch(page: any = null) {
    if (page != null) {
      this.tableOptions.page = page;
    }

    let searchKeyword: any = ($('#vendor-view-section').find('#table-search').val() ?? "")

    $('#vendor-view-section').find('.table-processing').show()
    this.adminService.fetchVendors({
      "page_no": this.tableOptions.page,
      // "search": $('#vendor-view-section').find('#table-search').val() ?? "all",
      "search": searchKeyword?.trim(),
      // "search": "all",
    }).subscribe(res => {
      if (res.status == 'success') {
        this.vendors = res.VendorList ?? [];

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
        this.vendors = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.vendors = [];
        this.toastr.error(res.message);
      }

      $('#vendor-view-section').find('.table-processing').hide()
    }, (err) => {
      this.vendors = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#vendor-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    this.vendorForm.reset();
    Global.scrollToQuery('#vendor-view-section')
  }

  add(event: any) {
    this.vendorForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.vendorForm.valid) {
      this.toastr.error("Operation under maintenance");
      return;

      event.target.classList.add('btn-loading');

      this.adminService.createVendor({
        'name': this.vendorForm.value.name,
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
    this.vendorForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.vendorForm.valid) {
      this.toastr.error("Operation under maintenance");
      return;

      event.target.classList.add('btn-loading');

      this.adminService.updateVendor({
        'name': this.vendorForm.value.name,
        'vendor_id': this.editActionId,
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
    this.adminService.updateVendorStatus({
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
        this.toastr.error("Operation under maintenance");
        this.fetch();
        return;

        this.adminService.deleteVendor({
          'vendor_id': item._id,
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

  getEdit(item: any) {
    Global.scrollToQuery('#vendor-submit-section')
    this.editActionId = item._id;

    this.vendorForm.patchValue({
      name: item.name,
    });
  }

  viewDetails(item: any) {
    this.spinner.show();
    this.adminService.fetchVendorDetails({
      'vendor_code': item.vd_code,
    }).subscribe(async res => {
      if (res.status == 'success') {
        this.vendorDetails = {
          assigned_po: res.vendor_details ?? [],
          vendor_info: res.vendor_info
        };

        // this.fetchDmCodeValues(this.vendorDetails.vendor_info.unique_id, []);

        $('#open-user-quickview-modal').click();
      } else {
        this.toastr.error(res.message);
      }

      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      this.toastr.error(Global.showServerErrorMessage(err));
    });
  }

  viewPoAssignedEmp(item: any) {
    if ((item.user_details ?? []).length > 0) {
      this.vendorPOUsers = (item.user_details ?? []);
      // $('#open-po-employees-modal')?.click();
      let modal: any = $('#po-employees-modal');
      if (modal)
        modal.modal('show');
    }
  }

  fetchDmCodeValues(formid: any, dmArr: any[]) {
    return new Promise((resolve, reject) => {
      this.spinner.show();
      this.adminService.initCrFormOnboard({
        'unique_id': formid,
        'demog_code': dmArr,
      }).subscribe(res => {
        this.spinner.hide();
        console.log(res);
        resolve(true)
      }, (err) => {
        this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true)
      })
    })
  }
}

