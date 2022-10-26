import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';
import { UserService } from 'src/app/services/user.service';
import * as Global from 'src/app/globals';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import swal from 'sweetalert2';

@Component({
    selector: 'user-app-crform-view',
    templateUrl: './crform-view.component.html',
    styleUrls: ['./crform-view.component.css']
})
export class UserCrformViewComponent implements OnInit {
    Global = Global;

    formDetails: any = null;
    formDetailsTr: any = null;
    actionWindow: any = "view";

    editForm: FormGroup;

    statusMaster: any[] = [];
    flDetailsMaster: any[] = [];
    clDealingOfiicersMaster: any[] = [];
    dcodeDisableEdit: any[] = [];

    initiationPermission: Boolean = false;

    constructor(
        public UserLayoutComponent: UserLayoutComponent,
        private activatedRoute: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private userService: UserService,
        private authService: AuthService,
        public formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.editForm = formBuilder.group({
            "status": [null, Validators.compose([Validators.required])],
            "submission_comment": [null, Validators.compose([])],
            "attachment_code": this.formBuilder.array([
                // this.initFormRows('attachment_code'),
            ]),
            "dcode_details": this.formBuilder.array([
                // this.initFormRows('dcode_details'),
            ]),
        });

        this.statusMaster = [
            { "value": "complete", "description": "Accept" },
            // { "value": "rejected", "description": "Reject" },
            { "value": "correction", "description": "Correction Request to Previous Department" },
        ];
    }

    async ngOnInit() {
        if (['edit', 'reinitiate', 'transfer'].includes(this.activatedRoute.snapshot.url[2]?.path)) {
            this.actionWindow = this.activatedRoute.snapshot.url[2]?.path;
        }

        setTimeout(() => {
            this.UserLayoutComponent.loadPageTitle("CR Form Details", "", [
                { 'url': '/user/cr-forms/list', 'name': "CR Forms" },
                { 'url': 'active', 'name': this.actionWindow },
            ])
        });

        await this.fetchDetails(this.activatedRoute.snapshot.url[1]?.path);
        await this.getDocDetailsMaster();
    }

    collpseLog(event: any, groupIndex: any, quesIndex: any) {
        if (event.target.querySelector('i').classList?.contains('fa-plus-circle')) {
            event.target.querySelector('i').classList.remove('fa-plus-circle');
            event.target.querySelector('i').classList.add('fa-minus-circle');
        } else {
            event.target.querySelector('i').classList.remove('fa-minus-circle');
            event.target.querySelector('i').classList.add('fa-plus-circle');
        }

        $('.' + "collapselog-" + groupIndex + "-" + quesIndex).toggle();
    }

    fetchDetails(unique_id: any) {
        return new Promise((resolve, reject) => {
            this.spinner.show();
            this.userService.fetchSubmittedFormDetails({
                'cr_code': unique_id
            }).subscribe(async res => {
                if (res.status == 'success') {
                    this.formDetails = res?.Data ?? null
                    this.formDetails.doc_details = this.formDetails.doc_details.sort((a: any, b: any) => (a.attachment_code > b.attachment_code) ? 1 : -1)

                    switch (this.formDetails.form_state_status) {
                        case 'new':
                        case '':
                            this.dcodeDisableEdit = [
                                'vd_vendor_code', 'vd_company_name', 'vd_po', // For B1 Form
                                'cl_vd_code', 'cl_dept', 'cl_yard', 'cl_unit', 'cl_clms_id', 'cl_po', 'cl_po_date', 'vd_b1',  // For B2 Form
                            ]
                            break;

                        case 'reinitiate':
                            this.dcodeDisableEdit = [
                                'vd_vendor_code', 'vd_company_name', 'vd_po', // For B1 Form
                                'cl_vd_code', 'cl_dept', 'cl_yard', 'cl_unit', 'cl_clms_id', 'cl_po', 'cl_po_date', 'vd_b1',  // For B2 Form
                            ]
                            break;

                        case 'transfer':
                            this.dcodeDisableEdit = [
                                'cl_vd_code', 'cl_dept', 'cl_yard', 'cl_unit', 'cl_clms_id', 'cl_po', 'cl_po_date', 'vd_b1',  // For B2 Form
                            ]
                            break;
                    }

                    if (['reinitiate'].includes(this.actionWindow)) {
                        this.dcodeDisableEdit = [
                            'vd_vendor_code', 'vd_company_name', 'vd_po', // For B1 Form
                            'cl_vd_code', 'cl_dept', 'cl_yard', 'cl_unit', 'cl_clms_id', 'cl_po', 'cl_po_date', 'vd_b1',  // For B2 Form
                        ]

                        this.editForm.patchValue({
                            'status': this.statusMaster.find((obj: any) => {
                                return obj.value == 'complete';
                            }) ?? null,
                        })
                    } else if (['transfer'].includes(this.actionWindow)) {
                        this.dcodeDisableEdit = [
                            'cl_vd_code', 'cl_dept', 'cl_yard', 'cl_unit', 'cl_clms_id', 'cl_po', 'cl_po_date', 'vd_b1',  // For B2 Form
                        ]

                        this.editForm.patchValue({
                            'status': this.statusMaster.find((obj: any) => {
                                return obj.value == 'complete';
                            }) ?? null,
                        })
                    }

                    // console.log(this.formDetails.form_state_status);
                    // console.log(this.dcodeDisableEdit)


                    this.initiationPermission = false;
                    let _fetchCostCenterInitPermission: any = await this.fetchCostCenterInitPermission(this.formDetails?.cost_center);
                    this.initiationPermission = _fetchCostCenterInitPermission;
                } else {
                    this.toastr.error(res.message);
                }

                this.spinner.hide();
                resolve(true);
            }, (err) => {
                this.toastr.error(Global.showServerErrorMessage(err));
                this.spinner.hide();
                resolve(true);
            });
        });
    }

    formatUnderscoredString(string: any) {
        return string.replace(/_/g, " ");
    }

    submitForm(event: any) {
        if (!['edit', 'reinitiate', 'transfer'].includes(this.actionWindow)) {
            this.toastr.error("You don't have edit permission to continue");
            return;
        }

        this.editForm.markAllAsTouched();
        setTimeout(function () {
            Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
        }, 100);

        if (this.editForm.valid) {
            if (!this.formDetails?.unique_id || !this.formDetails?.form_type?.id) {
                this.toastr.error("Form ID not found. Please try again later");
                return;
            }

            let document: any = {
                'form_id': this.formDetails?.form_type?.id,
                'status': this.editForm.value?.status?.value ?? "",
                'form_status': "pending",
                'remark': this.editForm.value?.submission_comment ?? "",
                'cr_code': this.formDetails?.unique_id,
                'dcode_details': [],
                'attachment_code': [],
                'file': [],
            };

            if (['edit', 'reinitiate', 'transfer'].includes(this.actionWindow)) {
                const dcode_details = this.editForm?.value?.dcode_details ?? [];
                if (dcode_details.length > 0) {
                    for (const key in dcode_details) {
                        if (Object.prototype.hasOwnProperty.call(dcode_details, key)) {
                            const element = dcode_details[key];

                            if (element?.dm_required == true && !element?.dm_value) {
                                this.toastr.error("Please enter value for \"" + element?.dm_label + "\"");
                                Global.scrollToQuery('.field-' + element?.dm_code);
                                return;
                            }

                            if (element?.dm_code == "cl_aadhaar") {
                                if (element?.dm_value?.length != 12) {
                                    this.toastr.error("The \"" + element?.dm_label + "\" length must be 12 digits");
                                    Global.scrollToQuery('.field-' + element?.dm_code);
                                    return;
                                }
                            }

                            let dm_code = element?.dm_code ?? null;
                            let dm_value = element?.dm_value ?? null;

                            if (element?.dm_code == "cl_dealing_officer") {
                                if (element?.dm_value?.employee_id) {
                                    dm_value = element?.dm_value?.employee_id;
                                }
                            }

                            document.dcode_details.push({
                                'dcode': dm_code,
                                'd_value': dm_value,
                            })
                        }
                    }
                }
            }

            switch (document.status) {
                case 'complete':
                case 'correction':
                    document.form_status = 'pending';
                    break;

                case 'rejected':
                    document.form_status = 'rejected';
                    break;

                default:
                    this.toastr.error("Status mismatch exception occured. Please try again later");
                    return;
                    break;
            }

            const attachment_code = this.editForm?.value?.attachment_code ?? [];
            if (attachment_code.length > 0) {
                let i: number = 0;
                attachment_code.forEach((element: any) => {
                    document.file.push(element?.fl_filesource);
                    document.attachment_code.push({
                        a_code: 'A' + (i + 1),
                        details: element?.fl_details ?? "",
                    });

                    i++;
                });
            }

            document.dcode_details = JSON.stringify(JSON.stringify(document.dcode_details));
            document.attachment_code = JSON.stringify(JSON.stringify(document.attachment_code));

            document.form_state = this.formDetails?.form_state_status ?? "new";
            if (['reinitiate', 'transfer'].includes(this.actionWindow)) {
                document.form_state = this.actionWindow;
            }

            event.target.classList.add('btn-loading');
            this.userService.submitCrForm(document).subscribe(res => {
                if (res.status == 'success') {
                    this.toastr.success(res.message);
                    this.router.navigate(['/user/cr-forms/list']);
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

    /**
     * -----------------------------
     * MULTIPLE FIELDS FORM FUNCTION
     * -----------------------------
     */
    initFormRows(type: any, data: any = null) {
        switch (type) {
            case 'dcode_details':
                return this.formBuilder.group({
                    dm_code: [data?.dm_code ?? null, Validators.compose([])],
                    dm_value: [data?.dm_value ?? null, Validators.compose([])],
                    dm_label: [data?.dm_label ?? null, Validators.compose([])],
                    dm_required: [data?.dm_required ?? false, Validators.compose([])],
                    dm_type: [data?.dm_type ?? false, Validators.compose([])],
                    lov_values: [data?.lov_values ?? false, Validators.compose([])],
                });
                break;

            case 'attachment_code':
                return this.formBuilder.group({
                    fl_code: [data?.a_code ?? null, Validators.compose([])],
                    fl_details: [data?.details ?? null, Validators.compose([Validators.required])],
                    fl_file: [null, Validators.compose([Validators.required])],
                    fl_filesource: [null, Validators.compose([Validators.required])],
                });
                break;

            default:
                return this.formBuilder.group({});
                break;
        }
    }

    resetAllFormRows({
        is_editing = <Boolean>false,
        array = <any[]>['dcode_details']
    } = {}) {
        array.forEach((element: any) => {
            const control = <FormArray>this.editForm.get(element);
            control.clear();
        });

        if (is_editing == false) {
            array.forEach((element: any) => {
                this.addFormRows(element);
            });
        }
    }

    addFormRows(type: any, data: any = null) {
        const control = <FormArray>this.editForm.get(type);
        switch (type) {
            case 'dcode_details':
                control.push(this.initFormRows('dcode_details', data));
                break;

            case 'attachment_code':
                control.push(this.initFormRows('attachment_code', data));
                break;
        }
    }

    removeFormRow(type: any, i: number) {
        const control = <FormArray>this.editForm.get(type);
        control.removeAt(i);
    }

    fetchIndexOfControl(formGroup: FormGroup, type: any, s_key: any, s_value: any) {
        let arr: any[] = formGroup.value?.[type];
        if (Array.isArray(arr)) {
            let index: any = arr.findIndex(x => x[s_key] == s_value);
            return index;
        }

        return false;
    }

    /**
     * --------------------
     * FILE SELECT FUNCTION
     * --------------------
     */
    onFormArrayImageChanged(event: any, type: any, index: any, file_source: any) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            const FormArr = Global.getFormGroupArray(this.editForm, type)
            FormArr[index].patchValue({
                [file_source]: file
            })
        }
    }

    /**
     * --------------------
     * DM EDITING FUNCTIONS
     * --------------------
     */
    async dmEdit(item: any) {
        if (!item?.demog_details?.dcode) {
            this.toastr.error("DCODE not found");
            return;
        }

        let data: any = {
            'dm_code': item?.demog_details?.dcode,
            'dm_value': null,
            'dm_label': item?.label,
            'dm_required': item?.demog_master?.is_required == true ? true : false,
            'dm_type': item?.demog_master?.type,
            'lov_values': item?.demog_master?.lov_values?.split(','),
        }

        // console.log(item?.demog_master?.lov_values?.split(','));

        this.addFormRows('dcode_details', data);

        setTimeout(function () {
            Global.scrollToQuery(".dcode-details-entry");
        }, 10);

        // await this.fetchDmField(item?.demog_details?.dcode)
    }

    fetchDmField(dm_code: any) {
        const $this = this;
        return new Promise(function (resolve, reject) {
            if (!$this.formDetails?.form_details) {
                reject('Form detals group not defined');
            }

            let obj: any = null;
            $this.formDetails?.form_details.forEach((dmGroups: any) => {
                (dmGroups?.demog ?? []).forEach((demog: any) => {

                });
            });
        })
    }

    getDocDetailsMaster() {
        return new Promise((resolve, reject) => {
            this.spinner.show();
            this.flDetailsMaster = [];
            this.userService.fetchDmDetails({
                "demog_code": "doc_details"
            }).subscribe(res => {
                this.spinner.hide();
                this.flDetailsMaster = res.DemogList.lov_values.split(",");

                resolve(true);
            }, (err) => {
                this.spinner.hide();
                this.toastr.error(Global.showServerErrorMessage(err));
                resolve(true);
            });
        })
    }

    userListSearched(type: any, event: any) {
        const $this = this;
        return new Promise(function (resolve, reject) {
            $this.userService.fetchUsers({
                "role": 3,
                "emoloyee_id": event,
                "search_status": event ? true : false,

                "pageno": 1,
                "name": "",
                "cost_cntr": "",
                "aadhar": "",
                "Filter": false,
                "export": true,
                "filter_params": {
                    "status": "",
                    "alpeta_user_id": "",
                    "biometric_reg": "",
                    "start_date": "",
                    "end_date": "",
                    "Alpeta_Reg_date": "",
                },
            }).subscribe(res => {
                let userList: any[] = [];
                if (res.status == 'success') {
                    res.Users.forEach((element: any) => {
                        userList.push({ 'id': element.id, 'employee_id': element.employee_id, 'full_name': element.full_name, 'description': element.full_name + " (#" + element.employee_id + ")" })
                    });
                } else if (res.status == 'val_error') {
                    $this.toastr.error(Global.showValidationMessage(res.errors));
                } else {
                    $this.toastr.error(res.message);
                }

                $this.defineUserValue(type, userList);
                resolve(true);
            }, (err) => {
                $this.defineUserValue(type, []);
                $this.toastr.error(Global.showServerErrorMessage(err));
                resolve(true);
            });
        });
    }

    defineUserValue(type: any, users: any[]) {
        switch (type) {
            case 'cl_dealing_officer':
                this.clDealingOfiicersMaster = users;
                break;

            default:
                this.toastr.error("Invalid Search Type");
                return;
        }
    }


    fetchCostCenterInitPermission(costcenter: any) {
        return new Promise((resolve, reject) => {
            this.spinner.show
            this.userService.getCostcenterInitiationPermission({
                'cost_center': costcenter,
                'token': this.authService.getUserToken(),
            }).subscribe(async res => {
                this.spinner.hide();
                if (res.status == 'success') {
                    resolve(res?.permit ?? false)
                } else {
                    // this.toastr.error(res.message);
                    resolve(false);
                }
            }, (err) => {
                // this.toastr.error(Global.showServerErrorMessage(err));
                this.spinner.hide();
                resolve(false);
            });
        })
    }

    releaseForm() {
        swal.fire({
            title: 'Please make sure, release the B2 Form?',
            text: 'You will not be able to reverse this action!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, release it!',
            cancelButtonText: 'No, cancel it'
        }).then((result) => {
            if (result.value) {
                this.spinner.show();
                this.userService.submitCrForm({
                    'form_id': this.formDetails?.form_type?.id,
                    'cr_code': this.formDetails?.unique_id,
                    'form_state': "release",
                }).subscribe(res => {
                    if (res.status == 'success') {
                        this.toastr.success(res.message);
                        this.router.navigate(['/user/cr-forms/list']);
                    } else if (res.status == 'val_error') {
                        this.toastr.error(Global.showValidationMessage(res.errors));
                    } else {
                        this.toastr.error(res.message);
                    }

                    this.spinner.hide();
                }, (err) => {
                    this.spinner.hide();
                    this.toastr.error(Global.showServerErrorMessage(err));
                });
            } else if (result.dismiss === swal.DismissReason.cancel) {
                swal.fire(
                    'Cancelled',
                    'Your data is safe :)',
                    'error'
                )
            }
        })
    }

    /**
     * GET CR FORM DOCUMENTS
     * =====================
     */
    crFormSystemDocs: any[] = [];
    crFormSystemDocsFetched: boolean = false;

    showSystemDocuments() {
        this.spinner.show();
        this.userService.getCrFormSystemDocsByUniqueId({
            "unique_id": this.formDetails?.unique_id
        }).subscribe((res) => {
            if (res.status == 'success') {
                this.crFormSystemDocs = res?.data ?? [];
                console.log('crFormSystemDocs : ', this.crFormSystemDocs)
            } else {
                this.crFormSystemDocs = [];
                this.toastr.error(res.message);
            }

            this.spinner.hide();
            this.crFormSystemDocsFetched = true;
        }, (err) => {
            this.crFormSystemDocs = [];
            this.toastr.error(Global.showServerErrorMessage(err));
            this.spinner.hide();
        })
    }

    hideSystemDocuments() {
        this.crFormSystemDocs = [];
        this.crFormSystemDocsFetched = false;
    }
}
