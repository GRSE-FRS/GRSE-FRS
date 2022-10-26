import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    userData:any;

    constructor(
        private httpService: HttpService,
    ) { }

    setUserData(data: any){
        this.userData = data;
        console.log("user data set in service.")
    }

    getUserData(){
        console.log("Data retrieved from service");
        return this.userData;
    }

    fetchCrFormTypes(payload: any = {}) {
        return this.httpService.post('cr_form_initial_access', payload);
    }

    fetchSubmittedCrForms(payload: any = {}) {
        return this.httpService.post('cr_form_submitted', payload);
    }

    fetchAccessibleCrForms(payload: any = {}) {
        return this.httpService.post('cr_form_user_initialize', payload);
    }

    fetchCrFormBucket(payload: any) {
        return this.httpService.post('release_user_cr_form', payload);
    }

    initCrForm(payload: any) {
        return this.httpService.post('form_initialize', payload);
    }

    submitCrForm(payload: any) {
        return this.httpService.postFormData('cr_form_initiate', payload);
    }

    getCrFormSystemDocsByUniqueId(payload: any) {
        return this.httpService.post('find_attachment_from_unique_id', payload);
    }

    fetchSubmittedFormDetails(payload: any) {
        return this.httpService.post('view_cr_form', payload);
    }

    fetchPoMasterForCrForm(payload: any) {
        return this.httpService.post('get_po_form', payload);
    }

    fetchOnboardedVendors(payload: any) {
        return this.httpService.post('get_onboard_vendor', payload);
    }

    fetchUnitMasterForCrForm(payload: any) {
        return this.httpService.get('all_subarea');
    }

    fetchYardMasterForCrForm(payload: any) {
        return this.httpService.get('get_yard');
    }

    updateAccountPassword(payload: any) {
        return this.httpService.post('user/update_password', payload);
    }

    fetchUserAttendance(payload: any) {
        return this.httpService.post('user/search_attendance', payload);
    }

    fetchUserAttendanceDetails(payload: any) {
        return this.httpService.post('auth_image', payload);
    }

    fetchUsers(payload: any) {
        return this.httpService.post('user/all_users/' + payload.role + '/' + payload.pageno, payload);
    }

    fetchDmDetails(payload: any) {
        return this.httpService.post('get_demog_by_code', payload);
    }

    getCostcenterInitiationPermission(payload: any) {
        return this.httpService.post('user_verify_by_costctnr', payload);
    }

    fetchUserDetailById(payload: any){
        return this.httpService.get('user/employee_details/' + payload.employeeId);
    }

    fetchUserId(){
        return this.httpService.get('user/employee_id_details/');
    }
}
