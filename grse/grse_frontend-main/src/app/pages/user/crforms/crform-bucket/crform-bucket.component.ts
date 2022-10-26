import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';
import { UserService } from 'src/app/services/user.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-user-crform-bucket',
    templateUrl: './crform-bucket.component.html',
    styleUrls: ['./crform-bucket.component.css']
})
export class UserCrformBucketComponent implements OnInit {
    bucketForms: any[] = [];
    bucketFormsTableOptions: TableOptions = Global.resetTableOptions();
    bucketForms_PageNumber: number = 1;
    bucketFormsSearchKey: any = "";

    B2TransferDetails: any = null;
    B2TransferForm: FormGroup;

    crB1CodeMaster: any[] = [];
    crB1CodetableOptions: TableOptions = {
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


    constructor(
        public UserLayoutComponent: UserLayoutComponent,
        private userService: UserService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        public formBuilder: FormBuilder,
        private router: Router,
    ) {
        this.B2TransferForm = formBuilder.group({
            "submission_comment": [null, Validators.compose([])],
            "attachment_code": this.formBuilder.array([
                // this.initFormRows('attachment_code'),
            ]),
        });
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.UserLayoutComponent.loadPageTitle("CR Form Bucket", "", [
                { 'url': '/user/cr-forms/list', 'name': "CR Forms" },
                { 'url': 'active', 'name': 'Bucket' },
            ])
        });

        this.init()
    }

    init({
        page = <any>null,
        loading = <boolean>true
    } = {}) {
        if (loading) $('#bucket-forms').find('.table-processing').show();

        if (page != null) {
            this.bucketFormsTableOptions.page = page;
        }

        let searchKeyword: any = ($('#bucket-forms').find('#search-key').val() ?? "")

        this.userService.fetchCrFormBucket({
            'page_no': this.bucketFormsTableOptions.page,
            'search': searchKeyword?.trim(),
        }).subscribe(res => {
            this.bucketForms = res?.submitted_forms ?? [];
            /** CALCULATING THE PAGINATION NUMBERS */
            let totalDocs = res.count;
            let totalPages = Math.ceil(totalDocs / Global.TableLength);
            this.bucketFormsTableOptions = {
                page: this.bucketFormsTableOptions.page,
                limit: Global.TableLength,
                pagingCounter: (this.bucketFormsTableOptions.page - 1) * Global.TableLength,
                totalDocs: totalDocs,
                totalPages: totalPages,
                hasNextPage: (this.bucketFormsTableOptions.page < totalPages),
                hasPrevPage: (this.bucketFormsTableOptions.page > 1),
                nextPage: (this.bucketFormsTableOptions.page + 1 < totalPages) ? this.bucketFormsTableOptions.page + 1 : null,
                prevPage: (this.bucketFormsTableOptions.page > 1) ? this.bucketFormsTableOptions.page - 1 : null
            }
            /** CALCULATING THE PAGINATION NUMBERS */

            if (loading) $('#bucket-forms').find('.table-processing').hide();
        }, (err) => {
            this.bucketForms = [];
            this.bucketFormsTableOptions = Global.resetTableOptions();
            this.toastr.error(Global.showServerErrorMessage(err));
            if (loading) $('#bucket-forms').find('.table-processing').hide();
        });
    }

    initB2Transfer(B2Details: any, page: any = null, openmodal: any = false, fieldsearch: any = null) {
        if (B2Details != 'none') {
            this.B2TransferDetails = {
                'cr_form': B2Details
            };
        }

        if (page != null) {
            this.crB1CodetableOptions.page = page;
        }

        if (fieldsearch != null) {
            let arr = ['table-search-vendorcode_search', 'table-search-vendorname_search', 'table-search-po_search', 'table-search-uniqueid_search',]
            arr.forEach(element => {
                if (element != fieldsearch) {
                    $('#searchCrB1Code-modal').find('#' + element).val('')
                }
            });
        }

        return new Promise((resolve, reject) => {
            this.spinner.show();

            this.userService.fetchOnboardedVendors({
                "vendorcode_search": $('#searchCrB1Code-modal').find('#table-search-vendorcode_search').val() ?? null,
                "vendorname_search": $('#searchCrB1Code-modal').find('#table-search-vendorname_search').val() ?? null,
                "po_search": $('#searchCrB1Code-modal').find('#table-search-po_search').val() ?? null,
                "uniqueid_search": $('#searchCrB1Code-modal').find('#table-search-uniqueid_search').val() ?? null,
                "page_no": this.crB1CodetableOptions.page,
            }).subscribe(res => {
                this.spinner.hide();
                this.crB1CodeMaster = res?.VendorList ?? [];

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res?.SearchCount ?? 0;
                let totalPages = Math.ceil(totalDocs / Global.TableLength);
                this.crB1CodetableOptions = {
                    page: this.crB1CodetableOptions.page,
                    limit: Global.TableLength,
                    pagingCounter: (this.crB1CodetableOptions.page - 1) * Global.TableLength,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.crB1CodetableOptions.page < totalPages),
                    hasPrevPage: (this.crB1CodetableOptions.page > 1),
                    nextPage: (this.crB1CodetableOptions.page + 1 < totalPages) ? this.crB1CodetableOptions.page + 1 : null,
                    prevPage: (this.crB1CodetableOptions.page > 1) ? this.crB1CodetableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */

                if (openmodal == true) {
                    $('#open-searchCrB1Code-modal')?.click();
                }

                resolve(true);
            }, (err) => {
                this.crB1CodetableOptions = {
                    'page': 1,
                    'limit': Global.TableLength,
                    'pagingCounter': 0,
                    'totalDocs': 0,
                    'totalPages': 0,
                    'hasNextPage': false,
                    'hasPrevPage': false,
                    'nextPage': '',
                    'prevPage': '',
                }

                this.spinner.hide();
                this.toastr.error(Global.showServerErrorMessage(err));
                resolve(true);
            });
        });
    }

    async useCrB1Code(B1Details: any) {
        this.B2TransferDetails.B1Details = B1Details

        /** GET SELECTED PURCHASE ORDER */
        const poMaster: any = await this.getPoMaster("FormB2", B1Details.po_number);
        const selectPo = poMaster.find((obj: any) => {
            return obj.po_number == B1Details.po_number
        })

        if (!selectPo) {
            this.toastr.error("Purchase Order Not Found");
            return;
        }

        /** GET SELECTED DEPARTMENT */
        const deptMaster: any = await this.initCrForm("FormB2", 'departments')
        const selectDept = deptMaster.find((obj: any) => {
            return obj.id == B1Details.dept
        })

        if (!selectDept) {
            this.toastr.error("Department not found");
            return;
        }

        this.B2TransferDetails.payload = {
            'costcenter': selectDept.costcntr,
            'department': this.B2TransferDetails.B1Details.dept,
            'yard_no': this.B2TransferDetails.B1Details.yard_no,
            'unit': this.B2TransferDetails.B1Details.unit,
            'po_number': this.B2TransferDetails.B1Details.po_number,
            'dcode_details': [
                { dcode: "vd_b1", d_value: this.B2TransferDetails.B1Details.unique_id },
                { dcode: "cl_vd_code", d_value: this.B2TransferDetails.B1Details.vd_code },
                { dcode: "cl_dept", d_value: selectDept.description },
                { dcode: "cl_yard", d_value: this.B2TransferDetails.B1Details.yard_no },
                { dcode: "cl_unit", d_value: this.B2TransferDetails.B1Details.unit },
                { dcode: "cl_po", d_value: selectPo.po_number },
                { dcode: "cl_po_date", d_value: selectPo.po_date },
            ]
        }

        this.submitB2TransferForm("none");
    }

    getPoMaster(crfromslug: any, searchKey: string = "") {
        return new Promise((resolve, reject) => {
            this.spinner.show();
            this.userService.fetchPoMasterForCrForm({
                'slug': crfromslug,
                'searchKey': searchKey.toString(),
            }).subscribe(res => {
                this.spinner.hide();
                resolve(res.result ?? []);
            }, (err) => {
                this.spinner.hide();
                this.toastr.error(Global.showServerErrorMessage(err));
                reject(err);
            });
        });
    }

    initCrForm(crfromslug: any, retType: any = 'all') {
        return new Promise((resolve, reject) => {
            this.spinner.show();
            this.userService.initCrForm({
                'slug': crfromslug
            }).subscribe(res => {
                this.spinner.hide();

                let departmentMaster: any[] = []
                res.Dept_master.forEach((element: any) => {
                    departmentMaster.push({
                        'id': element.id,
                        'costcntr': element.costcntr,
                        'description': element.shop_name + " (" + element.costcntr + ")",
                    })
                });

                if (retType == 'departments') {
                    resolve(departmentMaster);
                }

                resolve(true);
            }, (err) => {
                this.spinner.hide();
                this.toastr.error(Global.showServerErrorMessage(err));
                reject(err);
            });
        })
    }

    submitB2TransferForm(event: any) {
        this.B2TransferForm.markAllAsTouched();
        setTimeout(function () {
            Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
        }, 100);

        if (this.B2TransferForm.valid) {
            let document = this.B2TransferDetails.payload;

            document.remark = this.B2TransferForm.value.submission_comment ?? "";
            document.cr_code = this.B2TransferDetails.cr_form.unique_id;
            document.form_state = "transfer";
            document.status = "complete";

            document.attachment_code = [];
            const attachment_code = this.B2TransferForm?.value?.attachment_code ?? [];
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

            // event.target.classList.add('btn-loading');
            this.spinner.show();
            this.userService.submitCrForm(document).subscribe(res => {
                this.spinner.hide();
                if (res.status == 'success') {
                    this.toastr.success(res.message);
                    this.router.navigate(['/user/cr-forms/' + document.cr_code + '/view']);
                } else if (res.status == 'val_error') {
                    this.toastr.error(Global.showValidationMessage(res.errors));
                } else {
                    this.toastr.error(res.message);
                }

                this.spinner.hide();
                // event.target.classList.remove('btn-loading');
            }, (err) => {
                this.spinner.hide();
                // event.target.classList.remove('btn-loading');
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
        formGroup = <FormGroup>{},
        is_editing = <Boolean>false,
        array = <any[]>['dcode_details']
    } = {}) {
        array.forEach((element: any) => {
            const control = <FormArray>formGroup.get(element);
            control.clear();
        });

        if (is_editing == false) {
            array.forEach((element: any) => {
                this.addFormRows(formGroup, element);
            });
        }
    }

    addFormRows(formGroup: FormGroup, type: any, data: any = null) {
        const control = <FormArray>formGroup.get(type);
        switch (type) {
            case 'dcode_details':
                control.push(this.initFormRows('dcode_details', data));
                break;

            case 'attachment_code':
                control.push(this.initFormRows('attachment_code', data));
                break;
        }
    }

    removeFormRow(formGroup: FormGroup, type: any, i: number) {
        const control = <FormArray>formGroup.get(type);
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

    assignValueToFormRow(formGroup: FormGroup, type: any, s_key: any, s_value: any) {
        const index = this.fetchIndexOfControl(formGroup, type, s_key, s_value);
        console.log(index);
    }
}
