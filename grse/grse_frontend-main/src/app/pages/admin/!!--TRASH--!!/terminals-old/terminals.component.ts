import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import swal from 'sweetalert2';

@Component({
  selector: 'app-admin-terminals',
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.css']
})
export class AdminTerminalsComponent implements OnInit {
  terminals: any[] = [];
  terminalForm: FormGroup;
  editActionId: String;
  terminalDetails: any;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.terminalForm = formBuilder.group({
      "name": [null, Validators.compose([Validators.required])],
      "description": [null, Validators.compose([Validators.required])],
      'dump_data': [null]
    });

    this.editActionId = '';
    this.terminalDetails = null;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Terminals", "", "Terminals")
    })

    this.fetch();
  }

  fetch(page: any = null) {
    $('#terminal-view-section').find('.table-processing').show()

    this.adminService.fetchTerminals().subscribe(res => {
      if (res.status == 'success') {
        this.terminals = res.treminals?.TerminalList ?? [];
      } else if (res.status == 'val_error') {
        this.terminals = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.terminals = [];
        this.toastr.error(res.message);
      }

      $('#terminal-view-section').find('.table-processing').hide()
    }, (err) => {
      this.terminals = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#terminal-view-section').find('.table-processing').hide()
    });
  }

  cancelSubmit() {
    this.editActionId = '';
    this.terminalForm.reset();
    Global.scrollToQuery('#terminal-view-section')
  }

  add(event: any) {
    this.terminalForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.terminalForm.valid) {
      event.target.classList.add('btn-loading');

      // this.adminService.createTerminal({
      //   'name': this.terminalForm.value.name,
      // }).subscribe(res => {
      //   if (res.status == 'success') {
      //     this.toastr.success(res.message);
      //     this.fetch(this.tableOptions.page)
      //     this.cancelSubmit();
      //   } else if (res.status == 'val_error') {
      //     this.toastr.error(Global.showValidationMessage(res.errors));
      //   } else {
      //     this.toastr.error(res.message);
      //   }

      //   event.target.classList.remove('btn-loading');
      // }, (err) => {
      //   event.target.classList.remove('btn-loading');
      //   this.toastr.error(Global.showServerErrorMessage(err));
      // });
    }
  }

  edit(event: any) {
    this.terminalForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.terminalForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateTerminal({
        'Name': this.terminalForm.value.name,
        'Description': this.terminalForm.value.description,
        'terminal_id': this.editActionId,
        'FuncType': this.terminalForm.value.dump_data.FuncType,
        'GroupID': 0,
        'ID': this.terminalForm.value.dump_data.ID,
        'IPAddress': this.terminalForm.value.dump_data.IPAddress,
        'MacAddress': this.terminalForm.value.dump_data.MacAddress,
        'RemoteDoor': this.terminalForm.value.dump_data.RemoteDoor,
        'State': 0,
        'Type': this.terminalForm.value.dump_data.Type,
        'UTCIndex': this.terminalForm.value.dump_data.UTCIndex,
        'Version': this.terminalForm.value.dump_data.Version,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success("Terminal data updated successfully");
          this.fetch()
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

  getEdit(item: any) {
    this.editActionId = item.ID;
    setTimeout(function () {
      Global.scrollToQuery('#terminal-submit-section')
    })

    this.terminalForm.patchValue({
      name: item.Name,
      description: item.Description,
      dump_data: item
    });
  }

  viewDetails(item: any) {
    this.spinner.show();
    this.adminService.viewTerminalDetails(item.ID).subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.terminalDetails = res.details;
        console.log(this.terminalDetails);
        $('#open-terminal-details-modal').click();
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
}
