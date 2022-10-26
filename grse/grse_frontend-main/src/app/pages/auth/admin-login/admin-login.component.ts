import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.loginForm = formBuilder.group({
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
    });
  }

  ngOnInit(): void {
  }

  login(event: any) {
    this.loginForm.markAllAsTouched();
    setTimeout(function () {
      let $_errFormControl = document.querySelectorAll(".form-control.is-invalid.ng-invalid");
      if ($_errFormControl.length > 0) {
        const firstErr: Element = $_errFormControl[0];
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    if (this.loginForm.valid) {
      event.target.classList.add('btn-loading');

      this.authService.adminLogin({
        'email': this.loginForm.value.email,
        'password': this.loginForm.value.password,
      }).subscribe(res => {
        if (res.status == 'success') {
          if (res.admin_details) {
            this.toastr.success(res.message);
            localStorage.setItem('grse-admin-token', res.token);
            localStorage.setItem('grse-admin-user', JSON.stringify(res.admin_details));
            this.router.navigate(['/admin']);
          } else {
            this.toastr.error("Unquthorized Access");
          }
        } else if (res.status == 'val_error') {
          this.toastr.error(Global.showValidationMessage(res.errors));
        } else {
          this.toastr.error(res.Message);
        }

        event.target.classList.remove('btn-loading');
      }, (err) => {
        event.target.classList.remove('btn-loading');
        this.toastr.error(Global.showServerErrorMessage(err));
      });
    }
  }

  fakeLogin(event: any) {
    this.loginForm.markAllAsTouched();
    setTimeout(function () {
      let $_errFormControl = document.querySelectorAll(".form-control.is-invalid.ng-invalid");
      if ($_errFormControl.length > 0) {
        const firstErr: Element = $_errFormControl[0];
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    if (this.loginForm.valid) {
      event.target.classList.add('btn-loading');

      const _this = this;
      setTimeout(function () {
        if (_this.loginForm.value.email != "admin.ivan@yopmail.com" || _this.loginForm.value.password != "12345678") {
          _this.toastr.error("Try checking Your Credentials and Try again");
          event.target.classList.remove('btn-loading');

          return;
        }

        _this.toastr.success("Logged In Successfully");
        localStorage.setItem('grse-admin-token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2MzgwODQ3NDAsImVtYWlsIjoiYWRtaW4uaXZhbkB5b3BtYWlsLmNvbSJ9.euEqHeuH9FZHOn5uNSer4SJrmZ-yqHuRl3AWLwCVA5k');
        localStorage.setItem('grse-admin-user', JSON.stringify({ "address": null, "alpeta_password": null, "alpeta_user_id": null, "created_at": "2021-11-26T10:19:48.933544-05:00", "department_id": null, "designation_id": null, "dob": null, "email": "admin.ivan@yopmail.com", "employee_id": null, "employment_end_date": null, "employment_start_date": null, "esi_no": null, "first_name": "GRSE", "gender": null, "id": 1, "is_deleted": 0, "last_name": "ADMIN", "last_update_date": null, "last_updated_by": null, "marital_status": null, "middle_name": null, "nationality": null, "password": "$2a$10$zl5zyYOtSDLeyNa5J/mPwevmvlCuCXpeY6JbS96Gqss1/3Uy4vmje", "pf_no": null, "phone": "9876543210", "profile_picture": null, "role_id": 1, "shift_id": null, "status": "active", "updated_at": null, "vendor_id": null }));
        _this.router.navigate(['/admin']);

        event.target.classList.remove('btn-loading');
      }, 1500);
    }
  }
}
