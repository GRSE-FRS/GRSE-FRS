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
  selector: 'app-admin-purchaseorders',
  templateUrl: './purchaseorders.component.html',
  styleUrls: ['./purchaseorders.component.css']
})
export class AdminPurchaseordersComponent implements OnInit {
  Global = Global;
  purchaseorders: any[] = [];
  vendorMaster: any[] = [];
  poNumberMaster: any[] = [];
  tableOptions: TableOptions;
  purchaseOrderForm: FormGroup;
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

    this.purchaseOrderForm = formBuilder.group({
      "po_number": [null, Validators.compose([Validators.required])],
      "po_date": [{ value: null, disabled: true }, Validators.compose([Validators.required])],
      "po_title": [null, Validators.compose([Validators.required])],
      "po_details": [null, Validators.compose([])],
      "supplier_code": [{ value: null, disabled: true }, Validators.compose([Validators.required])],
      "assign_date": [null, Validators.compose([Validators.required])],
      "expiry": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';

    // this.purchaseOrderForm.get('supplier_code')?.valueChanges
    //   .subscribe(val => {
    //     if (val?.vd_code) {
    //       $('.assign-expiry-fields').show(500);
    //       this.purchaseOrderForm.controls['assign_date'].setValidators([Validators.required]);
    //       this.purchaseOrderForm.controls['expiry'].setValidators([Validators.required]);
    //     } else {
    //       $('.assign-expiry-fields').hide(500);
    //       this.purchaseOrderForm.controls['assign_date'].clearValidators();
    //       this.purchaseOrderForm.controls['expiry'].clearValidators();

    //       this.purchaseOrderForm.patchValue({
    //         'assign_date': null,
    //         'expiry': null,
    //       })
    //     }

    //     this.purchaseOrderForm.controls['assign_date'].updateValueAndValidity();
    //     this.purchaseOrderForm.controls['expiry'].updateValueAndValidity();
    //   });

    this.purchaseOrderForm.get('po_number')?.valueChanges
      .subscribe(val => {
        if (!this.editActionId) {
          if (val) {
            this.purchaseOrderForm.patchValue({
              'po_date': val.po_date ?? null,
              'po_title': val.po_title ?? null,
              'supplier_code': val.vendor_code ?? null,
            });
          } else {
            this.purchaseOrderForm.patchValue({
              'po_date': null,
              'supplier_code': null,
            });
          }
        }
      });
  }

  async ngOnInit() {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Purchase Orders", "", "Purchase Orders")
    })

    // await this.fetchVendors();
    this.fetch()
  }

  fetchVendors() {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.spinner.show();
      $this.adminService.fetchVendors({}).
        subscribe(res => {
          $this.spinner.hide();
          $this.vendorMaster = res?.VendorList ?? [];
          resolve(true)
        }, (err) => {
          $this.spinner.hide();
          $this.vendorMaster = [];
          $this.toastr.error(Global.showServerErrorMessage(err));
          resolve(true)
        });
    });
  }

  fetch(page: any = null) {
    $('#purchaseorder-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    this.adminService.fetchPurchaseOrders({
      "page_no": this.tableOptions.page,
      "search": $('#purchaseorder-view-section').find('#table-search').val(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.purchaseorders = res?.POMasterList ?? [];

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
        this.purchaseorders = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.purchaseorders = [];
        this.toastr.error(res.message);
      }

      $('#purchaseorder-view-section').find('.table-processing').hide()
    }, (err) => {
      this.purchaseorders = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#purchaseorder-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    this.poNumberMaster = [];
    Global.resetForm(this.purchaseOrderForm);
    Global.scrollToQuery('#purchaseorder-view-section')

    this.purchaseOrderForm.controls['po_number'].enable();
    this.purchaseOrderForm.controls['assign_date'].enable();
    this.purchaseOrderForm.controls['expiry'].enable();
  }

  add(event: any) {
    this.purchaseOrderForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.purchaseOrderForm.valid && this.customPoFormValid() == true) {
      event.target.classList.add('btn-loading');

      this.adminService.createPurchaseOrder({
        "assign_date": this.purchaseOrderForm.value?.assign_date ?? "",
        "expiry": this.purchaseOrderForm.value?.expiry ?? "",
        "po_date": this.purchaseOrderForm.value?.po_number?.po_date ?? "",
        "po_number": this.purchaseOrderForm.value.po_number?.po_number ?? "",
        "po_title": this.purchaseOrderForm.value?.po_title ?? "",
        "po_details": this.purchaseOrderForm.value?.po_details ?? "",
        "supplier_code": this.purchaseOrderForm.value?.po_number?.vendor_code ?? "",
        "status": "active",
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
    this.purchaseOrderForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.purchaseOrderForm.valid && this.customPoFormValid() == true) {
      event.target.classList.add('btn-loading');

      this.adminService.updatePurchaseOrder({
        // "assign_date": this.purchaseOrderForm.value?.assign_date ?? "",
        // "expiry": this.purchaseOrderForm.value?.expiry ?? "",
        // "po_date": this.purchaseOrderForm.value?.po_date ?? "",
        // "po_number": this.purchaseOrderForm.value.po_number ?? "",
        "po_title": this.purchaseOrderForm.value?.po_title ?? "",
        "po_details": this.purchaseOrderForm.value?.po_details ?? "",
        // "supplier_code": this.purchaseOrderForm.value?.supplier_code?.vd_code ?? "",
        "id": this.editActionId,
        // "status": "active",
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
    this.spinner.show();
    this.adminService.updatePurchaseOrderStatus({
      'id': item.id,
      'status': (item.status == "active") ? 'inactive' : 'active',
    }).subscribe(res => {
      this.spinner.hide();
      this.fetch(this.tableOptions.page)
      if (res.status == 'success') {
        this.toastr.success(res.message);
      } else if (res.status == 'val_error') {
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.toastr.error(res.message);
      }
    }, (err) => {
      this.spinner.hide();
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
        this.spinner.show();
        this.adminService.deletePurchaseOrder({
          'id': item.id,
        }).subscribe(res => {
          this.spinner.hide();
          if (res.status == 'success') {
            this.toastr.success(res.message);
            this.fetch(this.tableOptions.page)
          } else {
            this.toastr.error(res.message);
          }
        }, (err) => {
          this.spinner.hide();
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
    this.cancelSubmit();
    this.editActionId = item.id;
    console.log(item.po_title);
    this.purchaseOrderForm.patchValue({
      'po_number': item.po_number ?? null,
      'po_date': item.po_date ?? null,
      'po_title': item.po_title ?? null,
      'assign_date': item.assign_date ?? null,
      'expiry': item.expiry ?? null,
      'po_details': item.po_details ?? null,
      'supplier_code': item.supplier_code ?? null,
    });

    Global.scrollToQuery('#purchaseorder-submit-section')

    this.purchaseOrderForm.controls['po_number'].disable();
    this.purchaseOrderForm.controls['assign_date'].disable();
    this.purchaseOrderForm.controls['expiry'].disable();
  }

  viewDetails(item: any) {

  }

  customPoFormValid() {
    if (this.purchaseOrderForm.value.assign_date && this.purchaseOrderForm.value.expiry) {
      const assign_date = new Date(this.purchaseOrderForm.value.assign_date);
      const expiry = new Date(this.purchaseOrderForm.value.expiry);

      if (expiry < assign_date) {
        this.toastr.error("The expiry date should be greater than assign date");
        return false;
      }
    }

    return true;
  }

  poNumberSearched(event: any) {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.poNumberMaster = [];

      $this.adminService.searchPurchaseOrderNumberMaster({
        "search": event,
      }).subscribe(res => {
        if (res.status == "success") {
          let output = res.output;
          output.forEach((element: any) => {
            element.description = element.po_number + (element.po_title ? ' ( ' + element.po_title + ' )' : '');
          });

          $this.poNumberMaster = output;
        }
        resolve(true);
      }, (err) => {
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }
}

