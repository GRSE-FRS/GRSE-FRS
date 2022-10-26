import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import TableOptions from 'src/app/models/TableOptions';
// import { LocalService } from 'src/app/services/local.service';

@Component({
    selector: 'app-admin-crform-types',
    templateUrl: './crform-types.component.html',
    styleUrls: ['./crform-types.component.css']
})
export class AdminCrformTypesComponent implements OnInit {
    formSubmitted: any[] = [];
    formDetails: any = null;
    groupMaster: any[] = [];
    formStatusMaster: any[] = [];

    b1FormOnboard: FormGroup;
    b2FormOnboard: FormGroup;

    formSubmittedTableOptions: TableOptions;

    constructor(
        public AdminLayoutComponent: AdminLayoutComponent,
        private adminService: AdminService,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        public formBuilder: FormBuilder,
        // public localService: LocalService,
    ) {
        this.b1FormOnboard = formBuilder.group({
            "vendor_name": [null, Validators.compose([Validators.required])],
            "vendor_code": [null, Validators.compose([Validators.required])],
            "scrum_id": [null, Validators.compose([])],
            "labour_limit": [null, Validators.compose([Validators.required])],
            "logo": [null, Validators.compose([])],
            "logo_source": [null, Validators.compose([])],
        });

        this.b2FormOnboard = formBuilder.group({
            "employee_id": [null, Validators.compose([Validators.required])],
            "aadhar": [null, Validators.compose([Validators.required])],
            "full_name": [null, Validators.compose([Validators.required])],
            // "vendor_code": [null, Validators.compose([Validators.required])], // Required field removed on 28th Sept, 2022
            "vendor_code": [null, Validators.compose([])],
            // "start_date": [null, Validators.compose([Validators.required])],
            "employment_start_date": [null, Validators.compose([])],
            "employment_end_date": [null, Validators.compose([])],
            "cl_pass_valid_upto": [null, Validators.compose([Validators.required])],
            "cl_pcc_validity": [null, Validators.compose([Validators.required])],
            "group_id": [null, Validators.compose([])],
        });

        this.formSubmittedTableOptions = {
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

        this.formStatusMaster = [
            { value: "running", description: "Running Forms" },
            { value: "complete", description: "Completed Forms" },
            { value: "onboard", description: "Onboarded Forms" },
        ];
    }

    async ngOnInit() {
        setTimeout(async () => {
            this.AdminLayoutComponent.loadPageTitle("CR Forms", "", "CR Forms")
            // await this.fetchGroupMaster()
            await this.fetchFormSubmitted();
        });
    }

    fetchFormSubmitted({
        loading = <boolean>true,
        page = <any>null,
    } = {}) {
        return new Promise((resolve, reject) => {
            if (page != null) {
                this.formSubmittedTableOptions.page = page;
            }

            if (loading == true) $('#submitted-forms-section').find('.table-processing').show()

            let searchKeyword: any = ($('#submitted-forms-section')?.find('#table-search')?.val() ?? "")

            this.adminService.fetchSubmittedCrForms({
                "page_no": this.formSubmittedTableOptions.page,
                "search": searchKeyword?.trim(),
                "status": $('#submitted-forms-section')?.find('#table-filter')?.val(),
            }).subscribe(res => {
                this.formSubmitted = res?.access_form ?? [];

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res.access_form_count;
                let totalPages = Math.ceil(totalDocs / Global.TableLength);
                this.formSubmittedTableOptions = {
                    page: this.formSubmittedTableOptions.page,
                    limit: Global.TableLength,
                    pagingCounter: (this.formSubmittedTableOptions.page - 1) * Global.TableLength,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.formSubmittedTableOptions.page < totalPages),
                    hasPrevPage: (this.formSubmittedTableOptions.page > 1),
                    nextPage: (this.formSubmittedTableOptions.page + 1 < totalPages) ? this.formSubmittedTableOptions.page + 1 : null,
                    prevPage: (this.formSubmittedTableOptions.page > 1) ? this.formSubmittedTableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */

                if (loading == true) $('#submitted-forms-section').find('.table-processing').hide()
                resolve(true);
            }, (err) => {
                this.formSubmitted = [];
                // formSubmittedTableOptions

                this.toastr.error(Global.showServerErrorMessage(err));
                if (loading == true) $('#submitted-forms-section').find('.table-processing').hide()
                resolve(true);
            });
        })
    }

    async startOnboarding(item: any) {
        await this.initCrFormOnboard(item);
        $('#open-onboarding-modal')?.click();
    }

    initCrFormOnboard(item: any) {
        return new Promise((resolve, reject) => {
            this.formDetails = null;
            let document: any = {};
            switch (item.form_slug) {
                case 'FormB1':
                    document.unique_id = item.unique_id;
                    document.demog_code = [
                        "vd_vendor_code", "vd_company_name", "cl_scrum_id", "vd_max_persons_allowed"
                    ];
                    break;

                case 'FormB2':
                    document.unique_id = item.unique_id;
                    document.demog_code = [
                        "cl_clms_id", "cl_name", "cl_aadhaar", "cl_job_start_date", "cl_job_end_date", "cl_vd_code", "cl_pass_valid_upto", "cl_pcc_validity"
                    ];
                    break;

                default:
                    this.toastr.error(item.form_slug + " - Coming Soon !!");
                    return;
                    break;
            }

            this.spinner.show();
            this.adminService.initCrFormOnboard(document).subscribe(async res => {
                this.spinner.hide();
                if (res.status == 'success') {
                    this.formDetails = item;
                    this.formDetails.onBoardInit = res?.result ?? null

                    switch (this.formDetails.form_slug) {
                        case "FormB1":
                            this.b1FormOnboard.patchValue({
                                'vendor_name': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "vd_company_name"
                                })?.value ?? null,
                                'vendor_code': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "vd_vendor_code"
                                })?.value ?? null,
                                'scrum_id': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_scrum_id"
                                })?.value ?? null,
                                'labour_limit': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "vd_max_persons_allowed"
                                })?.value ?? null
                            })

                            $('#open-b1onboarding-modal')?.click();
                            break;

                        case "FormB2":
                            if (this.formDetails.form_state_status == "transfer") {
                                await this.fetchGroupMaster();
                                this.b2FormOnboard.controls['group_id'].setValidators([Validators.required]);
                            } else {
                                this.b2FormOnboard.controls['group_id'].clearValidators();
                            }

                            this.b2FormOnboard.controls['group_id'].updateValueAndValidity();                            

                            this.b2FormOnboard.patchValue({
                                'employee_id': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_clms_id"
                                })?.value ?? null,
                                'aadhar': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_aadhaar"
                                })?.value ?? null,
                                'full_name': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_name"
                                })?.value ?? null,
                                'vendor_code': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_vd_code"
                                })?.value ?? null,
                                'employment_start_date': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_job_start_date"
                                })?.value ?? null,
                                'employment_end_date': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_job_end_date"
                                })?.value ?? null,
                                'cl_pass_valid_upto': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_pass_valid_upto"
                                })?.value ?? null,
                                'cl_pcc_validity': this.formDetails.onBoardInit.value.find((obj: any) => {
                                    return obj.key == "cl_pcc_validity"
                                })?.value ?? null
                            })

                            if (["reinitiate", "transfer"].includes(this.formDetails?.form_state_status)) {
                                $('#b2onboarding-modal').find('[formcontrolname="employee_id"]').attr('readonly', 'true');
                            } else {
                                $('#b2onboarding-modal').find('[formcontrolname="employee_id"]').removeAttr('readonly');
                            }

                            $('#open-b2onboarding-modal')?.click();
                            break;

                        default:
                            this.toastr.error(item.form_slug + " - Coming Soon !!");
                            break;
                    }
                } else {
                    this.toastr.error(res.message);
                }

                resolve(true);
            }, (err) => {
                this.spinner.hide();
                this.toastr.error(Global.showServerErrorMessage(err));
                resolve(true);
            });
        })
    }

    submitOnBoardForm(event: any, formSlug: any) {
        let formGroup: FormGroup;

        switch (formSlug) {
            case 'FormB1':
                formGroup = this.b1FormOnboard;
                break;

            case 'FormB2':
                formGroup = this.b2FormOnboard;
                break;

            default:
                this.toastr.error("Invalid Request Received");
                return;
                break;
        }

        formGroup.markAllAsTouched();
        setTimeout(function () {
            Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
        }, 100);

        if (formGroup.valid) {
            let document: any = {};
            switch (formSlug) {
                case 'FormB1':
                    document = {
                        "cr_code": this.formDetails?.unique_id,
                        "vendor_name": formGroup?.value?.vendor_name ?? "",
                        "vendor_code": formGroup?.value?.vendor_code ?? "",
                        "scrum_id": formGroup?.value?.scrum_id ?? "",
                        "labour_limit": formGroup?.value?.labour_limit ?? "",
                        "logo": formGroup?.value?.logo_source ?? "",
                        "form_state": this.formDetails?.form_state_status ?? "new",
                    }
                    break;

                case 'FormB2':
                    document = {
                        "cr_code": this.formDetails?.unique_id,
                        "employee_id": formGroup?.value?.employee_id ?? "",
                        "aadhar": formGroup?.value?.aadhar ?? "",
                        "full_name": formGroup?.value?.full_name ?? "",
                        "vendor_code": formGroup?.value?.vendor_code ?? "",
                        "cl_pass_valid_upto": formGroup?.value?.cl_pass_valid_upto ?? "",
                        "cl_pcc_validity": formGroup?.value?.cl_pcc_validity ?? "",
                        "form_state": this.formDetails?.form_state_status ?? "new",
                        "group_id": formGroup?.value?.group_id?.id ?? "",
                    }
                    break;

                default:
                    this.toastr.error("Invalid Request Received");
                    return;
                    break;
            }

            event.target.classList.add('btn-loading');
            this.adminService.submitCrForm(document).subscribe(res => {
                if (res.status == 'success') {
                    this.toastr.success(res.message);
                    Global.resetForm(formGroup);
                    $('.modal').find('[data-bs-dismiss="modal"]')?.click();
                    this.fetchFormSubmitted();
                } else if (res.status == 'val_error') {
                    this.toastr.error(Global.showValidationMessage(res.errors));
                } else {
                    this.toastr.error(res.message);
                }

                event.target.classList.remove('btn-loading');
            }, (err) => {
                event.target.classList.remove('btn-loading');
                this.toastr.error(Global.showServerErrorMessage(err));
            });
        }
    }

    onFileImageChanged(formGroup: FormGroup, event: any, orgname: any, sourcename: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            formGroup.patchValue({
                [sourcename]: file
            })
        } else {
            formGroup.patchValue({
                [sourcename]: ""
            })
        }
    }

    fetchGroupMaster() {
        return new Promise((resolve, reject) => {
            this.spinner.show();
            this.adminService.fetchTerminalGroups({})
                .subscribe(res => {
                    if (res.status == 'success') {
                        this.groupMaster = [];
                        res.group.forEach((element: any) => {
                            if (element.terminal_Count > 0) {
                                this.groupMaster.push({
                                    'id': element.id,
                                    'description': element.name + ' (Terminals - ' + element.terminal_Count + ')',
                                })
                            }
                        });
                    } else if (res.status == 'val_error') {
                        this.toastr.error(Global.showValidationMessage(res.errors));
                    } else {
                        this.toastr.error(res.message);
                    }

                    this.spinner.hide();
                    resolve(true)
                }, (err) => {
                    this.spinner.hide();
                    this.toastr.error(Global.showServerErrorMessage(err));
                    resolve(true)
                });
        })
    }
}
