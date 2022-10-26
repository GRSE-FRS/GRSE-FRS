import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-crform-demoggroup-assginmaster',
  templateUrl: './crform-demoggroup-assginmaster.component.html',
  styleUrls: ['./crform-demoggroup-assginmaster.component.css']
})
export class AdminCrformDemoggroupAssginmasterComponent implements OnInit {
  groupId: any;
  groupDetails: any = null;
  demogmasters: any[] = [];

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
  ) {

  }

  async ngOnInit() {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("CR Form Demog Group", "", [
        { 'url': '/admin/cr-forms/demog-group', 'name': "CR Form Demog Group" },
        { 'url': 'active', 'name': 'Assign Demog Master' },
      ])
    })

    this.activatedRoute.params.subscribe(
      params => this.groupId = params['group_id']
    )

    await this.fetchDemogMasters();
    await this.fetchGroupDetails()
  }

  fetchDemogMasters() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.adminService.fetchDemogMasters({
        // 'pageno': "all"
      }).subscribe(res => {
        if (res.status == 'success') {
          this.demogmasters = res.DemogList ?? [];
        } else if (res.status == 'val_error') {
          this.demogmasters = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.demogmasters = [];
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.demogmasters = [];
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }

  fetchGroupDetails() {
    return new Promise((resolve, reject) => {
      this.spinner.show();
      this.adminService.fetchDemogGroupDetails({
        'group_id': this.groupId
      }).subscribe(res => {
        if (res.status == 'success') {
          this.groupDetails = res.group_details ?? null;
          this.selectDemogForGroup(res.demog_assign ?? [])
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }

  async submitGroup(event: any) {
    let demogmasters_selected: any = await this.getSelectedDemogMasterCheckbox();
    if (!demogmasters_selected || demogmasters_selected.length < 1) {
      this.toastr.error("Please select atleast one demog")
      return;
    }

    event.target.classList.add('btn-loading');
    this.adminService.assignDemogToGroup({
      'group_id': this.groupId,
      'demog_id': demogmasters_selected,
      'status': 'active',
    }).subscribe(res => {
      if (res.status == 'success') {
        this.toastr.success(res.message);
        this.fetchGroupDetails()
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
    $('input[name="selected_demogmasters[]"]').each(function () {
      $(this).prop('checked', event.srcElement.checked)
    });
  }

  demogMasterCheckboxChecked() {
    let selectAllChecked: boolean = true;

    $('input[name="selected_demogmasters[]"]').each(function () {
      if ($(this).prop('checked') == false) {
        selectAllChecked = false;
      }
    });

    $('#selectall-checkbox').prop('checked', selectAllChecked);
  }

  getSelectedDemogMasterCheckbox() {
    return new Promise((resolve, reject) => {
      let res: any[] = [];

      $('input[name="selected_demogmasters[]"]').each(function () {
        if ($(this).prop('checked') == true) {
          let val: any = $(this).val();
          res.push(parseInt(val));
        }
      });

      resolve(res);
    })
  }

  resetSelectedDemogs() {
    $('input[name="selected_demogmasters[]"]').each(function () {
      $(this).prop('checked', false)
    });
  }

  selectDemogForGroup(demogmasters: any) {
    this.resetSelectedDemogs();

    demogmasters.forEach((element: any) => {
      $('input[name="selected_demogmasters[]"][value=' + element + ']').prop('checked', true);
    });

    this.demogMasterCheckboxChecked();
  }
}
