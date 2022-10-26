import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import * as Global from 'src/app/globals';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-print-pdf-dialog',
  templateUrl: './print-pdf-dialog.component.html',
  styleUrls: ['./print-pdf-dialog.component.css']
})
export class PrintPdfDialogComponent implements OnInit {


  userData: any;
  status: boolean = false;

  constructor(private userservice: UserService, private toastr: ToastrService, private _route: ActivatedRoute, private _router: Router
    ) { 
        this.userData = this._route.snapshot.data['employeeDetails'];

        if (this.userData.status == 'success') {
          
          if(JSON.stringify(this.userData.user_data.user_data) == JSON.stringify({})){
            toastr.error("Invalid ID! No user of this ID found.")
            
            setTimeout(() => {
              _router.navigateByUrl('user/dashboard');
            }, 100);
          }
        }
    }

  ngOnInit(): void {
    
  }
}