import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpService: HttpService,
    private router: Router
  ) { }

  /**
   * ====================================================
   * Admin Authentication Methods
   *
   * Token Name - grse-admin-token
   * User Details - grse-admin-user
   * ====================================================
   * */

  adminLogin(payload: any) {
    return this.httpService.post('admin/login', payload);
  }

  adminLogout() {
    localStorage.removeItem('grse-admin-token');
    localStorage.removeItem('grse-admin-user');
    this.router.navigate(['/auth/admin/login'])
  }

  adminLoggedIn() {
    return !!localStorage.getItem('grse-admin-token')
  }

  getAdminToken() {
    return localStorage.getItem('grse-admin-token')
  }

  getAdminAccountDetails() {
    return this.httpService.post('admin/get-account', {});
  }

  /**
   * =====================================================
   * End of Admin Authentication Methods
   * =====================================================
   * */

  /**
   * ====================================================
   * User Authentication Methods
   *
   * Token Name - grse-user-token
   * User Details - grse-user-user
   * ====================================================
   * */

  // userLogin(payload: any) {
  //   return this.httpService.post('user/login', payload);
  // }
  userLogin(payload: any) {

    console.log("here in service to make the api call")

    let response =  this.httpService.post('user/login', payload);
    console.log("response is ", response);

    return response
  }

  userLogout() {
    localStorage.removeItem('grse-user-token');
    localStorage.removeItem('grse-user-user');
    this.router.navigate(['/auth/user/login'])
  }

  userLoggedIn() {
    return !!localStorage.getItem('grse-user-token')
  }

  getUserToken() {
    return localStorage.getItem('grse-user-token')
  }

  getUserAccountDetails() {
    return this.httpService.post('user/useruserDetails', {});
  }

  /**
   * =====================================================
   * End of User Authentication Methods
   * =====================================================
   * */

  getToken() {
    if (this.getAdminToken()) {
      return localStorage.getItem('grse-admin-token')
    } else if (this.getUserToken()) {
      return localStorage.getItem('grse-user-token')
    } else {
      return null;
    }
  }
}
