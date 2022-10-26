import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragulaModule } from 'ng2-dragula';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotfoundErrorComponent } from './pages/error/notfound/notfound.component';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { DatePipe } from '@angular/common';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DpDatePickerModule } from 'ng2-date-picker';
import { PaginationComponent } from './includes/pagination/pagination.component';
import { AuthLayoutComponent } from './pages/layouts/auth/auth.component';
import { AdminLayoutComponent } from './pages/layouts/admin/admin.component';
import { AdminLoginComponent } from './pages/auth/admin-login/admin-login.component';
import { AdminResponsiveHeaderComponent } from './pages/admin/includes/responsive-header/responsive-header.component';
import { AdminHeaderComponent } from './pages/admin/includes/header/header.component';
import { AdminFooterComponent } from './pages/admin/includes/footer/footer.component';
import { AdminSidebarComponent } from './pages/admin/includes/sidebar/sidebar.component';
import { AdminHomeComponent } from './pages/admin/home/home.component';
import { AdminProfileComponent } from './pages/admin/profile/profile.component';
import { AdminDepartmentsComponent } from './pages/admin/masters/departments/departments.component';
import { AdminTerminalsComponent } from './pages/admin/terminals/terminals/terminals.component';
import { AdminAttendanceComponent } from './pages/admin/attendance/attendance.component';
import { AdminUserListComponent } from './pages/admin/user-list/user-list.component';
import { AdminUserCreateComponent } from './pages/admin/user-create/user-create.component';
import { AdminUserViewComponent } from './pages/admin/user-view/user-view.component';
import { AdminVendorsComponent } from './pages/admin/masters/vendors/vendors.component';
import { AdminUnitsComponent } from './pages/admin/masters/units/units.component';
import { AdminSubareasComponent } from './pages/admin/masters/subareas/subareas.component';
import { AdminShiftsComponent } from './pages/admin/masters/shifts/shifts.component';
import { AdminDesignationsComponent } from './pages/admin/masters/designations/designations.component';
import { AdminTerminalGroupsComponent } from './pages/admin/terminals/terminal-groups/terminal-groups.component';
import { AdminTerminalGroupTerminalsComponent } from './pages/admin/terminals/terminal-group-terminals/terminal-group-terminals.component';
import { AdminAuthLogsComponent } from './pages/admin/auth-logs/auth-logs.component';
import { AdminRawAuthLogsComponent } from './pages/admin/auth-logs-raw/raw-auth-logs.component';
import { AdminCrformTypesComponent } from './pages/admin/crforms/crform-types/crform-types.component';
import { AdminCrformRegisterComponent } from './pages/admin/crforms/crform-register/crform-register.component';
import { AdminClmsRawComponent } from './pages/admin/userraw/clms-raw/clms-raw.component';
import { AdminClmsRawDetailsComponent } from './pages/admin/userraw/clms-raw-details/clms-raw-details.component';
import { AdminCrformDemogmasterComponent } from './pages/admin/crforms/crform-demogmaster/crform-demogmaster.component';
import { AdminCrformDemoggroupsComponent } from './pages/admin/crforms/crform-demoggroups/crform-demoggroups.component';
import { AdminCrformCrgroupsComponent } from './pages/admin/crforms/crform-crgroups/crform-crgroups.component';
import { AdminCrformDemoggroupAssginmasterComponent } from './pages/admin/crforms/crform-demoggroup-assginmaster/crform-demoggroup-assginmaster.component';
import { AdminCrformCrgroupsAssignComponent } from './pages/admin/crforms/crform-crgroups-assign/crform-crgroups-assign.component';
import { AdminPurchaseordersComponent } from './pages/admin/masters/purchaseorders/purchaseorders.component';
import { UserLoginComponent } from './pages/auth/user-login/user-login.component';
import { UserLayoutComponent } from './pages/layouts/user/user.component';
import { UserFooterComponent } from './pages/user/includes/footer/footer.component';
import { UserHeaderComponent } from './pages/user/includes/header/header.component';
import { UserResponsiveHeaderComponent } from './pages/user/includes/responsive-header/responsive-header.component';
import { UserSidebarComponent } from './pages/user/includes/sidebar/sidebar.component';
import { UserHomeComponent } from './pages/user/home/home.component';
import { UserProfileComponent } from './pages/user/profile/profile.component';
import { UserAttendanceComponent } from './pages/user/attendance/attendance.component';
import { UserCrformTypesComponent } from './pages/user/crforms/crform-types/crform-types.component';
import { AdminCrformViewComponent } from './pages/admin/crforms/crform-view/crform-view.component';
import { UserCrformRegisterComponent } from './pages/user/crforms/crform-register/crform-register.component';
import { UserCrformViewComponent } from './pages/user/crforms/crform-view/crform-view.component';
import { AdminTerminalRunningJobsComponent } from './pages/admin/terminals/terminal-running-jobs/terminal-running-jobs.component';
import { HomeComponent } from './pages/frontend/home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AdminVendorDetailsComponent } from './pages/admin/masters/vendor-details/vendor-details.component';
import { UserCrformBucketComponent } from './pages/user/crforms/crform-bucket/crform-bucket.component';
import { AdminTerminalMonitoringComponent } from './pages/admin/terminals/terminal-monitoring/terminal-monitoring.component';
import { AdminCrformMisdocsComponent } from './pages/admin/crforms/crform-misdocs/crform-misdocs.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgxPrintModule}  from 'ngx-print';
import { PrintPdfDialogComponent } from './pages/user/print-pdf-dialog/print-pdf-dialog.component';
import { UserDetailsService } from './pages/user/print-pdf-dialog/user-details.service';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    AdminLayoutComponent,
    AdminLoginComponent,
    NotfoundErrorComponent,
    AdminHomeComponent,
    AdminFooterComponent,
    AdminSidebarComponent,
    AdminResponsiveHeaderComponent,
    AdminHeaderComponent,
    AdminProfileComponent,
    AdminDepartmentsComponent,
    AdminTerminalsComponent,
    AdminAttendanceComponent,
    AdminUserListComponent,
    AdminUserCreateComponent,
    AdminUserViewComponent,
    AdminVendorsComponent,
    AdminUnitsComponent,
    AdminSubareasComponent,
    AdminShiftsComponent,
    AdminDesignationsComponent,
    PaginationComponent,
    AdminAuthLogsComponent,
    AdminCrformTypesComponent,
    AdminTerminalGroupsComponent,
    AdminTerminalGroupTerminalsComponent,
    AdminRawAuthLogsComponent,
    AdminCrformRegisterComponent,
    AdminClmsRawComponent,
    AdminClmsRawDetailsComponent,
    AdminCrformDemogmasterComponent,
    AdminCrformDemoggroupsComponent,
    AdminCrformCrgroupsComponent,
    AdminCrformDemoggroupAssginmasterComponent,
    AdminCrformCrgroupsAssignComponent,
    AdminCrformViewComponent,
    AdminPurchaseordersComponent,
    UserLoginComponent,
    UserLayoutComponent,
    UserFooterComponent,
    UserHeaderComponent,
    UserResponsiveHeaderComponent,
    UserSidebarComponent,
    UserHomeComponent,
    UserProfileComponent,
    UserAttendanceComponent,
    UserCrformTypesComponent,
    UserCrformRegisterComponent,
    UserCrformViewComponent,
    AdminTerminalRunningJobsComponent,
    HomeComponent,
    AdminVendorDetailsComponent,
    UserCrformBucketComponent,
    AdminTerminalMonitoringComponent,
    AdminCrformMisdocsComponent,
    PrintPdfDialogComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    DataTablesModule,
    SelectDropDownModule,
    NgSelectModule,
    DragulaModule.forRoot(),
    Ng2SearchPipeModule,
    FormsModule,
    BrowserAnimationsModule,
    DpDatePickerModule,
    NgxPaginationModule,
    NgbModule,
    NgxPrintModule
  ],
  providers: [
    DatePipe,
    AdminLayoutComponent,
    UserLayoutComponent,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    UserDetailsService
  ],
  bootstrap: [AppComponent],
})

export class AppModule { }
