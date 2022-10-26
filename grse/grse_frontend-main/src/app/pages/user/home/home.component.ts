import { Component, OnInit } from '@angular/core';
import { UserLayoutComponent } from '../../layouts/user/user.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
// import * as Global from 'src/app/globals';

@Component({
  selector: 'app-user-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class UserHomeComponent implements OnInit {

  formValue !: FormGroup;
  response !: any;
  status !: boolean;

  constructor(
    private toastr: ToastrService,
    public UserLayoutComponent: UserLayoutComponent,
    public formbuilder: FormBuilder,
    public userservice: UserService,
    private router: Router
  ) {
    let userdetails = JSON.parse(localStorage.getItem('grse-user-user') ?? JSON.stringify(null));

    console.log('userdetails : ', userdetails?.employee_id);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.UserLayoutComponent.loadPageTitle("User Dashboard", "", "Dashboard")
    });

    this.formValue = this.formbuilder.group({
      employeeId: [""],

    })

  }

  goToDetailsPage() {
    if (this.formValue.value.employeeId == '') {
      this.toastr.error("Please enter the ID");
    }
    else {
      var baseUrl: string = 'user/details/';
      console.log(this.formValue.value.employeeId);
      this.userservice.setUserData(this.formValue.value.employeeId);
      
      this.router.navigateByUrl(baseUrl + this.formValue.value.employeeId);
    }
  }

  emptyModal(){
    this.formValue.reset();
  }


}

