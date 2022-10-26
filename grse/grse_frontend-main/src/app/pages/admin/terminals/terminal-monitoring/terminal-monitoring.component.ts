import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-admin-terminal-monitoring',
  templateUrl: './terminal-monitoring.component.html',
  styleUrls: ['./terminal-monitoring.component.css']
})
export class AdminTerminalMonitoringComponent implements OnInit {
  terminals: any[] = [];

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
  }

  async ngOnInit() {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Terminal Live Monitoring", "", "Terminals")

      this.AdminLayoutComponent.loadPageTitle("Terminal Live Monitoring", "", [
        { 'url': '/admin/terminals/', 'name': "Terminals" },
        { 'url': 'active', 'name': 'Live Monitoring' },
      ])
    })

    await this.fetchTerminals();
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
    })

  }
}
