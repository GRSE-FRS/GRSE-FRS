import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-terminal-group-terminals',
  templateUrl: './terminal-group-terminals.component.html',
  styleUrls: ['./terminal-group-terminals.component.css']
})
export class AdminTerminalGroupTerminalsComponent implements OnInit {
  groupId: any;
  groupDetails: any = null;

  groupTerminals: any[] = [];
  terminalsMaster: any[] = [];

  groupTerminalForm: FormGroup;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.groupTerminalForm = formBuilder.group({
      "terminal_id": [null, Validators.compose([Validators.required])],
    });
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

    await this.fetchGroupDetails()
    await this.fetchTerminals();
  }

  fetchTerminals() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.adminService.fetchTerminals().subscribe(res => {
        if (res.status == 'success') {
          this.terminalsMaster = [];
          let terminals = res.terminals ?? [];
          terminals.forEach((element: any) => {
            let isExist = this.groupTerminals.find((obj: any) => {
              return obj.alpeta_terminal_id == element.alpeta_terminal_id ?? null
            }) ?? null;

            if (!isExist) {
              this.terminalsMaster.push({
                'id': element.id,
                'alpeta_terminal_id': element.alpeta_terminal_id,
                'description': element.name + ' (#' + element.alpeta_terminal_id + ')',
              })
            }
          });
        } else if (res.status == 'val_error') {
          this.terminalsMaster = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.terminalsMaster = [];
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.terminalsMaster = [];
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
          this.groupTerminals = res.TerminalsDetails ?? []
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

  deleteItem(item: any) {
    swal.fire({
      title: 'Are you sure want to remove?',
      text: 'Removing the terminal from this group, will remove the user in particular group from this terminal!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.adminService.removeTerminalFromGroup({
          'group_id': parseInt(this.groupId),
          'terminal_id': [parseInt(item.id)]
        }).subscribe(res => {
          if (res.status == 'success') {
            this.toastr.success(res.message);
            this.fetchGroupDetails()
          } else {
            this.toastr.error(res.message);
          }

          this.spinner.hide();
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

  async openAddModal() {
    await this.fetchTerminals();

    Global.resetForm(this.groupTerminalForm);
    $('#open-terminalassign-modal')?.click();
  }

  assignTerminalToGroup(event: any) {
    this.groupTerminalForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.groupTerminalForm.valid) {
      event.target.classList.add('btn-loading');

      let terminals: any[] = [];
      this.groupTerminalForm.value.terminal_id.forEach((element: any) => {
        terminals.push(parseInt(element.id));
      });

      this.spinner.show();
      this.adminService.assignTerminalToGroup({
        'group_id': parseInt(this.groupId),
        'terminal_id': terminals,
        'status': "active",
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.fetchGroupDetails()
          this.cancelTerminalAssign();
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
        event.target.classList.remove('btn-loading');
      }, (err) => {
        this.spinner.hide();
        event.target.classList.remove('btn-loading');
        this.toastr.error(Global.showServerErrorMessage(err));
      });
    }
  }

  cancelTerminalAssign() {
    Global.resetForm(this.groupTerminalForm);
    $('#terminalassign-modal').find('[name="data-bs-dismiss="modal"]')?.click();
  }
}
