import { Component, Injectable, OnInit } from '@angular/core';

@Injectable()

@Component({
  selector: 'layout-app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminLayoutComponent implements OnInit {
  PageTitle: any;
  PageDescription: any;
  PageBreadcrumb: any;

  constructor() { }

  ngOnInit(): void {
    this.PageTitle = "Control Panel";
    this.PageDescription = null;
    this.PageBreadcrumb = null;
  }

  loadPageTitle(PageTitle: any, PageDescription: any = null, PageBreadcrumb: any = null) {
    this.PageTitle = ''
    this.PageTitle = PageTitle;
    this.PageDescription = PageDescription;
    this.PageBreadcrumb = PageBreadcrumb;
  }
}
