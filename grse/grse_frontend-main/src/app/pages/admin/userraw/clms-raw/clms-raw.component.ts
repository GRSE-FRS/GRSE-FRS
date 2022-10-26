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
  selector: 'app-admin-clms-raw',
  templateUrl: './clms-raw.component.html',
  styleUrls: ['./clms-raw.component.css']
})
export class AdminClmsRawComponent implements OnInit {
  users: any[] = [];
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
        { 'url': 'active', 'name': 'Raw Data' },
      ])
    })

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
      $('#userraw-view-section').find('.table-processing').show()
    }

    let cl_employer = String(this.tableSearchForm.value.cl_employer ?? "").trim();
    let employee_id = String(this.tableSearchForm.value.employee_id ?? "").trim();

    this.adminService.fetchClmsRawData({
      "page_no": xlx_export == true ? 1 : this.tableOptions.page,
      "cl_employer": cl_employer,
      "employee_id": employee_id,
      "search_status": (employee_id || cl_employer) ? true : false,
    }).subscribe(res => {
      // res = { "SearchCount": 7019, "Users": [{ "cl_aadhaar": "999999999999", "cl_active": null, "cl_blood_group": "O+", "cl_emergency_no": "1212121212", "cl_employer": "VD10001", "cl_esino": "", "cl_gender": "M", "cl_guardian_name": "S.B.KHOSE", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "", "cl_phone": "1212121212", "cl_present_address": "AKOLA", "cl_scrum_id": "2037", "cl_trade": "HIGHSKILLED", "cl_uanno": "", "cl_unit": null, "cl_valid_upto": "", "employee_id": "900001", "full_name": "ROHIT TEST USER (999999999999)", "role_id": 2, "vd_name": "SCRUM SYSTEM PVT LTD" }, { "cl_aadhaar": "292934520975", "cl_active": null, "cl_blood_group": "B+", "cl_emergency_no": "9432567263", "cl_employer": "VD10172", "cl_esino": "4113204373", "cl_gender": "M", "cl_guardian_name": "LT. SAILENDRA NATH ROY", "cl_pcc": "2689/C&A/19", "cl_permanent_address": null, "cl_pfno": "", "cl_phone": "9432567263", "cl_present_address": "C2-166/113/1.RAMDAS HATI SOUTH 24 PGS, W.B, RABINDRANAGAR-700024", "cl_scrum_id": "8824", "cl_trade": "UNSKILLED", "cl_uanno": "100867240375", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900002", "full_name": "ANINDRA NATH ROY(292934520975)", "role_id": 2, "vd_name": "INNOVISION LIMITED" }, { "cl_aadhaar": "899778422561", "cl_active": null, "cl_blood_group": "B+", "cl_emergency_no": "8620999345", "cl_employer": "VD10111", "cl_esino": "4105754503", "cl_gender": "M", "cl_guardian_name": "NIRMAL CHANDRA NAYAK", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "101265119937", "cl_phone": "8620999345", "cl_present_address": "P-1JATIN BAGCHI ROAD, BLOCK NO-14, P.O SARAT BOSE ROAD, P.S-RABINDRA SAROWAR, DIST-SOUTH 24 PGS, KOLKATA-700029\r\n", "cl_scrum_id": "5117", "cl_trade": "SKILLED", "cl_uanno": "101265119937", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900003", "full_name": "NIKHIL KUMAR NAYAK(899778422561)", "role_id": 2, "vd_name": "CLIFFORD FACILITY SERVICES PVT LTD" }, { "cl_aadhaar": "977389760282", "cl_active": null, "cl_blood_group": "", "cl_emergency_no": "", "cl_employer": "VD10003", "cl_esino": "4115640208", "cl_gender": "M", "cl_guardian_name": "FIDA HUSSAIN", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "101058707758", "cl_phone": "", "cl_present_address": "1-2 GARDEN REACH, KOL-24", "cl_scrum_id": "2061", "cl_trade": "UNSKILLED", "cl_uanno": "101058707758", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900005", "full_name": "MEESAM RAZI(977389760282)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "311337803344", "cl_active": null, "cl_blood_group": "NA", "cl_emergency_no": "4523252536", "cl_employer": "VD10003", "cl_esino": "4115028254", "cl_gender": "M", "cl_guardian_name": "", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "", "cl_phone": "4523252536", "cl_present_address": "", "cl_scrum_id": "8033", "cl_trade": "UNSKILLED", "cl_uanno": "", "cl_unit": null, "cl_valid_upto": "", "employee_id": "900006", "full_name": "NIZAM SEKH(311337803344)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "451222584055", "cl_active": null, "cl_blood_group": "", "cl_emergency_no": "9330121335", "cl_employer": "VD10003", "cl_esino": "4115433617", "cl_gender": "M", "cl_guardian_name": "SK. SAHABUDDIN", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "100895000567", "cl_phone": "9330121335", "cl_present_address": "CHANDIPUR, BAWALI, BUDGE-BUDGE II, SOUTH-24 PGS, W.B-700137", "cl_scrum_id": "2064", "cl_trade": "SKILLED", "cl_uanno": "100895000567", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900007", "full_name": "SK. MONIRUL(451222584055)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "340721573347", "cl_active": null, "cl_blood_group": "NA", "cl_emergency_no": "1236253656", "cl_employer": "VD10003", "cl_esino": "4117836728", "cl_gender": "M", "cl_guardian_name": "", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "", "cl_phone": "1236253656", "cl_present_address": "", "cl_scrum_id": "8146", "cl_trade": null, "cl_uanno": "", "cl_unit": null, "cl_valid_upto": "", "employee_id": "900008", "full_name": "SAHADAT SK ALI(340721573347)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "826667154174", "cl_active": null, "cl_blood_group": "", "cl_emergency_no": "", "cl_employer": "VD10003", "cl_esino": "4116808403", "cl_gender": "M", "cl_guardian_name": "MOSTAFA SK", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "101397001581", "cl_phone": "", "cl_present_address": "GANKAR, MURSHIDABAD, W.B-742227", "cl_scrum_id": "2067", "cl_trade": null, "cl_uanno": "101397001581", "cl_unit": null, "cl_valid_upto": "", "employee_id": "900009", "full_name": "BASIRUL SK(826667154174)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "721085760371", "cl_active": null, "cl_blood_group": "", "cl_emergency_no": "", "cl_employer": "VD10003", "cl_esino": "4105174624", "cl_gender": "M", "cl_guardian_name": "NARENDRA NATH SHEE", "cl_pcc": "", "cl_permanent_address": null, "cl_pfno": "100038279992", "cl_phone": "", "cl_present_address": "Q-411/D/3, MANASA ROW, GARDEN REACH, KOL-700024", "cl_scrum_id": "2070", "cl_trade": "UNSKILLED", "cl_uanno": "100038279992", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900010", "full_name": "JOYDEV SHEE(721085760371)", "role_id": 2, "vd_name": "AJAYA KUMAR SAMAL & CO" }, { "cl_aadhaar": "453555368419", "cl_active": null, "cl_blood_group": "B+", "cl_emergency_no": "9073160057", "cl_employer": "VD10111", "cl_esino": "4115569651", "cl_gender": "F", "cl_guardian_name": "MD. SHAHID HOSSAIN ", "cl_pcc": "37963/VR", "cl_permanent_address": null, "cl_pfno": "", "cl_phone": "9073160057", "cl_present_address": "BAKULTALA, S.B.ROAD, P.O-DANESH SHEIKH LANE, P.S-SANKRIAL, DIST- HOWRAH, 711109\r\n", "cl_scrum_id": "5161", "cl_trade": "SKILLED", "cl_uanno": "100948728545", "cl_unit": "MAIN", "cl_valid_upto": "", "employee_id": "900011", "full_name": "AYESHA KHATOON(453555368419)", "role_id": 2, "vd_name": "CLIFFORD FACILITY SERVICES PVT LTD" }], "message": "Success", "status": "success" }

      if (xlx_export) {
        if (res.status == 'success') {
          let users = res.Users;

          let exportData: any[] = [];
          users.forEach((user: any) => {
            exportData.push({
              "Employee ID": user?.employee_id ?? "-",
              "Full Name": user?.full_name ?? "-",
              "Aadhar": user?.cl_aadhaar ?? "-",
              // "Active": user?.cl_active ?? "-",
              "Employer Code": user?.cl_employer ?? "-",
              "Gender": user?.cl_gender ?? "-",
              "Phone": user?.cl_phone ?? "-",
              "Emerg Phone": user?.cl_emergency_no ?? "-",
              "Blood Group": user?.cl_blood_group ?? "-",
              "Guardian Name": user?.cl_guardian_name ?? "-",
              "Permanent Address": user?.cl_permanent_address ?? "-",
              "Present Address": user?.cl_present_address ?? "-",
              "ESI No": user?.cl_esino ?? "-",
              "PF No": user?.cl_pfno ?? "-",
              "UAN No": user?.cl_uanno ?? "-",
              "PCC": user?.cl_pcc ?? "-",
              "Scrum ID": user?.cl_scrum_id ?? "-",
              "Trade": user?.cl_trade ?? "-",
              "Unit": user?.cl_unit ?? "-",
              "Valid Upto": user?.cl_valid_upto ?? "-",
              // "Role ID": user?.role_id ?? "-",
              "VD Name": user?.vd_name ?? "-",
            })
          });

          this.excelService.exportAsExcelFile(exportData, 'clmsrawdata');
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.message);
        }

        this.spinner.hide();
      } else {
        if (res.status == 'success') {
          this.users = res.Users;

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
          this.users = [];
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.users = [];
          this.toastr.error(res.message);
        }

        $('#userraw-view-section').find('.table-processing').hide()
      }
    }, (err) => {
      this.users = [];
      this.toastr.error(Global.showServerErrorMessage(err));
      $('#userraw-view-section').find('.table-processing').hide()
    });
  }
}

