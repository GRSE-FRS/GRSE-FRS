import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import swal from 'sweetalert2';
import TableOptions from 'src/app/models/TableOptions';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';

@Component({
  selector: 'app-admin-terminals',
  templateUrl: './terminals.component.html',
  styleUrls: ['./terminals.component.css']
})
export class AdminTerminalsComponent implements OnInit {
  terminals: any[] = [];
  alpetaTerminals: any[] = [];
  terminalTypeMaster: any[] = [];
  terminalForm: FormGroup;
  editActionId: String;
  terminalDetails: any;
  terminalUsers: any[] = [];
  existingDBTerminals: any[] = [];
  tableOptions: TableOptions;
  terminalUserSearchText: any = "";

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.terminalForm = formBuilder.group({
      "name": [null, Validators.compose([Validators.required])],
      "description": [null, Validators.compose([])],
      "alpeta_terminal_id": [null, Validators.compose([Validators.required])],
      "short_code": [null, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(4)])],
      "terminal_type": [null, Validators.compose([Validators.required])],
    });

    this.editActionId = '';
    this.terminalDetails = null;

    this.terminalTypeMaster = [
      { 'value': 'in', 'description': 'IN - Terminal' },
      { 'value': 'out', 'description': 'OUT - Terminal' },
      { 'value': 'auto', 'description': 'AUTO - Terminal (before 12 Noon is IN, after 12 PM is OUT)' },
    ];

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
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Terminals", "", "Terminals")

      this.fetch();
      // this.fetchAllexistingDBTerminals();
    })

  }

  fetch(page: any = null, option: any = null) {
    $('#terminal-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    switch (option) {
      case 'table-search-name':
        $('#terminal-view-section').find('#table-search-sortcode').val("")
        break;

      case 'table-search-sortcode':
        $('#terminal-view-section').find('#table-search-name').val("");
        break;
    }

    let name = String($('#terminal-view-section').find('#table-search-name').val()).trim();
    let sortcode = String($('#terminal-view-section').find('#table-search-sortcode').val()).trim();

    this.adminService.fetchTerminals({
      "pageno": this.tableOptions.page,
      "search_status": (name || sortcode) ? true : false,
      "name": name,
      "sort_code": sortcode,
    }).subscribe(res => {
      if (res.status == 'success') {
        this.terminals = res.terminals ?? [];

        /** CALCULATING THE PAGINATION NUMBERS */
        let totalDocs = res.count;
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
    Global.resetForm(this.terminalForm);
    Global.scrollToQuery('#terminal-view-section')

    $('[formcontrolname="alpeta_terminal_id"]').removeAttr('readonly')
  }

  add(event: any) {
    this.terminalForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.terminalForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.createTerminal({
        'name': this.terminalForm.value.name,
        'description': this.terminalForm.value.description,
        'alpeta_terminal_id': this.terminalForm.value.alpeta_terminal_id,
        'short_code': this.terminalForm.value.short_code,
        'terminal_type': this.terminalForm.value.terminal_type?.value,
        'status': 'active',
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.fetch()
          this.cancelSubmit();
          this.fetchAllexistingDBTerminals();
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
    this.terminalForm.markAllAsTouched();

    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.terminalForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateTerminal({
        'id': this.editActionId,
        'name': this.terminalForm.value.name,
        'description': this.terminalForm.value.description,
        'alpeta_terminal_id': this.terminalForm.value.alpeta_terminal_id,
        'short_code': this.terminalForm.value.short_code,
        'terminal_type': this.terminalForm.value.terminal_type?.value,
        'status': 'active',
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success("Terminal data updated successfully");
          this.fetch()
          this.fetchAllexistingDBTerminals();
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
    this.editActionId = item.id;
    setTimeout(function () {
      Global.scrollToQuery('#terminal-submit-section')
    })

    this.terminalForm.patchValue({
      name: item.name,
      description: item.description,
      alpeta_terminal_id: item.alpeta_terminal_id,
      short_code: item.short_code,
      terminal_type: this.terminalTypeMaster.find((obj: any) => {
        return obj.value == item.terminal_type ?? null
      }) ?? null,
    });

    $('[formcontrolname="alpeta_terminal_id"]').attr('readonly', 'true')
  }

  viewDetails(item: any) {
    this.spinner.show();
    this.adminService.viewTerminalDetails(item.alpeta_terminal_id).subscribe(res => {
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

  viewTerminalUsers(item: any) {
    this.spinner.show();
    this.adminService.viewTerminalUsers(item.id).subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.terminalDetails = item;
        this.terminalUsers = res.user_details;
        $('#open-terminal-users-modal').click();
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

  async openTerminalLibrary() {
    this.spinner.show();

    await this.fetchAllexistingDBTerminals({ loading: false });

    this.adminService.fetchAlpetaTerminals().subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.alpetaTerminals = res.treminals?.TerminalList ?? [];
        $('#open-alpeta-terminals-modal')?.click();

        console.log(this.alpetaTerminals)
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

  cloneTerminal(item: any) {
    setTimeout(function () {
      Global.scrollToQuery('#terminal-submit-section')
    })

    this.terminalForm.patchValue({
      name: item.Name,
      description: item.Description,
      alpeta_terminal_id: item.ID,
    });

    $('[formcontrolname="alpeta_terminal_id"]').attr('readonly', 'true');
    $('#alpeta-terminals-modal').find('[data-bs-dismiss="modal"]').click();
  }

  fetchAllexistingDBTerminals({ loading = <boolean>true } = {}) {
    return new Promise((resolve, reject) => {
      this.existingDBTerminals = [];

      if (loading == true) this.spinner.show();
      this.adminService.fetchTerminals().subscribe(res => {
        if (loading == true) this.spinner.hide();
        if (res.status == 'success') {
          this.existingDBTerminals = res.terminals;
          resolve(true);
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
          resolve(false);
        } else {
          this.toastr.error(res.message);
          resolve(false);
        }
      }, (err) => {
        if (loading == true) this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(false);
      });
    })
  }

  checkTerminalExistDb(alpeta_terminal_id: any) {
    let existingTerminal = this.existingDBTerminals.find((obj: any) => {
      return obj.alpeta_terminal_id == alpeta_terminal_id ?? null
    })

    if (existingTerminal) {
      return true;
    } else {
      return false;
    }
  }
}
