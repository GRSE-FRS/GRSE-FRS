import { Component, Injectable, Input, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-user-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class UserHeaderComponent implements OnInit {
  Global = Global;

  @Input() PageTitle: any; // decorate the property with @Input()
  @Input() PageDescription: any; // decorate the property with @Input()
  @Input() PageBreadcrumb: any; // decorate the property with @Input()

  constructor(
    public authService: AuthService,
    public adminService: AdminService,
  ) {
  }

  ngOnInit(): void {
    this.PageTitle = null;
    this.PageDescription = null;
    this.PageBreadcrumb = null;
  }

  logout() {
    return this.authService.userLogout();
  }

  checkIfArray(value: any) {
    if (Array.isArray(value)) {
      return true;
    } else {
      return false;
    }
  }
}
