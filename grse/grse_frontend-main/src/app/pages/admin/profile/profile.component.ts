import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { AdminLayoutComponent } from '../../layouts/admin/admin.component';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class AdminProfileComponent implements OnInit {
  userdetails: any;
  basicDetailsForm: FormGroup;
  passwordUpdateForm: FormGroup;

  constructor(
    public AdminLayoutComponent: AdminLayoutComponent,
    private adminService: AdminService,
    private authService: AuthService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.basicDetailsForm = formBuilder.group({
      "first_name": [null, Validators.compose([Validators.required])],
      "last_name": [null, Validators.compose([Validators.required])],
      "phone_number": [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)])],
      "email": [{ value: null, disabled: true }],
    });

    this.passwordUpdateForm = formBuilder.group({
      "current_password": [null, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
      "new_password": [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8), Validators.maxLength(20)])],
      "new_password_confirmation": [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8), Validators.maxLength(20)])],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.AdminLayoutComponent.loadPageTitle("Account Settings", "", "Profile")
    })

    this.userdetails = null;
    this.getAccountDetails();
  }

  getAccountDetails() {
    this.spinner.show();
    this.authService.getAdminAccountDetails().subscribe(res => {
      this.spinner.hide();
      if (res.status == 'success') {
        this.userdetails = res.user_data;
        this.basicDetailsForm.patchValue({
          first_name: this.userdetails.first_name,
          last_name: this.userdetails.last_name,
          email: this.userdetails.email,
          phone_number: this.userdetails.phone,
        })
      } else if (res.status == 'val_error') {
        this.toastr.error(Global.showValidationMessage(res.errors));
      } else {
        this.toastr.error(res.message);
      }
    }, (err) => {
      this.spinner.hide();
      this.toastr.error(Global.showServerErrorMessage(err));
    });
  }

  updateBasicDetails(event: any) {
    this.basicDetailsForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.basicDetailsForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateAccountData({
        'first_name': this.basicDetailsForm.value.first_name,
        'last_name': this.basicDetailsForm.value.last_name,
        'phone_number': this.basicDetailsForm.value.phone_number,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.getAccountDetails();
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

  updateAccountPassword(event: any) {
    this.passwordUpdateForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.passwordUpdateForm.valid) {
      event.target.classList.add('btn-loading');

      this.adminService.updateAccountPassword({
        'current_password': this.passwordUpdateForm.value.current_password,
        'new_password': this.passwordUpdateForm.value.new_password,
        'new_password_confirmation': this.passwordUpdateForm.value.new_password_confirmation,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          this.passwordUpdateForm.reset();
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

}
