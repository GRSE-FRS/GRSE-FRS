import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';

@Component({
  selector: 'app-admin-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.css']
})
export class AdminVendorDetailsComponent implements OnInit {
  Global = Global;
  vendorId: any = null;
  vendorDetails: any = null;
  vendorPurchaseOrders: any[] = [];
  vendorPurchaseOrdersUsers: any[] = [];
  vendorPurchaseOrderTableOptions: TableOptions = Global.resetTableOptions();
  purchaseOrderUsersTableOptions: TableOptions = Global.resetTableOptions();
  purchaseOrderDetails: any = null;

  fromPanel: string = "";

  constructor(
    private UserLayoutComponent: UserLayoutComponent,
    private AdminLayoutComponent: AdminLayoutComponent,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private adminService: AdminService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.vendorId = params['id'] ?? null;
    });

    this.fromPanel = (this.router.url.split('/'))[1] ?? "";
  }

  async ngOnInit() {
    setTimeout(async () => {
      if (this.fromPanel == 'user')
        this.UserLayoutComponent.loadPageTitle("Manage Contractors", "", [
          { 'url': '/user/master/contactors', 'name': "Contractors" },
          { 'url': 'active', 'name': 'Details' },
        ])
      else
        this.AdminLayoutComponent.loadPageTitle("Manage Contractors", "", [
          { 'url': '/admin/master/contactors', 'name': "Contractors" },
          { 'url': 'active', 'name': 'Details' },
        ])

      await this.fetchVendorDetails();
    })

  }

  fetchVendorDetails({
    page = <any>null,
    reset = <boolean>true
  } = {}) {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      if (reset == true) {
        this.vendorDetails = null;
        this.vendorPurchaseOrders = [];
      }

      if(page != null){
        this.vendorPurchaseOrderTableOptions.page = page
      }

      this.adminService.fetchVendorDetails({
        'vendor_code': this.vendorId,
        'page_no': this.vendorPurchaseOrderTableOptions.page
      }).subscribe(async res => {
        if (res.status == 'success') {
          this.vendorDetails = res?.vendor_info ?? null;

          this.vendorPurchaseOrders = res?.vendor_details ?? [];
          /** CALCULATING THE PAGINATION NUMBERS */
          let totalDocs = res.count;
          let totalPages = Math.ceil(totalDocs / Global.TableLength);
          this.vendorPurchaseOrderTableOptions = {
            page: this.vendorPurchaseOrderTableOptions.page,
            limit: Global.TableLength,
            pagingCounter: (this.vendorPurchaseOrderTableOptions.page - 1) * Global.TableLength,
            totalDocs: totalDocs,
            totalPages: totalPages,
            hasNextPage: (this.vendorPurchaseOrderTableOptions.page < totalPages),
            hasPrevPage: (this.vendorPurchaseOrderTableOptions.page > 1),
            nextPage: (this.vendorPurchaseOrderTableOptions.page + 1 < totalPages) ? this.vendorPurchaseOrderTableOptions.page + 1 : null,
            prevPage: (this.vendorPurchaseOrderTableOptions.page > 1) ? this.vendorPurchaseOrderTableOptions.page - 1 : null
          }
          /** CALCULATING THE PAGINATION NUMBERS */
        } else {
          this.toastr.error(res.message);
          this.vendorPurchaseOrderTableOptions = Global.resetTableOptions();
        }

        this.spinner.hide();
        resolve(true);
      }, (err) => {
        this.spinner.hide();
        this.vendorPurchaseOrderTableOptions = Global.resetTableOptions();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    })
  }

  viewPoAssignedEmp({
    init = <boolean>false,
    purchaseorder = <any>null,
    page = <any>null,
    loading = <boolean>true,
  } = {}) {
    if (init === true) {
      let modal: any = $('#po-employees-modal');
      if (modal) modal.modal('show');

      this.vendorPurchaseOrdersUsers = [];
      this.purchaseOrderUsersTableOptions = Global.resetTableOptions()

      $('#po-employees-modal').find('#table-search').val('')
    }

    if (purchaseorder != null) this.purchaseOrderDetails = purchaseorder
    if (page != null) this.purchaseOrderUsersTableOptions.page = page;
    if (loading == true) $('#po-employees-modal')?.find('.table-processing').show();


    const unique_id = this.purchaseOrderDetails.unique_id ?? null
    const search = $('#po-employees-modal').find('#table-search').val() ?? ""

    this.adminService.fetchUsersByB1Form({
      'unique_id': unique_id,
      'page_no': this.purchaseOrderUsersTableOptions.page,
      'search': search.toString().trim(),
    }).subscribe(async res => {
      if (res.status == 'success') {
        this.vendorPurchaseOrdersUsers = res?.user_details ?? [];
        /** CALCULATING THE PAGINATION NUMBERS */
        let totalDocs = res.count;
        let totalPages = Math.ceil(totalDocs / Global.TableLength);
        this.purchaseOrderUsersTableOptions = {
          page: this.purchaseOrderUsersTableOptions.page,
          limit: Global.TableLength,
          pagingCounter: (this.purchaseOrderUsersTableOptions.page - 1) * Global.TableLength,
          totalDocs: totalDocs,
          totalPages: totalPages,
          hasNextPage: (this.purchaseOrderUsersTableOptions.page < totalPages),
          hasPrevPage: (this.purchaseOrderUsersTableOptions.page > 1),
          nextPage: (this.purchaseOrderUsersTableOptions.page + 1 < totalPages) ? this.purchaseOrderUsersTableOptions.page + 1 : null,
          prevPage: (this.purchaseOrderUsersTableOptions.page > 1) ? this.purchaseOrderUsersTableOptions.page - 1 : null
        }
        /** CALCULATING THE PAGINATION NUMBERS */
      } else {
        this.toastr.error(res.message);
        this.vendorPurchaseOrdersUsers = [];
        this.purchaseOrderUsersTableOptions = Global.resetTableOptions()
      }

      if (loading == true) $('#po-employees-modal')?.find('.table-processing').hide();
    }, (err) => {
      if (loading == true) $('#po-employees-modal')?.find('.table-processing').hide();
      this.vendorPurchaseOrdersUsers = [];
      this.purchaseOrderUsersTableOptions = Global.resetTableOptions()
      this.toastr.error(Global.showServerErrorMessage(err));
    });
  }
}
