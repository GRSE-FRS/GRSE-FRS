import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-admin-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class AdminHomeComponent implements OnInit {
  userdetails: any;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    public authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Admin Dashboard", "", "Dashboard")
    });

    this.userdetails = null;
    // this.getAccountDetails();
  }

  getAccountDetails() {
    this.spinner.show();
    this.authService.getAdminAccountDetails()
      .subscribe(res => {
        this.spinner.hide();
        if (res.status == 'success') {
          this.userdetails = res.user_data;
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
