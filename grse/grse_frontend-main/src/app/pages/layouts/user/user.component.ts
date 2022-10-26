import { Component, Injectable, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import * as Global from 'src/app/globals';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()

@Component({
  selector: 'layout-app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserLayoutComponent implements OnInit {
  Global = Global;
  PageTitle: any;
  PageDescription: any;
  PageBreadcrumb: any;

  userDetails: any;

  constructor(
    public authService: AuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    let userDetails: any = localStorage.getItem('grse-user-user');
    this.userDetails = JSON.parse(userDetails);
  }

  ngOnInit(): void {
    this.PageTitle = "Control Panel";
    this.PageDescription = null;
    this.PageBreadcrumb = null;

    this.getAccountDetails({ loading: false });

    // console.log(this.router.url.split('/')[2]);
  }

  loadPageTitle(PageTitle: any, PageDescription: any = null, PageBreadcrumb: any = null) {
    this.PageTitle = ''
    this.PageTitle = PageTitle;
    this.PageDescription = PageDescription;
    this.PageBreadcrumb = PageBreadcrumb;
  }

  getAccountDetails({ loading = <boolean>true } = {}) {
    if (loading === true) this.spinner.show();
    this.authService.getUserAccountDetails().subscribe(res => {
      if (res.status == 'success') {
        this.userDetails = res?.user_data?.UserDetails ?? null;
        localStorage.setItem('grse-user-user', JSON.stringify(this.userDetails));
      } else {
        this.toastr.error(res.Message);
      }

      if (loading === true) this.spinner.hide();
    }, (err) => {
      this.toastr.error(Global.showServerErrorMessage(err));
      if (loading === true) this.spinner.hide();
    });
  }
}
