import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService implements Resolve<any>{


  constructor(private _userservice: UserService, private _router :ActivatedRoute) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("resolver", this._userservice.getUserData());
    return this._userservice.fetchUserDetailById({ 'employeeId': this._userservice.getUserData()});
  }
}