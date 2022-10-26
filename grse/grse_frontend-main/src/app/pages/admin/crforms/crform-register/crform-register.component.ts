import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';

@Component({
  selector: 'app-admin-crform-register',
  templateUrl: './crform-register.component.html',
  styleUrls: ['./crform-register.component.css']
})
export class AdminCrformRegisterComponent implements OnInit {
  Global = Global;
  formGroups: any[] = [];
  departmentMaster: any[] = [];
  poMaster: any[] = [];
  formDetails: any = null;
  registerForm: FormGroup;


  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.registerForm = formBuilder.group({
      "department": [null, Validators.compose([Validators.required])],
      "yard_no": [null, Validators.compose([Validators.required])],
      "unit": [null, Validators.compose([Validators.required])],
      "po_number": [null, Validators.compose([Validators.required])],
      // "costcenter": [null, Validators.compose([Validators.required])],
      "submission_comment": [null, Validators.compose([])],
      "dcode_details": this.formBuilder.array([
        this.initFormRows('dcode_details'),
      ]),
      "attachment_code": this.formBuilder.array([
        // this.initFormRows('attachment_code'),
      ]),
    });
  }

  async ngOnInit() {
    await this.fetchFormFields(this.activatedRoute.snapshot.url[1]?.path);

    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("CR Form Registration", "", [
        { 'url': '/admin/cr-forms/list', 'name': "CR Forms" },
        { 'url': 'active', 'name': this.formDetails?.form_shortcode + ' : ' + this.formDetails?.form_name + ' | Register' },
      ])
    })

    await this.fetchDepartments();
    await this.fetchPONumbers();

    this.registerForm.patchValue({
      'department': this.departmentMaster.find((obj: any) => {
        return obj.id == 89
      }) ?? null,
      'yard_no': "123456",
      'unit': "123456",
      'po_number': this.poMaster.find((obj: any) => {
        return obj.id == 12
      }) ?? null,
      'submission_comment': "This is a test field",
    })
  }

  fetchFormFields(crfromslug: any) {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.spinner.show();

      $this.adminService.fetchCrFormDetailsBySlug({
        'slug': crfromslug
      }).subscribe(res => {
        $this.spinner.hide();
        if (res.status == 'success') {
          $this.formGroups = res?.formGroup ?? [];
          $this.formDetails = res?.formDetails ?? null;

          $this.resetAllFormRows({ 'is_editing': true })
          $this.formGroups.forEach((group: any) => {
            group?.demog_masters.forEach((dm: any) => {
              if (dm?.code) {
                let data: any = {
                  'dm_code': dm?.code,
                  'dm_value': null,
                  'dm_label': dm?.name ?? dm?.code,
                  'dm_required': dm?.is_required == true ? true : false,
                };

                $this.addFormRows('dcode_details', data);
              }
            });
          });
        } else if (res.status == 'val_error') {
          $this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          $this.toastr.error(res.message);
        }

        resolve(true);
      }, (err) => {
        $this.spinner.hide();
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  fetchPONumbers() {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.spinner.show();

      $this.adminService.fetchPurchaseOrders({
        'pageno': 1
      }).subscribe(res => {
        $this.spinner.hide();
        if (res.status == 'success') {
          $this.poMaster = [];
          res.POMasterList.forEach((element: any) => {
            $this.poMaster.push({
              'id': element.id,
              'po_title': element.po_title,
              'po_number': element.po_number,
              'description': element.po_number + ' - ' + element.po_title,
            })
          });
        } else if (res.status == 'val_error') {
          $this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          $this.toastr.error(res.message);
        }

        resolve(true);
      }, (err) => {
        $this.spinner.hide();
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  fetchDepartments() {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.spinner.show();

      $this.adminService.fetchDepartments({
        //Payload Goes Here
      }).subscribe(res => {
        $this.spinner.hide();
        if (res.status == 'success') {
          $this.departmentMaster = [];
          res.Department_List.forEach((element: any) => {
            $this.departmentMaster.push({
              'id': element.id,
              'costcntr': element.costcntr,
              'description': element.shop_name + " (" + element.costcntr + ")",
            })
          });
        } else if (res.status == 'val_error') {
          $this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          $this.toastr.error(res.message);
        }

        resolve(true);
      }, (err) => {
        $this.spinner.hide();
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  submitForm(event: any) {
    this.registerForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.registerForm.valid) {
      let document: any = {
        'form_id': this.formDetails?.id,
        'form_status': "initiated",
        'department': this.registerForm.value?.department?.id ?? "",
        'yard_no': this.registerForm.value?.yard_no ?? "",
        'unit': this.registerForm.value?.unit ?? "",
        'po_number': this.registerForm.value?.po_number?.po_number ?? "",
        'costcenter': this.registerForm.value?.department?.costcntr ?? "",
        'remark': this.registerForm.value?.department?.submission_comment ?? "",
        'cr_code': "",
        'dcode_details': [],
        'attachment_code': [],
        'file': [],
      };

      const dcode_details = this.registerForm?.value?.dcode_details ?? [];
      if (dcode_details.length == 0) {
        this.toastr.error("No demog master found for update");
        return;
      }

      dcode_details.forEach((element: any) => {
        if (element?.dm_required == true && !element?.dm_value) {
          this.toastr.error("Please enter value for \"" + element?.dm_label + "\"");
          Global.scrollToQuery('.field-' + element?.dm_code);
          return;
        }

        document.dcode_details.push({
          'dcode': element?.dm_code ?? null,
          'd_value': element?.dm_value ?? null,
        })
      });

      const attachment_code = this.registerForm?.value?.attachment_code ?? [];
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
          this.router.navigate(['/admin/cr-forms/list']);
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

  cancelEntry() {
    swal.fire({
      title: 'Are you sure want to cancel?',
      text: 'All changes and data entered will be lost',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep editing'
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/admin/cr-forms/list']);
      }
    })
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
      const control = <FormArray>this.registerForm.get(element);
      control.clear();
    });

    if (is_editing == false) {
      array.forEach((element: any) => {
        this.addFormRows(element);
      });
    }
  }

  addFormRows(type: any, data: any = null) {
    const control = <FormArray>this.registerForm.get(type);
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
    const control = <FormArray>this.registerForm.get(type);
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
      const FormArr = Global.getFormGroupArray(this.registerForm, type)
      FormArr[index].patchValue({
        [file_source]: file
      })
    }
  }
}
