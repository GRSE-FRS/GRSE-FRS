import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AdminLayoutComponent } from '../../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';

@Component({
  selector: 'app-admin-crform-crgroups',
  templateUrl: './crform-crgroups.component.html',
  styleUrls: ['./crform-crgroups.component.css']
})
export class AdminCrformCrgroupsComponent implements OnInit {
  crforms: any[] = [];
  tableOptions: TableOptions;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
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
      this.AdminLayoutComponent.loadPageTitle("CR Form Group Master", "", "CR Form Group Master")
    });

    this.fetch()
  }

  fetch(page: any = null) {
    $('#crform-view-section').find('.table-processing').show()

    if (page != null) {
      this.tableOptions.page = page;
    }

    this.adminService.fetchCrForms({
      "pageno": this.tableOptions.page,
      // "searchkey": $('#crform-view-section').find('#table-search').val(),
    }).subscribe(res => {
      if (res.status == 'success') {
        this.crforms = res?.CRFormList ?? [];

        /** CALCULATING THE PAGINATION NUMBERS */
        let totalDocs = res?.SearchCount ?? 0;
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
        this.crforms = [];
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.crforms = [];
        this.toastr.error(res.message);
      }

      $('#crform-view-section').find('.table-processing').hide()
    }, (err) => {
      this.crforms = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#crform-view-section').find('.table-processing').hide()
    });
  }
}
