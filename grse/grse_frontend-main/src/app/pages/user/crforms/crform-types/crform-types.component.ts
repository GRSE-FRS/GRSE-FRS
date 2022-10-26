import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';
import { UserService } from 'src/app/services/user.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';

@Component({
    selector: 'app-user-crform-types',
    templateUrl: './crform-types.component.html',
    styleUrls: ['./crform-types.component.css']
})
export class UserCrformTypesComponent implements OnInit {
    formTypes: any[] = [];
    permission: any = null;

    formSubmitted: any[] = [];
    submittedFormTableOptions: TableOptions;

    formPending: any[] = [];
    pendingFormTableOptions: TableOptions;

    formSubmitted_PageNumber: number = 1;
    formPending_PageNumber: number = 1;

    constructor(
        public UserLayoutComponent: UserLayoutComponent,
        private userService: UserService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
    ) {
        this.submittedFormTableOptions = this.pendingFormTableOptions = Global.resetTableOptions();
    }

    ngOnInit(): void {
        setTimeout(async () => {
            this.UserLayoutComponent.loadPageTitle("CR Forms", "", "CR Forms")

            await this.fetchCrFormTypes();
            await this.fetchSubmittedCrForms();
            await this.fetchAccessibleCrForms();
        });
    }

    fetchCrFormTypes({ loading = <boolean>true } = {}) {
        return new Promise((resolve, reject) => {
            if (loading) this.spinner.show();

            this.userService.fetchCrFormTypes().subscribe(res => {
                this.formTypes = res?.cr_forms ?? [];
                this.permission = {
                    'form_init': res.permission ?? null
                };

                if (loading) this.spinner.hide();
                resolve(true);
            }, (err) => {
                this.formTypes = []
                this.toastr.error(Global.showServerErrorMessage(err));
                if (loading) this.spinner.hide();
                reject(err)
            });
        })
    }

    fetchSubmittedCrForms({ page = <any>null, loading = <boolean>true } = {}) {
        return new Promise((resolve, reject) => {
            if (loading) $('#submitted-forms').find('.table-processing').show();

            if (page != null) {
                this.submittedFormTableOptions.page = page;
            }

            let searchKeyword: any = ($('#submitted-forms').find('#search-key').val() ?? "")

            this.userService.fetchSubmittedCrForms({
                'page_no': this.submittedFormTableOptions.page,
                "search": searchKeyword?.trim(),
            }).subscribe(res => {
                this.formSubmitted = res.submitted_forms ?? [];

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res.count;
                let totalPages = Math.ceil(totalDocs / Global.TableLength);
                this.submittedFormTableOptions = {
                    page: this.submittedFormTableOptions.page,
                    limit: Global.TableLength,
                    pagingCounter: (this.submittedFormTableOptions.page - 1) * Global.TableLength,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.submittedFormTableOptions.page < totalPages),
                    hasPrevPage: (this.submittedFormTableOptions.page > 1),
                    nextPage: (this.submittedFormTableOptions.page + 1 < totalPages) ? this.submittedFormTableOptions.page + 1 : null,
                    prevPage: (this.submittedFormTableOptions.page > 1) ? this.submittedFormTableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */

                if (loading) $('#submitted-forms').find('.table-processing').hide();
                resolve(true);
            }, (err) => {
                this.formSubmitted = []
                this.submittedFormTableOptions = Global.resetTableOptions();
                this.toastr.error(Global.showServerErrorMessage(err));
                if (loading) $('#submitted-forms').find('.table-processing').hide();
                reject(err)
            });
        })
    }

    fetchAccessibleCrForms({ page = <any>null, loading = <boolean>true } = {}) {
        return new Promise((resolve, reject) => {
            if (loading) $('#pending-forms').find('.table-processing').show();

            if (page != null) {
                this.pendingFormTableOptions.page = page;
            }

            let searchKeyword: any = ($('#pending-forms').find('#search-key').val() ?? "")

            this.userService.fetchAccessibleCrForms({
                'page_no': this.pendingFormTableOptions.page,
                "search": searchKeyword?.trim(),
            }).subscribe(res => {
                this.formPending = res.access_form ?? [];

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res.count;
                let totalPages = Math.ceil(totalDocs / Global.TableLength);
                this.pendingFormTableOptions = {
                    page: this.pendingFormTableOptions.page,
                    limit: Global.TableLength,
                    pagingCounter: (this.pendingFormTableOptions.page - 1) * Global.TableLength,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.pendingFormTableOptions.page < totalPages),
                    hasPrevPage: (this.pendingFormTableOptions.page > 1),
                    nextPage: (this.pendingFormTableOptions.page + 1 < totalPages) ? this.pendingFormTableOptions.page + 1 : null,
                    prevPage: (this.pendingFormTableOptions.page > 1) ? this.pendingFormTableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */

                if (loading) $('#pending-forms').find('.table-processing').hide();
                resolve(true);
            }, (err) => {
                this.formPending = []
                this.pendingFormTableOptions = Global.resetTableOptions();
                this.toastr.error(Global.showServerErrorMessage(err));
                if (loading) $('#pending-forms').find('.table-processing').hide();
                reject(err)
            });
        })
    }

    // init({ loading = <boolean>true } = {}) {
    //     if (loading == true) this.spinner.show();

    //     this.userService.fetchCrForms().subscribe(res => {
    //         this.formSubmitted_PageNumber = 1;
    //         this.formPending_PageNumber = 1;

    //         this.permission = {
    //             'form_init': res.permission ?? null
    //         };

    //         this.formTypes = res?.cr_forms ?? [];


    //         let sforms = res?.submitted_forms ?? [];

    //         // let aforms: any[] = [];
    //         // (res?.access_form ?? []).forEach((element: any) => {
    //         //   if (element.edit == true) {
    //         //     aforms.push(element);
    //         //   }
    //         // });

    //         for (let index = 1; index <= 50; index++) {
    //             this.formSubmitted = this.formSubmitted.concat(sforms);
    //             // this.formPending = this.formPending.concat(aforms);
    //         }


    //         // this.formSubmitted = (res?.submitted_forms ?? []);
    //         // // this.formSubmitted = (res?.access_form ?? []);

    //         this.formPending = [];
    //         (res?.access_form ?? []).forEach((element: any) => {
    //             if (element.edit == true) {
    //                 this.formPending.push(element);
    //             }
    //         });

    //         // const crFormDetails = {
    //         //   'permission': this.permission,
    //         //   'cr_forms': this.formTypes,
    //         //   'submitted_forms': this.formSubmitted,
    //         //   'access_form': this.formPending,
    //         // };

    //         // localStorage.setItem('userCrFormsListing_' + this.userDetails?.employee_id, JSON.stringify(crFormDetails))

    //         if (loading == true) this.spinner.hide();
    //     }, (err) => {
    //         this.toastr.error(Global.showServerErrorMessage(err));
    //         if (loading == true) this.spinner.hide();
    //     });
    // }
}
