import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';

@Component({
  selector: 'app-admin-clms-raw-details',
  templateUrl: './clms-raw-details.component.html',
  styleUrls: ['./clms-raw-details.component.css']
})
export class AdminClmsRawDetailsComponent implements OnInit {
  employeeId: any = null;
  prevcontractors: any[] = [];
  tableOptions: TableOptions;
  tableSearchForm: FormGroup;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private excelService: ExcelExportService
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

    this.tableSearchForm = formBuilder.group({
      "employee_id": [null],
      "cl_employer": [null],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Manage Contract Labour", "", [
        { 'url': '/admin/contractlabour', 'name': "Contract Loabour" },
        { 'url': '/admin/contractlabour/raw-data', 'name': 'Raw Data' },
        { 'url': 'active', 'name': 'Details' },
      ])
    })

    this.activatedRoute.params.subscribe(
      params => this.employeeId = params['employee_id']
    )

    this.fetch()
  }

  fetch({
    page = <any>null,
    xlx_export = <Boolean>false
  } = {}) {
    if (page != null) {
      this.tableOptions.page = page;
    }

    if (xlx_export) {
      this.spinner.show();
    } else {
      $('#user-view-section').find('.table-processing').show()
    }

    this.adminService.fetchClmsRawDataDetails({
      "page_no": xlx_export == true ? 1 : this.tableOptions.page,
      "employee_id": this.employeeId,
    }).subscribe(res => {
      // res = { "SearchCount": 15, "Users": [{ "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_aadhaar", "did": "900003_cl_aadhaar_2022-01-01", "dremarks": null, "dvalue": "899778422561", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_aadhaar", "did": "900003_cl_aadhaar_2022-01-01", "dremarks": null, "dvalue": "102150", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_blood_group", "did": "900003_cl_blood_group_2022-01-01", "dremarks": null, "dvalue": "B+", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_emergency_no", "did": "900003_cl_emergency_no_2022-01-01", "dremarks": null, "dvalue": "8620999345", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_employer", "did": "900003_cl_employer_2022-01-01", "dremarks": null, "dvalue": "VD10111", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_esino", "did": "900003_cl_esino_2022-01-01", "dremarks": null, "dvalue": "4105754503", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_gender", "did": "900003_cl_gender_2022-01-01", "dremarks": null, "dvalue": "M", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_guardian_name", "did": "900003_cl_guardian_name_2022-01-01", "dremarks": null, "dvalue": "NIRMAL CHANDRA NAYAK", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_pcc", "did": "900003_cl_pcc_2020-03-07", "dremarks": null, "dvalue": "", "efrom": "2020-03-07", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_pfno", "did": "900003_cl_pfno_2022-01-01", "dremarks": null, "dvalue": "101265119937", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_phone", "did": "900003_cl_phone_2022-01-01", "dremarks": null, "dvalue": "8620999345", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_present_address", "did": "900003_cl_present_address_2022-01-01", "dremarks": null, "dvalue": "P-1JATIN BAGCHI ROAD, BLOCK NO-14, P.O SARAT BOSE ROAD, P.S-RABINDRA SAROWAR, DIST-SOUTH 24 PGS, KOLKATA-700029\r\n", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_trade", "did": "900003_cl_trade_2022-01-01", "dremarks": null, "dvalue": "SKILLED", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_uanno", "did": "900003_cl_uanno_2022-01-01", "dremarks": null, "dvalue": "101265119937", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }, { "cby": "INITIAL DATA", "con": "2022-01-01", "dcode": "cl_unit", "did": "900003_cl_unit_2022-01-01", "dremarks": null, "dvalue": "MAIN", "efrom": "2022-01-01", "employee_id": "900003", "eto": "9999-12-31", "full_name": "NIKHIL KUMAR NAYAK(899778422561)" }], "message": "Success", "status": "success" }

      if (xlx_export) {
        if (res.status == 'success') {
          let prevcontractors = res.Users;

          let exportData: any[] = [];
          prevcontractors.forEach((item: any) => {
            exportData.push({
              "EMPLOYEE ID": item?.mployee_id ?? "-",
              "FULL NAME": item?.ull_name ?? "-",
              "DCODE": item?.code ?? "-",
              "DVALUE": item?.value ?? "-",
              "CBY": item?.by ?? "-",
              "CON": item?.on ?? "-",
              "EFROM": item?.from ?? "-",
              "ETO": item?.to ?? "-",
              "DID": item?.id ?? "-",
              "DREMARKS": item?.remarks ?? "-",
            })
          });

          this.excelService.exportAsExcelFile(exportData, 'clmsrawdata_' + this.employeeId + '_details');
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
      } else {
        if (res.status == 'success') {
          this.prevcontractors = res.Users;

          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.SearchCount;
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
          this.prevcontractors = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.prevcontractors = [];
          this.toastr.error(res.message);
        }

        $('#user-view-section').find('.table-processing').hide()
      }
    }, (err) => {
      this.prevcontractors = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#user-view-section').find('.table-processing').hide()
    });
  }
}

