import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required

Designations_View = Blueprint('Designations_View', __name__)

class fn_View_AllDesignations(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllDesignations.yaml', methods=['GET'])
    def get(self):
        try:
            data = DesignationMaster()
            respone = { "status": 'success', "message": "Success", "designation": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_View_AllDesignations_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllDesignationsPaginate.yaml', methods=['GET'])
    def get(self,page):
        try:
            data = DesignationMaster()
            respone = { "status": 'success', "message": "Success", "count":len(data),"designation": Paginate(data, page)}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Create_Designation(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateDesignations.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            query_data = Designations.query.filter_by(code=request_data["code"]).first()
            if query_data is None:
                data = Designations.Add_Designations(request_data['name'],
                                                     request_data['code'],
                                                     request_data['status'])
                respone = {"status": 'success', "message": "Designation created successfully", "designation": data}
                return make_response(jsonify(respone)),200
            else:
                respone = {"status": 'error', "message": "Designation code already exists"}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Designation(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateDesignations.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Designations.Update_Designation(request_data['id'],request_data['code'],
                                     request_data['name'])
            respone = {"status": 'success', "message": "Designation updated successfully", "designation": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Designation_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DesignationStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Designations.Change_Status(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "Designation Status updated successfully", "designation": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_Designation(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteDesignation.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Designations.Delete(request_data['id'])
            respone = {"status": 'success', "message": "Designation Deleted successfully", "designation": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


# # # Creating View Function/Resources
fn_View_AllDesignations_Paginate = fn_View_AllDesignations_Paginate.as_view("fn_View_AllDesignations_Paginate")
fn_View_AllDesignations = fn_View_AllDesignations.as_view("fn_View_AllDesignations")
fn_Create_Designation = fn_Create_Designation.as_view("fn_Create_Designation")
fn_Update_Designation = fn_Update_Designation.as_view("fn_Update_Designation")
fn_Update_Designation_Status = fn_Update_Designation_Status.as_view("fn_Update_Designation_Status")
fn_Delete_Designation = fn_Delete_Designation.as_view("fn_Delete_Designation")


# # # adding routes to the Views we just created
Designations_View.add_url_rule('/all_designations', view_func=fn_View_AllDesignations, methods=['GET'])
Designations_View.add_url_rule('/all_designations/<page>', view_func=fn_View_AllDesignations_Paginate, methods=['GET'])
Designations_View.add_url_rule('/create_designation', view_func=fn_Create_Designation, methods=['POST'])
Designations_View.add_url_rule('/update_designation', view_func=fn_Update_Designation, methods=['POST'])
Designations_View.add_url_rule('/update_designation_status', view_func=fn_Update_Designation_Status, methods=['POST'])
Designations_View.add_url_rule('/delete_designation', view_func=fn_Delete_Designation, methods=['POST'])
