import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required

units_view = Blueprint('unit_view', __name__)

class fn_View_AllUnits(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllUnits.yaml', methods=['GET'])
    def get(self):
        try:
            All_data = Units.query.all()
            subarea_schema = Units_schema(many=True)
            output = subarea_schema.dump(All_data)
            # return output
            respone = { "status": 'success', "message": "Success", "units": output }
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_UnitsBySubAreaID(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UnitsBySubAreaID.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            respone = UnitsBySubAreaID(request_data['subarea_id'])
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Create_Units(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateUnits.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            query = Units.query.filter_by(code=request_data["code"]).first()
            if query is None:
                data = Create_Units(request_data['subarea_id'],request_data['code'],
                                         request_data['name'],request_data['description'],
                                         request_data['status'])
                respone = { "status": 'success', "message": "Unit created successfully", "Units": data }
                return make_response(jsonify(respone))
            else:
                respone = {"status": 'error', "message": "Unit code already exists"}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Units(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateUnits.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Update_Units(request_data['id'],request_data['subarea_id'],request_data['code'],
                                     request_data['name'],request_data['description'])
            respone = {"status": 'success', "message": "Units updated successfully", "Units": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Update_Unit_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateUnitStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Status_update_Units(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "Unit Status updated successfully", "units": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Delete_Unit(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteUnits.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Delete_Units(request_data['id'])
            respone = {"status": 'success', "message": "Units Deleted successfully", "Units": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200



# # # Creating View Function/Resources
fn_View_AllUnits = fn_View_AllUnits.as_view("fn_View_AllUnits")
fn_UnitsBySubAreaID = fn_UnitsBySubAreaID.as_view("fn_UnitsBySubAreaID")
fn_Create_Units = fn_Create_Units.as_view("fn_Create_Units")
fn_Update_Units = fn_Update_Units.as_view("fn_Update_Units")
fn_Update_Unit_Status = fn_Update_Unit_Status.as_view("fn_Update_Unit_Status")
fn_Delete_Unit = fn_Delete_Unit.as_view("fn_Delete_Unit")

# # # adding routes to the Views we just created
units_view.add_url_rule('/all_units', view_func=fn_View_AllUnits, methods=['GET'])
units_view.add_url_rule('/units_by_subareaID', view_func=fn_UnitsBySubAreaID, methods=['POST'])
units_view.add_url_rule('/create_unit', view_func=fn_Create_Units, methods=['POST'])
units_view.add_url_rule('/update_unit', view_func=fn_Update_Units, methods=['POST'])
units_view.add_url_rule('/update_unit_status', view_func=fn_Update_Unit_Status, methods=['POST'])
units_view.add_url_rule('/delete_unit', view_func=fn_Delete_Unit, methods=['POST'])

