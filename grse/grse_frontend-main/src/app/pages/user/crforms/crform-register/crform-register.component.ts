import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as Global from 'src/app/globals';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { UserLayoutComponent } from 'src/app/pages/layouts/user/user.component';
import { UserService } from 'src/app/services/user.service';
import TableOptions from 'src/app/models/TableOptions';

@Component({
  selector: 'app-user-crform-register',
  templateUrl: './crform-register.component.html',
  styleUrls: ['./crform-register.component.css']
})
export class UserCrformRegisterComponent implements OnInit {
  Global = Global;
  formGroups: any[] = [];
  formDetails: any = null;
  registerForm: FormGroup;

  departmentMaster: any[] = [];
  poMaster: any[] = [];
  unitMaster: any[] = [];
  yardMaster: any[] = [];

  crB1CodeMaster: any[] = [];
  crB1CodetableOptions: TableOptions;

  clDealingOfiicersMaster: any[] = [];
  flDetailsMaster: any[] = [];

  constructor(
    public UserLayoutComponent: UserLayoutComponent,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
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
      // "B1_formcode": [null, Validators.compose([])],
      // "costcenter": [null, Validators.compose([Validators.required])],
      "submission_comment": [null, Validators.compose([])],
      "dcode_details": this.formBuilder.array([
        this.initFormRows('dcode_details'),
      ]),
      "attachment_code": this.formBuilder.array([
        // this.initFormRows('attachment_code'),
      ]),
    });

    this.registerForm.get('po_number')?.valueChanges
      .subscribe(val => {
        switch (this.formDetails?.form_slug) {
          case 'FormB1':
            this.assignValueToDemog('vd_vendor_code', val?.vendor_code ?? null)
            this.assignValueToDemog('vd_company_name', val?.vendor_name ?? null)
            this.assignValueToDemog('vd_po', val?.po_number ?? null)
            break;
        }
      });

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
    };

    this.flDetailsMaster = [];
  }

  async ngOnInit() {
    setTimeout(async () => {
      await this.init(this.activatedRoute.snapshot.url[1]?.path);
      await this.getPoMaster(this.activatedRoute.snapshot.url[1]?.path);
      await this.getUnitMaster();
      await this.getYardMaster();
      await this.getDocDetailsMaster();

      this.UserLayoutComponent.loadPageTitle("CR Form Registration", "", [
        { 'url': '/user/cr-forms/list', 'name': "CR Forms" },
        { 'url': 'active', 'name': this.formDetails?.form_shortcode + ' : ' + this.formDetails?.form_name + ' | Register' },
      ])

      this.registerForm.patchValue({
        'department': null,
        'po_number': null,
      })
    })

    Global.resetForm(this.registerForm, false)
  }

  init(crfromslug: any) {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      // switch (crfromslug) {
      //   case 'FormB2':
      //     $('[formControlName="department"]').addClass('disabled')
      //     $('[formControlName="yard_no"]').addClass('disabled')
      //     $('[formControlName="unit"]').addClass('disabled')
      //     $('[formControlName="po_number"]').addClass('disabled')
      //     break;
      // }

      this.userService.initCrForm({
        'slug': crfromslug
      }).subscribe(res => {
        this.spinner.hide();

        this.formGroups = res?.formGroup ?? [];
        this.formDetails = res?.formDetails ?? null;

        this.resetAllFormRows({ 'is_editing': true })
        this.formGroups.forEach((group: any) => {
          group?.demog_masters.forEach((dm: any) => {
            if (dm?.code) {
              let data: any = {
                'dm_code': dm?.code,
                'dm_value': null,
                'dm_label': dm?.name ?? dm?.code,
                'dm_required': dm?.is_required == true ? true : false,
              };

              if (!dm.lov_values) {
                dm.lov_values = [];
              } else {
                dm.lov_values = dm.lov_values.split(',');
              }

              this.addFormRows('dcode_details', data);
            }
          });
        });

        res.Dept_master.forEach((element: any) => {
          this.departmentMaster.push({
            'id': element.id,
            'costcntr': element.costcntr,
            'description': element.shop_name + " (" + element.costcntr + ")",
          })
        });

        // res.po_master.forEach((element: any) => {
        //   this.poMaster.push({
        //     'id': element.id,
        //     'po_title': element.po_title,
        //     'po_number': element.po_number,
        //     'supplier_code': element.supplier_code,
        //     'description': element.po_number + (element.po_title ? ' (' + element.po_title + ')' : ""),
        //   })
        // });


        switch (crfromslug) {
          case 'FormB2':
            $('[formControlName="department"]').addClass('disabled')
            $('[formControlName="yard_no"]').addClass('disabled')
            $('[formControlName="unit"]').addClass('disabled')
            $('[formControlName="po_number"]').addClass('disabled')

            setTimeout(() => {
              $('.field-' + 'cl_clms_id').find('[formcontrolname="dm_value"').attr('readonly', 'true');
              $('.field-' + 'cl_age').find('[formcontrolname="dm_value"').attr('readonly', 'true');
            }, 1000);
            break;
        }

        resolve(true);
      }, (err) => {
        this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  getPoMaster(crfromslug: any, searchKey: string = "", loading: boolean = true) {
    return new Promise((resolve, reject) => {
      if (loading == true) this.spinner.show();

      this.userService.fetchPoMasterForCrForm({
        'slug': crfromslug,
        'searchKey': searchKey.toString(),
      }).subscribe(res => {
        if (loading == true) this.spinner.hide();

        this.poMaster = [];
        (res.result ?? []).forEach((element: any) => {
          element.description = element.po_number + (element.po_title ? ' (' + element.po_title + ')' : "")
          this.poMaster.push(element);
        });

        resolve(true);
      }, (err) => {
        if (loading == true) this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  getUnitMaster() {
    return new Promise((resolve, reject) => {
      this.spinner.show();

      this.userService.fetchUnitMasterForCrForm({}).subscribe(res => {
        this.spinner.hide();

        this.unitMaster = [];
        res.subarea.forEach((element: any) => {
          if (element.status == 'active') {
            this.unitMaster.push({
              'code': element.code,
              'name': element.name,
              'description': element.code + (element.name ? ' (' + element.name + ')' : '')
            })
          }
        });

        resolve(true);
      }, (err) => {
        this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  getYardMaster() {
    const $this = this;
    return new Promise(function (resolve, reject) {
      $this.spinner.show();

      $this.userService.fetchYardMasterForCrForm({}).subscribe(res => {
        $this.spinner.hide();
        $this.yardMaster = [];
        $this.yardMaster = res?.YardList?.lov_values?.split(',') ?? [];

        resolve(true);
      }, (err) => {
        $this.spinner.hide();
        $this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
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

  submitForm(event: any) {
    this.registerForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.registerForm.valid) {
      let document: any = {
        'form_id': this.formDetails?.id,
        'form_status': "initiated",
        'status': "complete",
        'department': this.registerForm.value?.department?.id ?? "",
        'yard_no': this.registerForm.value?.yard_no ?? "",
        'unit': this.registerForm.value?.unit?.code ?? "",
        'po_number': this.registerForm.value?.po_number?.po_number ?? "",
        'costcenter': this.registerForm.value?.department?.costcntr ?? "",
        'remark': this.registerForm.value?.submission_comment ?? "",
        // 'cr_code': "",
        'dcode_details': [],
        'attachment_code': [],
        'file': [],
        'form_state': "new", // This is for first time
      };

      const dcode_details = this.registerForm?.value?.dcode_details ?? [];
      if (dcode_details.length == 0) {
        this.toastr.error("No demog master found for update");
        return;
      }

      for (const key in dcode_details) {
        if (Object.prototype.hasOwnProperty.call(dcode_details, key)) {
          const element = dcode_details[key];
          // console.log(!element?.dm_value)
          // console.log(element?.dm_value)
          // console.log(element?.dm_code)
          // console.log('============================')
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

      switch (this.formDetails.form_slug) {
        case 'FormB1':
          // document.dcode_details.push({
          //   'dcode': 'vd_po',
          //   'd_value': this.registerForm.value?.po_number?.po_number ?? null,
          // })
          break;
      }

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

      // console.log(document);
      // return;

      document.dcode_details = JSON.stringify(JSON.stringify(document.dcode_details));
      document.attachment_code = JSON.stringify(JSON.stringify(document.attachment_code));

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
          dm_value: [data?.dm_value ?? null, Validators.compose([])],
          dm_label: [data?.dm_label ?? null, Validators.compose([])],
          dm_required: [data?.dm_required ?? false, Validators.compose([])],
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

  assignValueToFormRow(formGroup: FormGroup, type: any, s_key: any, s_value: any) {
    const index = this.fetchIndexOfControl(formGroup, type, s_key, s_value);
    // console.log(index);
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

  searchCrB1Code(page: any = null, openmodal: any = false, fieldsearch: any = null) {
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
        let totalDocs = res.SearchCount;
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
          document.getElementById('open-searchCrB1Code-modal')?.click();
        }
        resolve(true);
      }, (err) => {
        this.spinner.hide();
        this.toastr.error(Global.showServerErrorMessage(err));
        resolve(true);
      });
    });
  }

  assignValueToDemog(code: any, value: any) {
    const $vdVendorCodeIndex: any = this.fetchIndexOfControl(this.registerForm, 'dcode_details', 'dm_code', code);
    if ($vdVendorCodeIndex !== false) {
      $('.field-' + code).find('[formcontrolname="dm_value"').attr('readonly', 'true');

      const control = <FormArray>this.registerForm.get('dcode_details')
      control.at($vdVendorCodeIndex).patchValue({
        'dm_value': value
      })
    }
  }

  getValueOfDemog(code: any) {
    const $vdVendorCodeIndex: any = this.fetchIndexOfControl(this.registerForm, 'dcode_details', 'dm_code', code);
    if ($vdVendorCodeIndex !== false) {
      const control = <FormArray>this.registerForm.get('dcode_details')
      return control.at($vdVendorCodeIndex).value.dm_value
    }

    return null;
  }

  async useCrB1Code(item: any) {
    $('#searchCrB1Code-modal').find('[data-bs-dismiss="modal"]')?.click();

    // console.log(this.formDetails?.form_slug, item.po_number)
    await this.getPoMaster(this.formDetails?.form_slug, item.po_number);
    let poSelected: any = this.poMaster.find((obj: any) => {
      return obj.po_number == item.po_number ?? null
    }) ?? null

    this.registerForm.patchValue({
      'department': this.departmentMaster.find((obj: any) => {
        return obj.id == item.dept ?? null
      }) ?? null,
      // 'yard_no': this.yardMaster.find((obj: any) => {
      //   return obj.id == item.yard_no ?? null
      // }) ?? null
      'yard_no': item.yard_no,
      'unit': this.unitMaster.find((obj: any) => {
        return obj.code == item.unit ?? null
      }) ?? null,
      'po_number': poSelected,
    })

    this.assignValueToDemog('vd_b1', item?.unique_id ?? null)
    this.assignValueToDemog('cl_vd_code', item?.vd_code ?? null)

    this.assignValueToDemog('cl_dept', this.registerForm.value.department.description ?? null)
    this.assignValueToDemog('cl_yard', item?.yard_no ?? null)
    this.assignValueToDemog('cl_unit', item?.unit ?? null)

    this.assignValueToDemog('cl_po', poSelected?.po_number ?? null)
    this.assignValueToDemog('cl_po_date', poSelected?.po_date ?? null)

    // console.log(this.poMaster);
    // console.log(item);
    // console.log(poSelected);
  }

  calculateDob() {
    const age = Global.ageCalculator(this.getValueOfDemog("cl_dob"));
    this.assignValueToDemog('cl_age', age);
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
}
