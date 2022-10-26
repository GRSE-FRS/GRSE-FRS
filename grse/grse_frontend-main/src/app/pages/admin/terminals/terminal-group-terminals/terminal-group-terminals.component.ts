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
  selector: 'app-admin-terminal-group-terminals',
  templateUrl: './terminal-group-terminals.component.html',
  styleUrls: ['./terminal-group-terminals.component.css']
})
export class AdminTerminalGroupTerminalsComponent implements OnInit {
  groupId: any;
  groupDetails: any = null;
  groupRunningJobs: any[] = [];
  terminals: any[] = [];
  runningTerminals: any[] = [];

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
      this.AdminLayoutComponent.loadPageTitle("Manage Terminal Groups", "", "Terminal Groups")

      this.AdminLayoutComponent.loadPageTitle("Manage Terminal Groups", "", [
        { 'url': '/admin/terminal-groups', 'name': "Terminal Groups" },
        { 'url': 'active', 'name': 'Terminals' },
      ])
    })

    this.activatedRoute.params.subscribe(
      params => this.groupId = params['group_id']
    )

    await this.fetchTerminals();
    await this.fetchCurrentRunningJobs();
    await this.fetchGroupDetails()
  }

  fetchTerminals() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.adminService.fetchTerminals().subscribe(res => {
        if (res.status == 'success') {
          this.terminals = res.terminals ?? [];
        } else if (res.status == 'val_error') {
          this.terminals = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.terminals = [];
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.terminals = [];
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }

  fetchGroupDetails() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.adminService.getGroupDetails({
        'group_id': this.groupId
      }).subscribe(res => {
        if (res.status == 'success') {
          this.groupDetails = res.GroupDetais;
          this.selectGroupTerminals(res.TerminalsDetails ?? [])
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
    let terminals_selected: any = await this.getSelectedTerminalCheckbox();
    if (!terminals_selected || terminals_selected.length < 1) {
      this.toastr.error("Please select atleast one terminal")
      return;
    }

    let currentJobs: any = await this.fetchCurrentRunningJobs('alldata');
    if (!currentJobs || (Array.isArray(currentJobs) && currentJobs.length > 0)) {
      this.toastr.error("A Job is currently running for \"" + this.groupDetails.name + "\", Please try after all jobs completed")
      return;
    }

    event.target.classList.add('btn-loading');
    this.adminService.assignTerminalToGroup({
      'group_id': this.groupId,
      'terminal_id': terminals_selected,
      'status': 'active',
    }).subscribe(async res => {
      if (res.status == 'success') {
        this.toastr.success(res.message);
        await this.fetchCurrentRunningJobs();
        await this.fetchGroupDetails()
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
    $('input[name="selected_terminals[]"]').each(function () {
      $(this).prop('checked', event.srcElement.checked)
    });
  }

  terminalCheckboxChecked() {
    let selectAllChecked: boolean = true;

    $('input[name="selected_terminals[]"]').each(function () {
      if ($(this).prop('checked') == false) {
        selectAllChecked = false;
      }
    });

    $('#selectall-checkbox').prop('checked', selectAllChecked);
  }

  getSelectedTerminalCheckbox() {
    return new Promise((resolve, reject) => {
      let res: any[] = [];

      $('input[name="selected_terminals[]"]').each(function () {
        if ($(this).prop('checked') == true) {
          let val: any = $(this).val();
          res.push(parseInt(val));
        }
      });

      resolve(res);
    })
  }

  resetSelectedTerminals() {
    $('input[name="selected_terminals[]"]').each(function () {
      $(this).prop('checked', false)
    });
  }

  selectGroupTerminals(terminals: any) {
    this.resetSelectedTerminals();

    terminals.forEach((element: any) => {
      $('input[name="selected_terminals[]"][value=' + element.id + ']').prop('checked', true);
    });

    this.terminalCheckboxChecked();
  }

  fetchCurrentRunningJobs(returntype: any = 'normal') {
    return new Promise((resolve, reject) => {
      this.spinner.show();
      this.adminService.fetchAssignTerminalToGroupJobs({
        'status': 'pending',
      }).subscribe(res => {
        if (res.status == 'success') {

          this.groupRunningJobs = (res?.data ?? []).filter((item: any) => {
            return item.group_id?.id == this.groupId;
          });

          if (returntype == 'alldata') {
            this.spinner.hide();
            resolve(this.groupRunningJobs ?? false)
          }

          this.runningTerminals = [];
          this.groupRunningJobs.forEach((element: any) => {
            // let terminal_list = JSON.parse(element.terminal_list);
            let terminal_list = element.terminal_list;
            terminal_list.forEach((terminal_id: any) => {
              let terminal: any = this.terminals.find((obj: any) => {
                return obj.id == terminal_id.id
              })

              let exists = this.runningTerminals.find((obj: any) => {
                return obj.id == terminal_id
              })

              if (terminal && !exists) {
                terminal.created_at = element.created_at;
                this.runningTerminals.push(terminal);
              }
            });
          });
        } else {
          this.groupRunningJobs = this.runningTerminals = [];
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.groupRunningJobs = this.runningTerminals = [];
        this.toastr.error(Global.showServerErrorMessage(err));
        this.spinner.hide();
        resolve(true);
      });
    });
  }
}
