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
  filterForm: FormGroup;

  groupRunningJobs: any[] = [];
  userTerminalRunningJobs: any[] = [];
  AssinedFailedRequest: any[] = [];
  DeleteFailedRequest: any[] = [];
  BJobRequest: any[] = [];

  groupTerminalFailedRequest: any = null;
  userTerminalFailedRequest: any = null;
  statusFilterMaster: any[] = [];
  bJobstatusFilterMaster: any[] = [];

  userTerminalRunningJobs_PageNumber: any = 1
  AssignedFailedRequestPageNumber: any = 1;
  DeleteFailedRequestPageNumber: any = 1;
  BJobRequestPageNumber: any = 1;

  AssinedFailedJobTableOptions: TableOptions = Global.resetTableOptions();
  DeleteFailedJobTableOptions: TableOptions = Global.resetTableOptions();

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
      "bjob_filter": [null, Validators.compose([])],
    });

    this.statusFilterMaster = [
      { 'value': "pending", 'description': "Pending" },
      { 'value': "success", 'description': "Success" },
      { 'value': "failed", 'description': "Failed / Error" },
    ];

    this.bJobstatusFilterMaster = [
      { 'value': "processing", 'description': "Processing" },
      { 'value': "completed", 'description': "Completed" },
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
      'bjob_filter': this.bJobstatusFilterMaster.find((obj: any) => {
        return obj.value == 'processing'
      }) ?? null,
    });

    await this.fetchAssignTerminalToGroupJobs();
    await this.fetchAssignUserToGroupJobs();
    // await this.fetchAssignedDeleteFailedJobs();
    await this.fetchBlacklistJobs();
    await this.fetchTerminalAssignedFailedJobs();
    await this.fetchTerminalDeleteFailedJobs();
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

  fetchAssignedDeleteFailedJobs() {
    return new Promise((resolve, reject) => {
      this.AssinedFailedRequest = [];
      this.DeleteFailedRequest = [];
      this.AssignedFailedRequestPageNumber = 1;
      this.DeleteFailedRequestPageNumber = 1;

      this.spinner.show();
      this.adminService.fetchTerminalAssignedDeleteFailedJobs().subscribe(res => {
        if (res.status == 'success') {
          this.AssinedFailedRequest = res.assigned_failed ?? [];
          this.DeleteFailedRequest = res.delete_failed ?? [];
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

  fetchBlacklistJobs() {
    return new Promise((resolve, reject) => {
      this.BJobRequest = [];
      this.BJobRequestPageNumber = 1;

      if (this.filterForm.value.bjob_filter?.value) {
        this.spinner.show();
        this.adminService.fetchBlacklistJobs().subscribe(res => {
          if (res.status == 'Success') {
            switch (this.filterForm.value.bjob_filter?.value) {
              case 'processing':
                this.BJobRequest = res.result.processing ?? [];
                break;

              case 'completed':
                this.BJobRequest = res.result.executed ?? [];
                break;
            }
          } else {
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
      }
    })
  }

  initCronJob(endpoint: string, baseurl: string = "batchprocessapi") {
    return new Promise((resolve, reject) => {
      swal.fire({
        title: 'Are you sure?',
        text: 'Please make sure registration process has been stopped before press on "Yes".',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.adminService.initBatchCronJobs(endpoint, baseurl).subscribe();
          swal.fire(
            'Request Accepted',
            'The request has been successfully submitted. The process will continue to run in background.',
            'success'
          )
        } else if (result.dismiss === swal.DismissReason.cancel) {
          swal.fire(
            'Request Cancelled',
            'The request has been cancelled',
            'error'
          )
        }
      })
    })
  }

  fetchTerminalAssignedFailedJobs(page: any = null) {
    return new Promise((resolve, reject) => {
      $('#assigned-failed').find('.table-processing').show()

      if (page != null) {
        this.AssinedFailedJobTableOptions.page = page;
      }

      this.adminService.fetchTerminalAssignedFailedJobs({
        "pageno": this.AssinedFailedJobTableOptions.page,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.AssinedFailedRequest = res.assigned_failed ?? [];

          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.total_data;
          let totalPages = Math.ceil(totalDocs / Global.TableLength);
          this.AssinedFailedJobTableOptions = {
            page: this.AssinedFailedJobTableOptions.page,
            limit: Global.TableLength,
            pagingCounter: (this.AssinedFailedJobTableOptions.page - 1) * Global.TableLength,
            totalDocs: totalDocs,
            totalPages: totalPages,
            hasNextPage: (this.AssinedFailedJobTableOptions.page < totalPages),
            hasPrevPage: (this.AssinedFailedJobTableOptions.page > 1),
            nextPage: (this.AssinedFailedJobTableOptions.page + 1 < totalPages) ? this.AssinedFailedJobTableOptions.page + 1 : null,
            prevPage: (this.AssinedFailedJobTableOptions.page > 1) ? this.AssinedFailedJobTableOptions.page - 1 : null
          }
          /** CALCULATING THE PAGINATION NUMBERS */
        } else if (res.status == 'val_error') {
          this.AssinedFailedRequest = [];
          this.AssinedFailedJobTableOptions = Global.resetTableOptions();
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.AssinedFailedRequest = [];
          this.AssinedFailedJobTableOptions = Global.resetTableOptions();
          this.toastr.error(res.message);
        }

        $('#assigned-failed').find('.table-processing').hide()
        resolve(true);
      }, (err) => {
        this.AssinedFailedRequest = [];
        this.AssinedFailedJobTableOptions = Global.resetTableOptions();
        this.toastr.error(Global.showServerErrorMessage(err));
        $('#assigned-failed').find('.table-processing').hide()
        resolve(true);
      });
    })
  }

  fetchTerminalDeleteFailedJobs(page: any = null) {
    return new Promise((resolve, reject) => {
      $('#delete-failed').find('.table-processing').show()

      if (page != null) {
        this.DeleteFailedJobTableOptions.page = page;
      }

      this.adminService.fetchTerminalDeleteFailedJobs({
        "pageno": this.DeleteFailedJobTableOptions.page,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.DeleteFailedRequest = res.delete_failed ?? [];

          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.total_data;
          let totalPages = Math.ceil(totalDocs / Global.TableLength);
          this.DeleteFailedJobTableOptions = {
            page: this.DeleteFailedJobTableOptions.page,
            limit: Global.TableLength,
            pagingCounter: (this.DeleteFailedJobTableOptions.page - 1) * Global.TableLength,
            totalDocs: totalDocs,
            totalPages: totalPages,
            hasNextPage: (this.DeleteFailedJobTableOptions.page < totalPages),
            hasPrevPage: (this.DeleteFailedJobTableOptions.page > 1),
            nextPage: (this.DeleteFailedJobTableOptions.page + 1 < totalPages) ? this.DeleteFailedJobTableOptions.page + 1 : null,
            prevPage: (this.DeleteFailedJobTableOptions.page > 1) ? this.DeleteFailedJobTableOptions.page - 1 : null
          }
          /** CALCULATING THE PAGINATION NUMBERS */
        } else if (res.status == 'val_error') {
          this.DeleteFailedRequest = [];
          this.DeleteFailedJobTableOptions = Global.resetTableOptions();
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.DeleteFailedRequest = [];
          this.DeleteFailedJobTableOptions = Global.resetTableOptions();
          this.toastr.error(res.message);
        }

        $('#delete-failed').find('.table-processing').hide()
        resolve(true);
      }, (err) => {
        this.DeleteFailedRequest = [];
        this.DeleteFailedJobTableOptions = Global.resetTableOptions();
        this.toastr.error(Global.showServerErrorMessage(err));
        $('#delete-failed').find('.table-processing').hide()
        resolve(true);
      });
    })
  }
}
