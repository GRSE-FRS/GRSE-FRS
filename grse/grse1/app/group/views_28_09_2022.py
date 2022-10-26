import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime

Group_View = Blueprint('Group_View', __name__)


class fn_View_Groups(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllGroups.yaml', methods=['GET'])
    def get(self):
        try:
            data = GroupMaster()
            respone = {"status": 'success', "message": "Success", "group": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_View_Groups_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllGroupsPaginate.yaml', methods=['GET'])
    def get(self, page):
        try:
            data = GroupMaster()
            respone = {"status": 'success', "message": "Success","count":len(data), "group": Paginate(data, page)}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Create_Groups(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateGroup.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            query = Group.query.filter_by(name=request_data["name"]).first()
            if query is None:
                data = Group.Add_Group(request_data['name'],
                                       request_data['description'],
                                       request_data['status'])
                respone = {"status": 'success', "message": "Group created successfully", "group": data}
                return make_response(jsonify(respone)), 200
            else:
                respone = {"status": 'error', "message": "Group name already exists"}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Update_Group(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateGroup.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Group.Update_Group(request_data['id'],
                                      request_data['name'],
                                      request_data['description'])
            respone = {"status": 'success',
                       "message": "Group updated successfully",
                       "group": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Update_Group_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GroupStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            use_detais = Users.FetchUSerDetails_By_group_id(request_data['id'])
            if len(use_detais) > 0:
                employee_id = []
                for i in use_detais:
                    employee_id.append(i['id'])
                respone = {"status": 'error',
                           "message": f"This Group already assigned to {len(employee_id)} number of Employees/Vendor Employees. Please assign them in different group before performing the delete action.",
                           "employee_id": employee_id}
                return make_response(jsonify(respone)), 200
            else:
                data = Group.Change_Status(request_data['id'], request_data['status'])
                respone = {"status": 'success', "message": "Group Status updated successfully", "group": data}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Delete_Group(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteGroup.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            # check :
            use_detais = Users.FetchUSerDetails_By_group_id(request_data['id'])

            if len(use_detais) > 0:
                employee_id = []
                for i in use_detais:
                    employee_id.append(i['employee_id'])
                respone = {"status": 'error',
                           "message": f"This Group already assigned to {len(employee_id)} number of Employees/Vendor Employees. Please assign them in different group before performing the delete action.",
                           "employee_id": employee_id}
                return make_response(jsonify(respone)), 200

            else:
                Group_terminals.DeleteBYgroup_id(request_data['id'])
                data = Group.Delete(request_data['id'])
                respone = {"status": 'success', "message": "Group Deleted successfully", "group": data}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


# # # Creating View Function/Resources
fn_View_Groups = fn_View_Groups.as_view("fn_View_Groups")
fn_View_Groups_Paginate = fn_View_Groups_Paginate.as_view("fn_View_Groups_Paginate")
fn_Create_Groups = fn_Create_Groups.as_view("fn_Create_Groups")
fn_Update_Group = fn_Update_Group.as_view("fn_Update_Group")
fn_Update_Group_Status = fn_Update_Group_Status.as_view("fn_Update_Group_Status")
fn_Delete_Group = fn_Delete_Group.as_view("fn_Delete_Group")

# # # adding routes to the Views we just created
Group_View.add_url_rule('/all_groups', view_func=fn_View_Groups, methods=['GET'])
Group_View.add_url_rule('/all_groups/<page>', view_func=fn_View_Groups_Paginate, methods=['GET'])
Group_View.add_url_rule('/create_group', view_func=fn_Create_Groups, methods=['POST'])
Group_View.add_url_rule('/update_group', view_func=fn_Update_Group, methods=['POST'])
Group_View.add_url_rule('/update_group_status', view_func=fn_Update_Group_Status, methods=['POST'])
Group_View.add_url_rule('/delete_group', view_func=fn_Delete_Group, methods=['POST'])
