import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-crform-crgroups-assign',
  templateUrl: './crform-crgroups-assign.component.html',
  styleUrls: ['./crform-crgroups-assign.component.css']
})
export class AdminCrformCrgroupsAssignComponent implements OnInit {
  formSlug: any;
  formDetails: any = null;
  crgroups: any[] = [];

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {

  }

  async ngOnInit() {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("CR Form Group Master", "", [
        { 'url': '/admin/cr-forms/crgroup-master', 'name': "CR Form Group Master" },
        { 'url': 'active', 'name': 'Assign Group' },
      ])
    })

    this.activatedRoute.params.subscribe(
      params => this.formSlug = params['form_slug']
    )

    await this.fetchDemogGroups();
    await this.fetchCrFormDetails()
  }

  fetchDemogGroups() {
    return new Promise((resolve, reject) => {
      this.spinner.show();
      this.adminService.fetchDemogGroups({
        //Payload
      }).subscribe(res => {
        if (res.status == 'success') {
          this.crgroups = res.CrgroupList ?? [];
        } else if (res.status == 'val_error') {
          this.crgroups = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.crgroups = [];
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.crgroups = [];
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }

  fetchCrFormDetails() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.adminService.fetchCrFormDetailsBySlug({
        'slug': this.formSlug
      }).subscribe(res => {
        if (res.status == 'success') {

          this.formDetails = res.formDetails;
          this.selectCrGroups(res.formGroup ?? [])
        } else {
          this.router.navigate(['404notfound'], { skipLocationChange: true })
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.router.navigate(['404notfound'], { skipLocationChange: true })
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }

  async submitGroup(event: any) {
    let crgroups_selected: any = await this.getSelectedCrGroupCheckbox();
    if (!crgroups_selected || crgroups_selected.length < 1) {
      this.toastr.error("Please select atleast one group")
      return;
    }

    event.target.classList.add('btn-loading');
    this.adminService.assignCrGroupToForm({
      'form_id': this.formDetails?.id,
      'group_id': crgroups_selected,
      'status': 'active',
    }).subscribe(res => {
      if (res.status == 'success') {
        this.toastr.success(res.message);
        this.fetchCrFormDetails()
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

  allRowsCheckboxChecked(event: any) {
    $('input[name="selected_crgroups[]"]').each(function () {
      $(this).prop('checked', event.srcElement.checked)
    });
  }

  crGroupCheckboxChecked() {
    let selectAllChecked: boolean = true;

    $('input[name="selected_crgroups[]"]').each(function () {
      if ($(this).prop('checked') == false) {
        selectAllChecked = false;
      }
    });

    $('#selectall-checkbox').prop('checked', selectAllChecked);
  }

  getSelectedCrGroupCheckbox() {
    return new Promise((resolve, reject) => {
      let res: any[] = [];

      $('input[name="selected_crgroups[]"]').each(function () {
        if ($(this).prop('checked') == true) {
          let val: any = $(this).val();
          res.push(parseInt(val));
        }
      });

      resolve(res);
    })
  }

  resetSelectedCrGroups() {
    $('input[name="selected_crgroups[]"]').each(function () {
      $(this).prop('checked', false)
    });
  }

  selectCrGroups(crgroups: any) {
    this.resetSelectedCrGroups();

    crgroups.forEach((element: any) => {
      $('input[name="selected_crgroups[]"][value=' + element.id + ']').prop('checked', true);
    });

    this.crGroupCheckboxChecked();
  }
}
