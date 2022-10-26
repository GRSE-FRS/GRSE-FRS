import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-crform-misdocs',
    templateUrl: './crform-misdocs.component.html',
    styleUrls: ['./crform-misdocs.component.css']
})
export class AdminCrformMisdocsComponent implements OnInit {
    Global = Global;
    misrecords: any[] = [];
    tableOptions: TableOptions;
    PAGELENGTH: number = 20
    fromPanel: string = "";

    constructor(
        public AdminLayoutComponent: AdminLayoutComponent,
        public UserLayoutComponent: UserLayoutComponent,
        private adminService: AdminService,
        public formBuilder: FormBuilder,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        private router: Router,
    ) {
        this.tableOptions = {
            'page': 1,
            'limit': this.PAGELENGTH,
            'pagingCounter': 0,
            'totalDocs': 0,
            'totalPages': 0,
            'hasNextPage': false,
            'hasPrevPage': false,
            'nextPage': '',
            'prevPage': '',
        };

        this.fromPanel = (this.router.url.split('/'))[1] ?? "";
    }

    ngOnInit(): void {
        setTimeout(() => {
            if (this.fromPanel == 'user')
                this.UserLayoutComponent.loadPageTitle("MIS", "", "MIS")
            else
                this.AdminLayoutComponent.loadPageTitle("MIS", "", "MIS")
        });

        this.fetch()
    }

    fetch(page: any = null) {
        $('#mis-view-section').find('.table-processing').show()

        if (page != null) {
            this.tableOptions.page = page;
        }

        this.adminService.getCrFormMISRecords({
            "page_no": this.tableOptions.page,
            // "searchkey": $('#mis-view-section').find('#table-search').val(),
        }).subscribe(res => {
            if (res.status == 'success') {
                this.misrecords = res?.data ?? [];

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res?.count ?? 0;
                let totalPages = Math.ceil(totalDocs / this.PAGELENGTH);
                this.tableOptions = {
                    page: this.tableOptions.page,
                    limit: this.PAGELENGTH,
                    pagingCounter: (this.tableOptions.page - 1) * this.PAGELENGTH,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.tableOptions.page < totalPages),
                    hasPrevPage: (this.tableOptions.page > 1),
                    nextPage: (this.tableOptions.page + 1 < totalPages) ? this.tableOptions.page + 1 : null,
                    prevPage: (this.tableOptions.page > 1) ? this.tableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */
            } else {
                this.misrecords = [];
                this.toastr.error(res.message);
            }

            $('#mis-view-section').find('.table-processing').hide()
        }, (err) => {
            this.misrecords = [];
            this.toastr.error(Global.showServerErrorMessage(err));
            $('#mis-view-section').find('.table-processing').hide()
        });
    }
}
