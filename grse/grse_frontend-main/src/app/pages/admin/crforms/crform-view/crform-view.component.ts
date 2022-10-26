import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as Global from 'src/app/globals';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { AdminService } from 'src/app/services/admin.service';

@Component({
    selector: 'admin-app-crform-view',
    templateUrl: './crform-view.component.html',
    styleUrls: ['./crform-view.component.css']
})
export class AdminCrformViewComponent implements OnInit {
    Global = Global;
    formDetails: any = null;
    formDetailsTr: any = null;
    statusMaster: any = [];
    editForm: FormGroup;

    isEditing: Boolean = false;

    constructor(
        public AdminLayoutComponent: AdminLayoutComponent,
        private activatedRoute: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private adminService: AdminService,
        public formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.editForm = formBuilder.group({
            "status": [null, Validators.compose([Validators.required])],
            "submission_comment": [null, Validators.compose([])],
            "attachment_code": this.formBuilder.array([
                // this.initFormRows('attachment_code'),
            ]),
        });

        this.statusMaster = [
            { "value": "complete", "description": "Accept" },
            { "value": "reject", "description": "Reject" },
            { "value": "correction", "description": "Correction Request to Previous Department" },
        ];
    }

    async ngOnInit() {
        setTimeout(() => {
            this.AdminLayoutComponent.loadPageTitle("CR Form Details", "", [
                { 'url': '/admin/cr-forms/list', 'name': "CR Forms" },
                { 'url': 'active', 'name': 'View' },
            ])
        });

        // if (['edit'].includes(this.activatedRoute.snapshot.url[2]?.path)) {
        //   this.isEditing = true;
        // }

        await this.fetchDetails(this.activatedRoute.snapshot.url[1]?.path);
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
        const $this = this;
        return new Promise(function (resolve, reject) {
            $this.spinner.show();
            $this.adminService.fetchSubmittedFormDetails({
                'cr_code': unique_id
            }).subscribe(res => {
                if (res.status == 'success') {
                    $this.formDetails = res?.Data ?? null

                    $this.formDetails.doc_details = $this.formDetails.doc_details.sort((a: any, b: any) => (a.attachment_code > b.attachment_code) ? 1 : -1)
                    console.log($this.formDetails);
                } else {
                    $this.toastr.error(res.message);
                }

                $this.spinner.hide();
            }, (err) => {
                $this.toastr.error(Global.showServerErrorMessage(err));
                $this.spinner.hide();
            });
        });
    }

    formatUnderscoredString(string: any) {
        return string.replace(/_/g, " ");
    }

    submitForm(event: any) {
        if (this.isEditing == false) {
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
                'form_status': "inprogress",
                'remark': this.editForm.value?.submission_comment ?? "",
                'cr_code': this.formDetails?.unique_id,
                'dcode_details': [],
                'attachment_code': [],
                'file': [],
            };

            switch (document.status) {
                case 'complete':
                case 'correction':
                    document.form_status = 'inprogress';
                    break;

                case 'reject':
                    document.form_status = 'rejected';
                    break;

                default:
                    this.toastr.error("Status mismatch exception occured. Please try again later");
                    return;
                    break;
            }

            // const dcode_details = this.editForm?.value?.dcode_details ?? [];
            // if (dcode_details.length == 0) {
            //   this.toastr.error("No demog master found for update");
            //   return;
            // }

            // dcode_details.forEach((element: any) => {
            //   if (element?.dm_required == true && !element?.dm_value) {
            //     this.toastr.error("Please enter value for \"" + element?.dm_label + "\"");
            //     Global.scrollToQuery('.field-' + element?.dm_code);
            //     return;
            //   }

            //   document.dcode_details.push({
            //     'dcode': element?.dm_code ?? null,
            //     'd_value': element?.dm_value ?? null,
            //   })
            // });

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

            event.target.classList.add('btn-loading');
            this.adminService.submitCrForm(document).subscribe(res => {
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
                    dm_value: [data?.dm_value ?? 'TEST-dummy', Validators.compose([])],
                    dm_label: [data?.dm_label ?? null, Validators.compose([])],
                    dm_required: [data?.dm_required ?? false, Validators.compose([])],
                });
                break;

            case 'attachment_code':
                return this.formBuilder.group({
                    fl_code: [data?.a_code ?? null, Validators.compose([])],
                    fl_details: [data?.details ?? 'TEST-dummy', Validators.compose([Validators.required])],
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
     * GET CR FORM DOCUMENTS
     * =====================
     */
    crFormSystemDocs: any[] = [];
    crFormSystemDocsFetched: boolean = false;

    showSystemDocuments() {
        this.spinner.show();
        this.adminService.getCrFormSystemDocsByUniqueId({
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
