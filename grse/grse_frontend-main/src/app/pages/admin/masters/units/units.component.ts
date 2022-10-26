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
  selector: 'app-admin-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.css']
})
export class AdminUnitsComponent implements OnInit {
  units: any[] = [];
  subareaMaster: any[] = [];
  tableOptions: TableOptions;
  unitForm: FormGroup;
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

    this.unitForm = formBuilder.group({
      "code": [null, Validators.compose([Validators.required])],
      "name": [null, Validators.compose([Validators.required])],
      "subarea_id": [null, Validators.compose([Validators.required])],
      "description": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Units", "", "Units")
    });

    this.fetch()
    this.fetchMaster();
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

  fetch(page: any = null) {
    $('#unit-view-section').find('.table-processing').show()

    // if (page != null) {
    //   this.tableOptions.page = page;
    // }

    this.adminService.fetchUnits({
      // "pageno": this.tableOptions.page,
      "searchkey": $('#unit-view-section').find('#table-search').val(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.units = res.units;

        // this.tableOptions = {
        //   page: res.units.page,
        //   limit: res.units.limit,
        //   pagingCounter: res.units.pagingCounter,
        //   totalDocs: res.units.totalDocs,
        //   totalPages: res.units.totalPages,
        //   hasNextPage: res.units.hasNextPage,
        //   hasPrevPage: res.units.hasPrevPage,
        //   nextPage: res.units.nextPage,
        //   prevPage: res.units.prevPage,
        // }
      } else if (res.status == 'val_error') {
        this.units = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.units = [];
        this.toastr.error(res.message);
      }

      $('#unit-view-section').find('.table-processing').hide()
    }, (err) => {
      this.units = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#unit-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';

    Global.resetForm(this.unitForm)
    Global.scrollToQuery('#unit-view-section')
  }

  add(event: any) {
    this.unitForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.unitForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.createUnit({
        'code': this.unitForm.value.code,
        'name': this.unitForm.value.name,
        'subarea_id': this.unitForm.value.subarea_id?.id,
        'description': this.unitForm.value.description,
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
    this.unitForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.unitForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateUnit({
        'code': this.unitForm.value.code,
        'name': this.unitForm.value.name,
        'subarea_id': this.unitForm.value.subarea_id?.id,
        'description': this.unitForm.value.description,
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
    this.adminService.updateUnitStatus({
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
        this.adminService.deleteUnit({
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

  getEdit(item: any) {
    Global.scrollToQuery('#unit-submit-section')
    this.editActionId = item.id;

    this.unitForm.patchValue({
      subarea_id: this.subareaMaster.find((obj: any) => {
        return obj.id == item.subarea_id ?? null
      }),

      code: item.code,
      name: item.name,
      description: item.description,
    });
  }
}
