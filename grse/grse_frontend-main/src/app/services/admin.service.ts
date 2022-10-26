import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})

export class AdminService {

    constructor(
        private httpService: HttpService,
    ) { }

    /**
     * ------------------------
     * ACCOUNT APIS
     * ------------------------
     */

    updateAccountData(payload: any) {
        return this.httpService.post('admin/update-account', payload);
    }

    updateAccountPassword(payload: any) {
        return this.httpService.post('admin/update-account-password', payload);
    }

    /**
     * ------------------------
     * DEPARTMENT APIS
     * ------------------------
     */

    fetchDepartments(payload: any) {
        if (!payload.page_no) {
            payload.page_no = 'all';
        }

        if (!payload.search) {
            payload.search = '';
        }

        return this.httpService.post('all_departments', payload);

        if (payload.pageno) {
            return this.httpService.get('all_departments/' + payload.pageno);
        }

        return this.httpService.get('all_departments');
    }

    updateDepartmentStatus(payload: any) {
        return this.httpService.post('update_departments_status', payload);
    }

    deleteDepartment(payload: any) {
        return this.httpService.post('delete_department', payload);
    }

    createDepartment(payload: any) {
        return this.httpService.post('create_department', payload);
    }

    updateDepartment(payload: any) {
        return this.httpService.post('update_department', payload);
    }

    /**
     * ------------------------
     * TERMINAL APIS
     * ------------------------
     */

    fetchTerminals(payload: any = {}) {
        if (payload.pageno) {
            return this.httpService.post('all_terminals/' + payload.pageno, payload);
        }

        return this.httpService.get('all_terminals');
    }

    updateTerminal(payload: any) {
        return this.httpService.post('update_terminals', payload);
    }

    createTerminal(payload: any) {
        return this.httpService.post('create_terminals', payload);
    }

    viewTerminalDetails(terminal_id: any) {
        return this.httpService.get('admin/terminal_details/' + terminal_id);
    }

    viewTerminalUsers(terminal_id: any) {
        return this.httpService.get('userDetails/' + terminal_id);
    }

    fetchAlpetaTerminals(payload: any = {}) {
        return this.httpService.get('admin/get_terminals');
    }

    /**
     * ------------------------
     * ATTENDANCE LOG APIS
     * ------------------------
     */

    fetchAttendanceLogs(payload: any) {
        return this.httpService.post('admin/auth-logs/fetch', payload);
    }

    viewAttendanceLogDetails(payload: any) {
        return this.httpService.post('admin/auth-logs/details', payload);
    }

    fetchAuthLogsForExport(payload: any) {
        return this.httpService.get('auth_log/' + payload.date);
    }

    fetchRawAuthLogsForExport(payload: any) {
        return this.httpService.post('search_attendance/' + payload.pageno, payload);
    }

    fetchRawAuthLogDetails(payload: any) {
        return this.httpService.post('auth_image', payload);
    }

    /**
     * ------------------------
     * USER APIS
     * ------------------------
     */

    fetchUsers(payload: any) {
        return this.httpService.post('user/all_users/' + payload.role + '/' + payload.pageno, payload);
    }

    getUserCreateMaster() {
        return this.httpService.get('admin/fetchmaster');
    }

    getUserDetailsfromEmployeeCode(employee_code: any) {
        return this.httpService.get('user/employee_details/' + employee_code);
    }

    scanUserFingerprint(payload: any) {
        // return this.httpService.post('admin/login', payload);
        return this.httpService.post('user/scanFingerPrint', payload);
    }

    scanUserFacedata(payload: any) {
        // return this.httpService.post('admin/login', payload);
        return this.httpService.post('user/scanFaceData', payload);
    }

    scanUserCard(payload: any) {
        // return this.httpService.post('admin/login', payload);
        return this.httpService.post('user/scanCard', payload);
    }

    createUser(payload: any) {
        return this.httpService.postFormData('user/create_user', payload);
    }

    viewUserDetails(user_id: any) {
        return this.httpService.get('user/userDetails/' + user_id);
    }

    changeUserTerminalStatus(payload: any) {
        let endpoint = (payload.status == 'active') ? "revert_blacklist" : "blacklist";
        return this.httpService.post(endpoint, payload);
    }

    fetchClmsRawData(payload: any) {
        return this.httpService.post('clm_list', payload);
        // return this.httpService.get('all_designations');
    }

    fetchClmsRawDataDetails(payload: any) {
        return this.httpService.post('clm_list_detail', payload);
        // return this.httpService.get('all_designations');
    }

    updateUserDashboardPassword(payload: any) {
        return this.httpService.post('admin/update_password', payload);
    }

    /**
     * ------------------------
     * USER TERMINAL APIS
     * ------------------------
     */

    assignUserTerminal(payload: any) {
        return this.httpService.post('autt/assign_user_terminals', payload, 'batchprocessapi');
        // return this.httpService.post('assign_user_terminals', payload);
    }

    removeUserFromTerminal(payload: any) {
        return this.httpService.post('delete_user_terminals', payload);
    }

    updateUser(payload: any) {
        let url = 'user/updateUserDetails'
        if (payload.type == 'card') {
            url = 'user/updateCardNum'
        }

        return this.httpService.post(url, payload);
    }

    updateProfilePic(payload: any) {
        return this.httpService.post('user/updateProfilePic', payload);
    }

    fetchAssignUserToGroupJobs(payload: any) {
        return this.httpService.get('autt/filter_requests/' + payload.status, "batchprocessapi");
    }

    fetchUserTerminalFailedRequest() {
        return this.httpService.get('autt/get_failed_requests', "batchprocessapi");
    }

    /**
     * ------------------------
     * VENDOR APIS
     * ------------------------
     */

    fetchVendors(payload: any) {
        if (payload.page_no) {
            return this.httpService.post('get_vendors', payload);
        } else {
            return this.httpService.post('get_vendors', {
                'page_no': 1,
                'search': "all"
            });
        }
    }

    updateVendorStatus(payload: any) {
        return this.httpService.post('update_vendor_status', payload);
    }

    deleteVendor(payload: any) {
        return this.httpService.post('admin/vendor/delete', payload);
    }

    createVendor(payload: any) {
        return this.httpService.post('admin/vendor/create', payload);
    }

    updateVendor(payload: any) {
        return this.httpService.post('admin/vendor/update', payload);
    }

    fetchVendorDetails(payload: any) {
        return this.httpService.post('get_po_user_by_vendor', payload);
    }

    fetchUsersByB1Form(payload: any) {
        return this.httpService.post('get_user_id_uniqueid', payload);
    }

    /**
     * ------------------------
     * DESIGNATION APIS
     * ------------------------
     */

    fetchDesignations(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('all_designations_page', payload);
        }

        return this.httpService.get('all_designations');
    }

    updateDesignationStatus(payload: any) {
        return this.httpService.post('update_designation_status', payload);
    }

    deleteDesignation(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_designation_status', payload);
        // return this.httpService.post('delete_designation', payload);
    }

    createDesignation(payload: any) {
        return this.httpService.post('create_designation', payload);
    }

    updateDesignation(payload: any) {
        return this.httpService.post('update_designation', payload);
    }

    /**
     * ------------------------
     * SHIFT APIS
     * ------------------------
     */

    fetchShifts(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('all_shifts_page', payload);
        }

        return this.httpService.get('all_shifts');
    }

    updateShiftStatus(payload: any) {
        return this.httpService.post('update_shifts_status', payload);
    }

    deleteShift(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_shifts_status', payload);
        return this.httpService.post('delete_shifts', payload);
    }

    createShift(payload: any) {
        return this.httpService.post('create_shifts', payload);
    }

    updateShift(payload: any) {
        return this.httpService.post('update_shifts', payload);
    }

    /**
     * ------------------------
     * SUBAREA APIS
     * ------------------------
     */

    fetchSubareas(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('all_subarea_page', payload);
        }

        return this.httpService.get('all_subarea');
    }

    updateSubareaStatus(payload: any) {
        return this.httpService.post('update_subarea_status', payload);
    }

    deleteSubarea(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_subarea_status', payload);
        return this.httpService.post('delete_subarea', payload);
    }

    createSubarea(payload: any) {
        return this.httpService.post('create_subarea', payload);
    }

    updateSubarea(payload: any) {
        return this.httpService.post('update_subarea', payload);
    }

    /**
     * ------------------------
     * UNIT APIS
     * ------------------------
     */

    fetchUnits(payload: any) {
        return this.httpService.get('all_units');
    }

    updateUnitStatus(payload: any) {
        return this.httpService.post('update_unit_status', payload);
    }

    deleteUnit(payload: any) {
        return this.httpService.post('delete_unit', payload);
    }

    createUnit(payload: any) {
        return this.httpService.post('create_unit', payload);
    }

    updateUnit(payload: any) {
        return this.httpService.post('update_unit', payload);
    }

    /**
     * ------------------------
     * TERMINAL GROUP APIS
     * ------------------------
     */

    fetchTerminalGroups(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('all_groups_page', payload);
        }

        return this.httpService.get('all_groups');
    }

    updateTerminalGroupStatus(payload: any) {
        return this.httpService.post('update_group_status', payload);
    }

    deleteTerminalGroup(payload: any) {
        // payload.status = 'delete';
        // return this.httpService.post('update_group_status', payload);
        return this.httpService.post('delete_group', payload);
    }

    createTerminalGroup(payload: any) {
        return this.httpService.post('create_group', payload);
    }

    updateTerminalGroup(payload: any) {
        return this.httpService.post('update_group', payload);
    }

    assignTerminalToGroup(payload: any) {
        return this.httpService.post('attg/assignTerminals_toGroup', payload, "batchprocessapi");
        // return this.httpService.post('assignTerminals_toGroup', payload);
    }

    fetchAssignTerminalToGroupJobs(payload: any) {
        return this.httpService.get('attg/filter_requests/' + payload.status, "batchprocessapi");
    }

    fetchGroupTerminalFailedRequest() {
        return this.httpService.get('attg/get_failed_requests', "batchprocessapi");
    }

    removeTerminalFromGroup(payload: any) {
        return this.httpService.post('Group_Terminal_Delete', payload);
    }

    getGroupDetails(payload: any) {
        return this.httpService.get('TerminalDetails/' + payload.group_id);
    }

    /**
     * ------------------------
     * CR Forms
     * ------------------------
     */

    fetchDemogMasters(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('get_demog_page', payload);
        } else {
            return this.httpService.get('get_demog/all');
        }
    }

    createDemogMaster(payload: any) {
        return this.httpService.post('add_demog', payload);
    }

    updateDemogMaster(payload: any) {
        return this.httpService.post('update_demog', payload);
    }

    updateDemogMasterStatus(payload: any) {
        return this.httpService.post('update_demog_status', payload);
    }

    deleteDemogMaster(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_demog_status', payload);
    }

    fetchDemogGroups(payload: any) {
        if (payload.pageno) {
            return this.httpService.post('get_crgroup_page', payload);
        } else {
            return this.httpService.get('get_crgroup/all');
        }
    }

    createDemogGroup(payload: any) {
        return this.httpService.post('add_crgroup', payload);
    }

    updateDemogGroup(payload: any) {
        return this.httpService.post('update_crgroup', payload);
    }

    updateDemogGroupStatus(payload: any) {
        return this.httpService.post('update_crgroup_status', payload);
    }

    deleteDemogGroup(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_crgroup_status', payload);
    }

    fetchDemogGroupDetails(payload: any) {
        return this.httpService.post('get_cr_demog_details', payload);
    }

    assignDemogToGroup(payload: any) {
        return this.httpService.post('add_cr_demog_group', payload);
    }

    fetchCrForms(payload: any) {
        if (payload.pageno) {
            return this.httpService.get('get_cr_form/' + payload.pageno);
        } else {
            return this.httpService.get('get_cr_form/all');
        }
    }

    fetchSubmittedCrForms(payload: any = {}) {
        return this.httpService.post('admin/CRForminit', payload);
    }

    fetchCrFormDetailsBySlug(payload: any) {
        return this.httpService.get('get_cr_form_by_slug/' + payload.slug);
    }

    assignCrGroupToForm(payload: any) {
        return this.httpService.post('cr_form_group', payload);
    }

    submitCrForm(payload: any) {
        return this.httpService.postFormData('cr_form_initiate', payload);
    }

    getCrFormSystemDocsByUniqueId(payload: any) {
        return this.httpService.post('find_attachment_from_unique_id', payload);
    }

    getCrFormMISRecords(payload: any) {
        return this.httpService.post('find_attachment_with_page', payload);
    }

    initCrFormOnboard(payload: any) {
        return this.httpService.post('get_dvalue_by_dcode', payload);
    }

    fetchSubmittedFormDetails(payload: any) {
        return this.httpService.post('view_cr_form', payload);
    }

    /**
     * ------------------------
     * Purchase Orders APIs
     * ------------------------
     */

    fetchPurchaseOrders(payload: any) {
        if (!payload.page_no) {
            payload.page_no = 'all';
        }

        if (!payload.search) {
            payload.search = '';
        }

        return this.httpService.post('get_po_master', payload);

        // if (payload.pageno) {
        //   return this.httpService.get('get_po_master/' + payload.pageno);
        // } else {
        //   return this.httpService.get('get_po_master/all');
        // }
    }

    createPurchaseOrder(payload: any) {
        return this.httpService.post('add_po_master', payload);
    }

    updatePurchaseOrder(payload: any) {
        return this.httpService.post('update_po_master', payload);
    }

    updatePurchaseOrderStatus(payload: any) {
        return this.httpService.post('update_po_master_status', payload);
    }

    deletePurchaseOrder(payload: any) {
        payload.status = 'delete';
        return this.httpService.post('update_po_master_status', payload);
    }

    searchPurchaseOrderNumberMaster(payload: any) {
        return this.httpService.post('get_po', payload);
    }

    /**
     * ------------------------
     * Batch Process APIs
     * ------------------------
     */
    fetchTerminalAssignedDeleteFailedJobs(payload: any = {}) {
        return this.httpService.get('autt/get_failed_requests', "batchprocessapi");
        // return this.httpService.get('attg/get_failed_requests', "batchprocessapi");
    }

    fetchTerminalAssignedFailedJobs(payload: any) {
        return this.httpService.get('autt/assigned_failed/' + payload?.pageno ?? 1, "batchprocessapi");
    }

    fetchTerminalDeleteFailedJobs(payload: any) {
        return this.httpService.get('autt/delete_failed/' + payload?.pageno ?? 1, "batchprocessapi");
    }

    fetchBlacklistJobs(payload: any = {}) {
        return this.httpService.post('blacklist_view', payload);
    }

    initBatchCronJobs(endpoint: string, baseurl: string) {
        switch (baseurl) {
            case 'main':
                return this.httpService.post(endpoint, {}, baseurl);

            default:
                return this.httpService.get(endpoint, baseurl);
        }
    }
}
