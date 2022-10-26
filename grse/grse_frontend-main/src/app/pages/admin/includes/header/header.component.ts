import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AlpetasocketService } from 'src/app/services/alpetasocket.service';
import { AuthService } from 'src/app/services/auth.service';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class AdminHeaderComponent implements OnInit {
  Global = Global;

  @Input() PageTitle: any; // decorate the property with @Input()
  @Input() PageDescription: any; // decorate the property with @Input()
  @Input() PageBreadcrumb: any; // decorate the property with @Input()

  alpetaServerStatus: any = null;
  alpetaServerInfo: any = null;
  alpetaServerInfoCaptured: any = null;

  constructor(
    public authService: AuthService,
    public adminService: AdminService,
    private alpetasocketService: AlpetasocketService
  ) {
    alpetasocketService.result.subscribe((result: any) => {
      // console.log(result);
      
      if (result.msgId == 1103) {
        this.alpetaServerStatus = 'running';
        this.alpetaServerInfo = JSON.parse(result.body);
        this.alpetaServerInfoCaptured = Date.now()
      } else if (result.msgId == 1102) {
        let responses: any[] = JSON.parse(result.body)
        let response = responses[0] ?? null
        let status: any = null;

        if (response) {
          if (response.Status == 16 && response.Type == 0) {
            status = "Disconnected"
          } else if (response.Status == 17 && response.Type == 0) {
            status = "Connected"
          } else if (response.Status == 17 && response.Type == 41) {
            status = "Tamper"
          } else if (response.Status == 8388633 && response.Type == 41) {
            status = "Door Not Monitor"
          } else if (response.Status == 8388633 && response.Type == 0) {
            status = "Tamper"
          } else if (response.Status == 25166873 && response.Type == 41) {
            status = "Door Unlock"
          } else {
            status = "Unknown"
          }

          // let html = `<span class="badge px-4 py-2 fs-fluid badge-secondary">${status}</span>`;
          // if (["Connected"].includes(status)) {
          //   html = `<span class="badge px-4 py-2 fs-fluid badge-success">Online</span>`;
          // } else if (["Disconnected", "Tamper", "Door Not Monitor", "Tamper", "Door Unlock", "Unknown",].includes(status)) {
          //   html = `<span class="badge px-4 py-2 fs-fluid badge-warning">Offline</span>`;
          // }

          let html = ``;
          let monitoringClass = ``;
          let monitoringImage = ``;
          if (["Connected"].includes(status)) {
            html = `<span class="badge px-4 py-2 fs-fluid badge-success">Online</span>`;

            monitoringClass = `online`;
            monitoringImage = `success`;
          } else if (["Disconnected"].includes(status)) {
            html = `<span class="badge px-4 py-2 fs-fluid badge-danger">Offline</span>`;

            monitoringClass = `offline`;
            monitoringImage = `danger`;
          }

          if (html) {
            $(`#terminal-status-${response.ID}-id`).html(html);
          }

          if (monitoringClass) {
            $(`#monitoring-terminal-status-${response.ID}-id`).removeClass('online');
            $(`#monitoring-terminal-status-${response.ID}-id`).removeClass('offline');
            $(`#monitoring-terminal-status-${response.ID}-id`).find('img').attr('src', `assets/images/icons/terminals.png`)

            $(`#monitoring-terminal-status-${response.ID}-id`).find('img').attr('src', `assets/images/icons/terminals-${monitoringImage}.png`)
            $(`#monitoring-terminal-status-${response.ID}-id`).addClass(monitoringClass);
          }

          // console.log(1102, response, status, `$('#terminal-status-${response.ID}-id').html(${html});`)
        }
      } else {
        // console.log(result)
      }
    });

    this.checkAlpetaStatus()
  }

  ngOnInit(): void {
    this.PageTitle = null;
    this.PageDescription = null;
    this.PageBreadcrumb = null;
  }

  checkAlpetaStatus() {
    if (this.alpetaServerStatus && this.alpetaServerInfoCaptured) {
      var diff = Global.getTimeDifference(Date.now(), this.alpetaServerInfoCaptured);
      if (diff.secondsDifference > 12) {
        // $('#serverinfo-modal').find('[data-bs-dismiss="modal"]')?.click();
        this.alpetaServerStatus = 'paused';
        this.alpetaServerInfo = null;
      }
    } else {
      // $('#serverinfo-modal').find('[data-bs-dismiss="modal"]')?.click();
      this.alpetaServerStatus = 'paused';
      this.alpetaServerInfo = null;
    }

    setTimeout(() => {
      this.checkAlpetaStatus();
    }, 1000);
  }

  openAlpetaInformationModal() {
    if (this.alpetaServerStatus == 'running' && this.alpetaServerInfo) {
      $('#open-serverinfo-modal').click();
    }
  }

  logout() {
    return this.authService.adminLogout();
  }

  checkIfArray(value: any) {
    if (Array.isArray(value)) {
      return true;
    } else {
      return false;
    }
  }
}
