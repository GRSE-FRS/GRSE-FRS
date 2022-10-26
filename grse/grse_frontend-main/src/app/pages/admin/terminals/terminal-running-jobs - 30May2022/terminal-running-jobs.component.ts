import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';

@Component({
  selector: 'app-admin-terminal-running-jobs',
  templateUrl: './terminal-running-jobs.component.html',
  styleUrls: ['./terminal-running-jobs.component.css']
})

export class AdminTerminalRunningJobsComponent implements OnInit {
  Global = Global;
  groupRunningJobs: any[] = [];
  userTerminalRunningJobs: any[] = [];
  AFgroupTerminalFailedRequest: any[] = [];
  DFgroupTerminalFailedRequest: any[] = [];
  AFuserTerminalFailedRequest: any[] = [];
  DFuserTerminalFailedRequest: any[] = [];

  groupTerminalFailedRequest: any = null;
  userTerminalFailedRequest: any = null;
  statusFilterMaster: any[] = [];

  filterForm: FormGroup;

  AFgroupTerminalFailedRequest_PageNumber: any = 1
  DFgroupTerminalFailedRequest_PageNumber: any = 1
  AFuserTerminalFailedRequest_PageNumber: any = 1
  DFuserTerminalFailedRequest_PageNumber: any = 1
  userTerminalRunningJobs_PageNumber: any = 1


  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.filterForm = formBuilder.group({
      "gr_filter": [null, Validators.compose([])],
      "ut_filter": [null, Validators.compose([])],
    });

    this.statusFilterMaster = [
      { 'value': "pending", 'description': "Pending" },
      { 'value': "success", 'description': "Success" },
      { 'value': "failed", 'description': "Failed / Error" },
    ];
  }

  async ngOnInit() {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Batch Process Logs", "", "Batch Process Logs")
    })

    this.filterForm.patchValue({
      'gr_filter': this.statusFilterMaster.find((obj: any) => {
        return obj.value == 'pending'
      }) ?? null,
      'ut_filter': this.statusFilterMaster.find((obj: any) => {
        return obj.value == 'pending'
      }) ?? null,
    });

    await this.fetchAssignTerminalToGroupJobs();
    await this.fetchAssignUserToGroupJobs();
    await this.fetchGroupTerminalFailedRequest();
    await this.fetchUserTerminalFailedRequest();
  }

  fetchAssignTerminalToGroupJobs() {
    return new Promise((resolve, reject) => {
      if (this.filterForm.value.gr_filter?.value) {
        this.spinner.show();
        this.adminService.fetchAssignTerminalToGroupJobs({
          'status': this.filterForm.value.gr_filter?.value ?? "",
        }).subscribe(res => {
          if (res.status == 'success') {
            this.groupRunningJobs = res?.data ?? [];
          } else {
            this.groupRunningJobs = [];
            this.toastr.error(res.message);
          }

          this.spinner.hide();
          resolve(true);
        }, (err) => {
          this.groupRunningJobs = [];
          this.toastr.error(Global.showServerErrorMessage(err));
          this.spinner.hide();
          resolve(true);
        });
      } else {
        this.groupRunningJobs = [];
      }
    });
  }

  fetchAssignUserToGroupJobs() {
    return new Promise((resolve, reject) => {
      if (this.filterForm.value.ut_filter?.value) {
        this.spinner.show();
        this.adminService.fetchAssignUserToGroupJobs({
          'status': this.filterForm.value.ut_filter?.value ?? "",
        }).subscribe(res => {
          if (res.status == 'success') {
            this.userTerminalRunningJobs = res?.data ?? [];
          } else {
            this.userTerminalRunningJobs = [];
            this.toastr.error(res.message);
          }

          this.spinner.hide();
          resolve(true);
        }, (err) => {
          this.userTerminalRunningJobs = [];
          this.toastr.error(Global.showServerErrorMessage(err));
          this.spinner.hide();
          resolve(true);
        });
      } else {
        this.userTerminalRunningJobs = [];
      }
    });
  }

  fetchGroupTerminalFailedRequest() {
    return new Promise((resolve, reject) => {
      this.AFgroupTerminalFailedRequest = [];
      this.DFgroupTerminalFailedRequest = [];
      this.AFgroupTerminalFailedRequest_PageNumber = 1;
      this.DFgroupTerminalFailedRequest_PageNumber = 1;

      this.spinner.show();
      this.adminService.fetchGroupTerminalFailedRequest().subscribe(res => {
        if (res.status == 'success') {
          this.AFgroupTerminalFailedRequest = res.assigned_failed ?? []
          this.DFgroupTerminalFailedRequest = res.delete_failed ?? []
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

  fetchUserTerminalFailedRequest() {
    return new Promise((resolve, reject) => {
      this.AFuserTerminalFailedRequest = [];
      this.DFuserTerminalFailedRequest = [];
      this.AFuserTerminalFailedRequest_PageNumber = 1;
      this.DFuserTerminalFailedRequest_PageNumber = 1;

      this.spinner.show();
      this.adminService.fetchUserTerminalFailedRequest().subscribe(res => {
        if (res.status == 'success') {
          this.AFuserTerminalFailedRequest = res.assigned_failed ?? [];
          this.DFuserTerminalFailedRequest = res.delete_failed ?? [];
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
}
