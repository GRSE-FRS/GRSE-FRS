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
  selector: 'app-admin-crform-demogmaster',
  templateUrl: './crform-demogmaster.component.html',
  styleUrls: ['./crform-demogmaster.component.css']
})
export class AdminCrformDemogmasterComponent implements OnInit {
  Global = Global;
  demogmasters: any[] = [];
  typeMaster: any[] = [];
  requiredMaster: any[] = [];
  tableOptions: TableOptions;
  demogMasterForm: FormGroup;
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

    this.demogMasterForm = formBuilder.group({
      "name": [null, Validators.compose([Validators.required])],
      "code": [null, Validators.compose([Validators.required])],
      "type": [null, Validators.compose([Validators.required])],
      "value": [null, Validators.compose([])],
      "is_required": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';

    this.typeMaster = [
      { 'value': "text", 'description': "Text Input Field" },
      { 'value': "number", 'description': "Number Input Field" },
      { 'value': "date", 'description': "Date Input Field" },
      { 'value': "datetime-local", 'description': "Date/Time Input Field" },
      { 'value': "yesno", 'description': "Yes/No Radio Fields" },
      { 'value': "acknowledge-ck", 'description': "Acknowledgement Check Box" },
      { 'value': "select-options", 'description': "Select Options" },
    ];

    this.requiredMaster = [
      { 'value': true, 'description': "Required Field" },
      { 'value': false, 'description': "Optional Field" },
    ];

    this.demogMasterForm.get('type')?.valueChanges.subscribe(val => {
      if (['select-options'].includes(val.value)) {
        this.demogMasterForm.controls['value'].setValidators([Validators.required]);
        $('#dm-value-fields').show(100);
      } else {
        this.demogMasterForm.controls['value'].clearValidators();
        $('#dm-value-fields').hide(100);
      }

      this.demogMasterForm.controls['value'].updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("CR Form Demog Master", "", "CR Form Demog Master")
    });

    this.fetch()
  }

  fetch(page: any = null) {
    $('#demogmaster-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    let searchKeyword: any = ($('#demogmaster-view-section').find('#table-search').val() ?? "")

    this.adminService.fetchDemogMasters({
      "pageno": this.tableOptions.page,
      "search": searchKeyword?.trim(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.demogmasters = res?.DemogList ?? [];

        /** CALCULATING THE PAGINATION NUMBERS */
        let totalDocs = res?.SearchCount ?? 0;
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
        this.demogmasters = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.demogmasters = [];
        this.toastr.error(res.message);
      }

      $('#demogmaster-view-section').find('.table-processing').hide()
    }, (err) => {
      this.demogmasters = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#demogmaster-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    Global.resetForm(this.demogMasterForm)
    Global.scrollToQuery('#demogmaster-view-section')
    $('[formcontrolname="code"]').removeAttr('readonly');
  }

  add(event: any) {
    this.demogMasterForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.demogMasterForm.valid) {
      event.target.classList.add('btn-loading');
      this.adminService.createDemogMaster({
        'name': this.demogMasterForm.value.name ?? "",
        'code': this.demogMasterForm.value.code ?? "",
        'type': this.demogMasterForm.value.type?.value ?? "",
        'is_required': this.demogMasterForm.value.is_required?.value ?? "",
        'value': this.demogMasterForm.value.value ?? "",
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
    this.demogMasterForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.demogMasterForm.valid) {
      event.target.classList.add('btn-loading');
      this.adminService.updateDemogMaster({
        'name': this.demogMasterForm.value.name ?? "",
        'code': this.demogMasterForm.value.code ?? "",
        'type': this.demogMasterForm.value.type?.value ?? "",
        'is_required': this.demogMasterForm.value.is_required?.value ?? "",
        'value': this.demogMasterForm.value.value ?? "",
        'status': "active",
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
    this.spinner.show();
    this.adminService.updateDemogMasterStatus({
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
        this.adminService.deleteDemogMaster({
          'id': item.id,
        }).subscribe(res => {
          if (res.status == 'success') {
            this.toastr.success(res.message);
            this.fetch(this.tableOptions.page)
          } else {
            this.toastr.error(res.message);
          }

          this.spinner.hide();
        }, (err) => {
          this.toastr.error(Global.showServerErrorMessage(err));
          this.spinner.hide();
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
    Global.scrollToQuery('#demogmaster-submit-section')
    Global.resetForm(this.demogMasterForm)
    this.editActionId = item.id;

    this.demogMasterForm.patchValue({
      'name': item.name ?? "",
      'code': item.code ?? "",
      'value': item.lov_values ?? "",
      'type': this.typeMaster.find((obj: any) => {
        return obj.value == item.type ?? null
      }),
      'is_required': this.requiredMaster.find((obj: any) => {
        return obj.value == item.is_required ?? null
      }),
    });

    $('[formcontrolname="code"]').attr('readonly', 'true');
  }
}
