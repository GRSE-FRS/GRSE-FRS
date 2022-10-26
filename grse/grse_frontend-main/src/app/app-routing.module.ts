import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
import { GuestGuard } from './guards/guest.guard';
import { NotfoundErrorComponent } from './pages/error/notfound/notfound.component';
import { AdminLayoutComponent } from './pages/layouts/admin/admin.component';
import { AuthLayoutComponent } from './pages/layouts/auth/auth.component';
import { AdminLoginComponent } from './pages/auth/admin-login/admin-login.component';
import { AdminHomeComponent } from './pages/admin/home/home.component';
import { AdminProfileComponent } from './pages/admin/profile/profile.component';
import { AdminDepartmentsComponent } from './pages/admin/masters/departments/departments.component';
import { AdminVendorsComponent } from './pages/admin/masters/vendors/vendors.component';
import { AdminUnitsComponent } from './pages/admin/masters/units/units.component';
import { AdminSubareasComponent } from './pages/admin/masters/subareas/subareas.component';
import { AdminShiftsComponent } from './pages/admin/masters/shifts/shifts.component';
import { AdminDesignationsComponent } from './pages/admin/masters/designations/designations.component';
import { AdminTerminalsComponent } from './pages/admin/terminals/terminals/terminals.component';
import { AdminTerminalGroupsComponent } from './pages/admin/terminals/terminal-groups/terminal-groups.component';
import { AdminTerminalGroupTerminalsComponent } from './pages/admin/terminals/terminal-group-terminals/terminal-group-terminals.component';
import { AdminAttendanceComponent } from './pages/admin/attendance/attendance.component';
import { AdminAuthLogsComponent } from './pages/admin/auth-logs/auth-logs.component';
import { AdminRawAuthLogsComponent } from './pages/admin/auth-logs-raw/raw-auth-logs.component';
import { AdminCrformTypesComponent } from './pages/admin/crforms/crform-types/crform-types.component';
import { AdminCrformRegisterComponent } from './pages/admin/crforms/crform-register/crform-register.component';
import { AdminClmsRawComponent } from './pages/admin/userraw/clms-raw/clms-raw.component';
import { AdminClmsRawDetailsComponent } from './pages/admin/userraw/clms-raw-details/clms-raw-details.component';
import { AdminCrformDemogmasterComponent } from './pages/admin/crforms/crform-demogmaster/crform-demogmaster.component';
import { AdminCrformDemoggroupsComponent } from './pages/admin/crforms/crform-demoggroups/crform-demoggroups.component';
import { AdminCrformDemoggroupAssginmasterComponent } from './pages/admin/crforms/crform-demoggroup-assginmaster/crform-demoggroup-assginmaster.component';
import { AdminCrformCrgroupsComponent } from './pages/admin/crforms/crform-crgroups/crform-crgroups.component';
import { AdminCrformCrgroupsAssignComponent } from './pages/admin/crforms/crform-crgroups-assign/crform-crgroups-assign.component';
import { AdminPurchaseordersComponent } from './pages/admin/masters/purchaseorders/purchaseorders.component';
import { AdminUserCreateComponent } from './pages/admin/user-create/user-create.component';
import { AdminUserListComponent } from './pages/admin/user-list/user-list.component';
import { AdminUserViewComponent } from './pages/admin/user-view/user-view.component';
import { UserLoginComponent } from './pages/auth/user-login/user-login.component';
import { UserLayoutComponent } from './pages/layouts/user/user.component';
import { UserGuard } from './guards/user.guard';
import { UserHomeComponent } from './pages/user/home/home.component';
import { UserProfileComponent } from './pages/user/profile/profile.component';
import { UserAttendanceComponent } from './pages/user/attendance/attendance.component';
import { UserCrformTypesComponent } from './pages/user/crforms/crform-types/crform-types.component';
import { AdminCrformViewComponent } from './pages/admin/crforms/crform-view/crform-view.component';
import { UserCrformRegisterComponent } from './pages/user/crforms/crform-register/crform-register.component';
import { UserCrformViewComponent } from './pages/user/crforms/crform-view/crform-view.component';
import { AdminTerminalRunningJobsComponent } from './pages/admin/terminals/terminal-running-jobs/terminal-running-jobs.component';
import { HomeComponent } from './pages/frontend/home/home.component';
import { AdminVendorDetailsComponent } from './pages/admin/masters/vendor-details/vendor-details.component';
import { UserCrformBucketComponent } from './pages/user/crforms/crform-bucket/crform-bucket.component';
import { AdminTerminalMonitoringComponent } from './pages/admin/terminals/terminal-monitoring/terminal-monitoring.component';
import { AdminCrformMisdocsComponent } from './pages/admin/crforms/crform-misdocs/crform-misdocs.component';
import { PrintPdfDialogComponent } from './pages/user/print-pdf-dialog/print-pdf-dialog.component';
import { UserDetailsService } from './pages/user/print-pdf-dialog/user-details.service';

const routes: Routes = [
    {
        path: '', component: HomeComponent, canActivate: [GuestGuard], data: {
            pageTitle: 'Home',
        },
    },

    {
        path: 'auth',
        component: AuthLayoutComponent,
        canActivate: [GuestGuard],
        data: {
            pageTitle: 'Authentication',
        },
        children: [
            {
                path: 'admin/login', component: AdminLoginComponent, data: {
                    pageTitle: 'Admin Login',
                },
            },
            {
                path: 'user/login', component: UserLoginComponent, data: {
                    pageTitle: 'Employee Login',
                },
            },
        ]
    },

    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        data: {
            pageTitle: 'Admin',
        },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard', component: AdminHomeComponent, data: {
                    pageTitle: 'Admin Dashboard',
                },
            },
            {
                path: 'profile', component: AdminProfileComponent, data: {
                    pageTitle: 'Profile',
                },
            },

            /**
             * ============================
             * Master Routes
             * ============================
             */
            {
                path: 'master/departments', component: AdminDepartmentsComponent, data: {
                    pageTitle: 'Departments',
                },
            },
            {
                path: 'master/contactors', component: AdminVendorsComponent, data: {
                    pageTitle: 'Contractors',
                },
            },
            {
                path: 'master/contractors/:id/details', component: AdminVendorDetailsComponent, data: {
                    pageTitle: 'Contractors',
                },
            },
            {
                path: 'master/designations', component: AdminDesignationsComponent, data: {
                    pageTitle: 'Designations',
                },
            },
            {
                path: 'master/shift-timings', component: AdminShiftsComponent, data: {
                    pageTitle: 'Shift Timings',
                },
            },
            {
                path: 'master/sub-areas', component: AdminSubareasComponent, data: {
                    pageTitle: 'Subareas',
                },
            },
            {
                path: 'master/units', component: AdminUnitsComponent, data: {
                    pageTitle: 'Units',
                },
            },
            {
                path: 'master/purchase-orders', component: AdminPurchaseordersComponent, data: {
                    pageTitle: 'Purchase Orders',
                },
            },

            /**
             * ============================
             * Terminal Routes
             * ============================
             */
            {
                path: 'terminals', component: AdminTerminalsComponent, data: {
                    pageTitle: 'Terminals',
                },
            },
            {
                path: 'terminal-groups', component: AdminTerminalGroupsComponent, data: {
                    pageTitle: 'Terminal Groups',
                },
            },
            {
                path: 'terminal-groups/terminals/:group_id', component: AdminTerminalGroupTerminalsComponent, data: {
                    pageTitle: 'Terminal Groups',
                },
            },
            {
                path: 'terminal/running-jobs', component: AdminTerminalRunningJobsComponent, data: {
                    pageTitle: 'Terminal Running Jobs',
                },
            },
            {
                path: 'terminal/monitoring', component: AdminTerminalMonitoringComponent, data: {
                    pageTitle: 'Terminal Live Monitoring',
                },
            },

            /**
             * ============================
             * Attendance Routes
             * ============================
             */
            // {
            //   path: 'attendance', component: AdminAttendanceComponent, data: {
            //     pageTitle: 'Attendance Logs',
            //   },
            // },
            {
                path: 'attendance', component: AdminAuthLogsComponent, data: {
                    pageTitle: 'Attendance',
                },
            },
            {
                path: 'raw-auth-logs', component: AdminRawAuthLogsComponent, data: {
                    pageTitle: 'Raw Auth Logs',
                },
            },

            /**
             * ============================
             * Main Employee Routes
             * ============================
             */
            { path: 'employees', redirectTo: 'employees/list', pathMatch: 'full' },
            {
                path: 'employees/list', component: AdminUserListComponent, data: {
                    pageTitle: 'Manage Employee',
                },
            },
            {
                path: 'employees/create', component: AdminUserCreateComponent, data: {
                    pageTitle: 'Manage Employee',
                },
            },
            {
                path: 'employees/view/:user_id', component: AdminUserViewComponent, data: {
                    pageTitle: 'Manage Employee',
                },
            },

            /**
             * ============================
             * Vendor Employee Routes
             * ============================
             */
            { path: 'contractlabour', redirectTo: 'contractlabour/list', pathMatch: 'full' },
            {
                path: 'contractlabour/list', component: AdminUserListComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'contractlabour/create', component: AdminUserCreateComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'contractlabour/view/:user_id', component: AdminUserViewComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'contractlabour/raw-data', component: AdminClmsRawComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'contractlabour/raw-data/details/:employee_id', component: AdminClmsRawDetailsComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },


            /**
             * ============================
             * CR-FORM Routes
             * ============================
             */
            { path: 'cr-forms', redirectTo: 'cr-forms/list', pathMatch: 'full' },
            {
                path: 'cr-forms/list', component: AdminCrformTypesComponent, data: {
                    pageTitle: 'CR Forms',
                },
            },
            // {
            //   path: 'cr-forms/:slug/register', component: AdminCrformRegisterComponent, data: {
            //     pageTitle: 'CR Form Registration',
            //   },
            // },
            {
                path: 'cr-forms/demog-master', component: AdminCrformDemogmasterComponent, data: {
                    pageTitle: 'CR Form Demog Master',
                },
            },
            {
                path: 'cr-forms/demog-group', component: AdminCrformDemoggroupsComponent, data: {
                    pageTitle: 'CR Form Demog Group',
                },
            },
            {
                path: 'cr-forms/demog-group/assign-master/:group_id', component: AdminCrformDemoggroupAssginmasterComponent, data: {
                    pageTitle: 'CR Form Demog Group | Assign Demog Master',
                },
            },
            {
                path: 'cr-forms/crgroup-master', component: AdminCrformCrgroupsComponent, data: {
                    pageTitle: 'CR Form Demog Group Master',
                },
            },
            {
                path: 'cr-forms/crgroup-master/assign/:form_slug', component: AdminCrformCrgroupsAssignComponent, data: {
                    pageTitle: 'CR Form Demog Group Master | Assign',
                },
            },
            {
                path: 'cr-forms/:form_id/view', component: AdminCrformViewComponent, data: {
                    pageTitle: 'CR Form | View',
                },
            },
            {
                path: 'cr-forms/mis-docs', component: AdminCrformMisdocsComponent, data: {
                    pageTitle: 'CR Form | MIS',
                },
            },
        ]
    },

    {
        path: 'user',
        component: UserLayoutComponent,
        canActivate: [UserGuard],
        data: {
            pageTitle: 'User',
        },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard', component: UserHomeComponent, data: {
                    pageTitle: 'User Dashboard',
                },
            },
            {
                path: 'profile', component: UserProfileComponent, data: {
                    pageTitle: 'Profile',
                },
            },
            {
                path: 'details/:id', component: PrintPdfDialogComponent, data: {
                    pageTitle: 'Employee Details',
                },
                resolve:{employeeDetails: UserDetailsService}
            },
            {
                path: 'attendance', component: UserAttendanceComponent, data: {
                    pageTitle: 'Attendance',
                },
            },

            {
                path: 'cr-forms/list', component: UserCrformTypesComponent, data: {
                    pageTitle: 'CR Forms',
                },
            },
            {
                path: 'cr-forms/bucket', component: UserCrformBucketComponent, data: {
                    pageTitle: 'CR Forms Bucket',
                },
            },
            {
                path: 'cr-forms/:slug/register', component: UserCrformRegisterComponent, data: {
                    pageTitle: 'CR Form Registration',
                },
            },
            {
                path: 'cr-forms/:form_id/view', component: UserCrformViewComponent, data: {
                    pageTitle: 'CR Form | View',
                },
            },
            {
                path: 'cr-forms/:form_id/edit', component: UserCrformViewComponent, data: {
                    pageTitle: 'CR Form | Edit',
                },
            },
            {
                path: 'cr-forms/:form_id/reinitiate', component: UserCrformViewComponent, data: {
                    pageTitle: 'CR Form | Reinitiate',
                },
            },
            {
                path: 'cr-forms/:form_id/transfer', component: UserCrformViewComponent, data: {
                    pageTitle: 'CR Form | Transfer',
                },
            },
            {
                path: 'cr-forms/mis-docs', component: AdminCrformMisdocsComponent, data: {
                    pageTitle: 'CR Form | MIS',
                },
            },

            /**
             * ============================
             * Vendor Employee Routes
             * ============================
             */
            { path: 'contractlabour', redirectTo: 'contractlabour/list', pathMatch: 'full' },
            {
                path: 'contractlabour/list', component: AdminUserListComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'contractlabour/view/:user_id', component: AdminUserViewComponent, data: {
                    pageTitle: 'Manage Contract Labour',
                },
            },
            {
                path: 'master/contactors', component: AdminVendorsComponent, data: {
                    pageTitle: 'Contractors',
                },
            },
            {
                path: 'master/contractors/:id/details', component: AdminVendorDetailsComponent, data: {
                    pageTitle: 'Contractors',
                },
            },
        ]
    },

    {
        path: '404notfound', component: NotfoundErrorComponent, data: {
            pageTitle: 'Page Not Found',
        }
    },

    {
        path: '**', component: NotfoundErrorComponent, data: {
            pageTitle: 'Page Not Found',
        }
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
