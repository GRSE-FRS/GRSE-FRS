import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { UserLayoutComponent } from '../../layouts/user/user.component';
import * as Global from 'src/app/globals';

@Component({
  selector: 'app-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class UserProfileComponent implements OnInit {
  passwordUpdateForm: FormGroup;
  Global = Global;

  constructor(
    public UserLayoutComponent: UserLayoutComponent,
    private userService: UserService,
    public formBuilder: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {
    this.passwordUpdateForm = formBuilder.group({
      // "current_password": [null, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(20)])],
      "new_password": [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8), Validators.maxLength(20)])],
      "new_password_confirmation": [null, Validators.compose([Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(8), Validators.maxLength(20)])],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.UserLayoutComponent.loadPageTitle("Account Settings", "", "Edit Profile")
    });
  }

  updateAccountPassword(event: any) {
    this.passwordUpdateForm.markAllAsTouched();
    setTimeout(function () {
      Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
    }, 100);

    if (this.passwordUpdateForm.valid) {
      if(this.passwordUpdateForm.value.new_password != this.passwordUpdateForm.value.new_password_confirmation){
        this.toastr.error("The password confirmation doesn't matched");
        return;
      }

      event.target.classList.add('btn-loading');
      this.userService.updateAccountPassword({
        'password': this.passwordUpdateForm.value.new_password,
      }).subscribe(res => {
        if (res.status == 'success') {
          this.toastr.success(res.message);
          Global.resetForm(this.passwordUpdateForm);
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
