import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/services/admin.service';
import * as Global from 'src/app/globals';
import TableOptions from 'src/app/models/TableOptions';
import swal from 'sweetalert2';
import { AdminLayoutComponent } from 'src/app/pages/layouts/admin/admin.component';

@Component({
    selector: 'app-admin-terminal-groups',
    templateUrl: './terminal-groups.component.html',
    styleUrls: ['./terminal-groups.component.css']
})

export class AdminTerminalGroupsComponent implements OnInit {
    terminalGroups: any[] = [];
    tableOptions: TableOptions;
    terminalGroupForm: FormGroup;
    editActionId: String;
    employee_id: any = [];
    constructor(
        public AdminLayoutComponent: AdminLayoutComponent,
        private adminService: AdminService,
        public formBuilder: FormBuilder,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
    ) {
        this.tableOptions = {
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

        this.terminalGroupForm = formBuilder.group({
            "name": [null, Validators.compose([Validators.required])],
            "description": [null, Validators.compose([])],
        });

        this.editActionId = '';
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.AdminLayoutComponent.loadPageTitle("Manage Terminal Groups", "", "Terminal Groups")
        })

        this.fetch()
    }

    fetch(page: any = null) {
        $('#terminalGroup-view-section').find('.table-processing').show()

        if (page != null) {
            this.tableOptions.page = page;
        }

        let searchKeyword: any = ($('#terminalGroup-view-section').find('#table-search').val() ?? "")

        this.adminService.fetchTerminalGroups({
            "pageno": this.tableOptions.page,
            "search": searchKeyword?.trim(),
        }).subscribe(res => {
            if (res.status == 'success') {
                this.terminalGroups = res.group;

                /** CALCULATING THE PAGINATION NUMBERS */
                let totalDocs = res.count;
                let totalPages = Math.ceil(totalDocs / Global.TableLength);
                this.tableOptions = {
                    page: this.tableOptions.page,
                    limit: Global.TableLength,
                    pagingCounter: (this.tableOptions.page - 1) * Global.TableLength,
                    totalDocs: totalDocs,
                    totalPages: totalPages,
                    hasNextPage: (this.tableOptions.page < totalPages),
                    hasPrevPage: (this.tableOptions.page > 1),
                    nextPage: (this.tableOptions.page + 1 < totalPages) ? this.tableOptions.page + 1 : null,
                    prevPage: (this.tableOptions.page > 1) ? this.tableOptions.page - 1 : null
                }
                /** CALCULATING THE PAGINATION NUMBERS */
            } else if (res.status == 'val_error') {
                this.terminalGroups = [];
                this.toastr.error(Global.showValidationMessage(res.errors));
            } else {
                this.terminalGroups = [];
                this.toastr.error(res.message);
            }

            $('#terminalGroup-view-section').find('.table-processing').hide()
        }, (err) => {
            this.terminalGroups = [];
            this.toastr.error(Global.showServerErrorMessage(err));
            $('#terminalGroup-view-section').find('.table-processing').hide()
        });
    }

    cancelSubmit() {
        this.editActionId = '';
        this.terminalGroupForm.reset();
        Global.scrollToQuery('#terminalGroup-view-section')
    }

    add(event: any) {
        this.terminalGroupForm.markAllAsTouched();
        setTimeout(function () {
            Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
        }, 100);

        if (this.terminalGroupForm.valid) {
            event.target.classList.add('btn-loading');

            this.adminService.createTerminalGroup({
                'name': this.terminalGroupForm.value.name,
                'description': this.terminalGroupForm.value.description,
                'status': 'active',
            }).subscribe(res => {
                if (res.status == 'success') {
                    this.toastr.success(res.message);
                    this.fetch(this.tableOptions.page)
                    this.cancelSubmit();
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

    edit(event: any) {
        this.terminalGroupForm.markAllAsTouched();

        setTimeout(function () {
            Global.scrollToQuery(".form-control.is-invalid.ng-invalid")
        }, 100);

        if (this.terminalGroupForm.valid) {
            event.target.classList.add('btn-loading');

            this.adminService.updateTerminalGroup({
                'name': this.terminalGroupForm.value.name,
                'description': this.terminalGroupForm.value.description,
                'status': 'active',
                'id': this.editActionId,
            }).subscribe(res => {
                if (res.status == 'success') {
                    this.toastr.success(res.message);
                    this.fetch(this.tableOptions.page)
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

    changeStatus(item: any) {
        this.adminService.updateTerminalGroupStatus({
            'id': item.id,
            'status': (item.status == "active") ? 'inactive' : 'active',
        }).subscribe(res => {
            this.fetch(this.tableOptions.page)
            if (res.status == 'success') {
                this.toastr.success(res.message);
            } else if (res.status == 'val_error') {
                this.toastr.error(Global.showValidationMessage(res.errors));
            } else {
                this.toastr.error(res.message);
            }
        }, (err) => {
            this.fetch(this.tableOptions.page)
            this.toastr.error(Global.showServerErrorMessage(err));
        });
    }

    deleteItem(item: any) {
        swal.fire({
            title: 'Are you sure want to remove?',
            text: 'You will not be able to recover this data!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.value) {
                this.adminService.deleteTerminalGroup({
                    'id': item.id,
                }).subscribe(res => {
                    if (res.status == 'success') {
                        this.toastr.success(res.message);
                        // this.toastr.success("Designation deleted successfully");
                        this.fetch(this.tableOptions.page)
                    } else {
                        this.employee_id = res.employee_id;

                        this.toastr.error(res.message);
                        $("#open-employee-modal").click();
                    }
                }, (err) => {
                    this.toastr.error(Global.showServerErrorMessage(err));
                });
            } else if (result.dismiss === swal.DismissReason.cancel) {
                swal.fire(
                    'Cancelled',
                    'Your data is safe :)',
                    'error'
                )
            }
        })
    }

    getEdit(item: any) {
        Global.scrollToQuery('#terminalGroup-submit-section')
        this.editActionId = item.id;

        this.terminalGroupForm.patchValue({
            name: item.name,
            description: item.description,
        });
    }
}
