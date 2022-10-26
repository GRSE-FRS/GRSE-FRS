import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime

Terminals_view = Blueprint('Terminals_view', __name__)

class fn_View_AllTerminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllTerminals.yaml', methods=['GET'])
    def get(self):
        try:
            All_data = Terminals.query.all()
            terminalsSchema = Terminals_schema()
            terminalsSchema = Terminals_schema(many=True)
            output = terminalsSchema.dump(All_data)
            final_data_list = []
            for i in output:
                i['user_Count'] = len(User_terminals.Get_Terminals_by_userID(i['id']))
                final_data_list.append(i)
            respone = {"status": 'success', "message": "Success", "terminals": final_data_list}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Create_Terminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateTerminals.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            query = Terminals.query.filter_by(name=request_data["name"]).first()
            if query is None:
                # name, alpeta_terminal_id, short_code, terminal_type, description, status,
                data = Terminals.Add_terminals(request_data['name'],
                                         request_data['alpeta_terminal_id'],
                                         request_data['short_code'],
                                         request_data['terminal_type'],
                                         request_data['description'],
                                         request_data['status'])

                respone = { "status": 'success', "message": "Terminals created successfully", "terminals": data }
                return make_response(jsonify(respone)),200
            else:
                respone = {"status": 'error', "message": "Terminals Name already exists"}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Terminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateTerminals.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            # _id, name, alpeta_terminal_id, short_code, terminal_type, description,
            data = Terminals.Update_Terminals(request_data['id'],request_data['name'],
                                         request_data['alpeta_terminal_id'],
                                         request_data['short_code'],
                                         request_data['terminal_type'],
                                         request_data['description'])
            respone = {"status": 'success', "message": "Terminals updated successfully", "terminals": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Terminals_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateTerminalsStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Terminals.Change_Status(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "Terminals Status updated successfully", "terminals": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_Terminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteTerminals.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Shifts.Delete(request_data['id'])
            respone = {"status": 'success', "message": "Shifts Deleted successfully", "shift": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

# # # Creating View Function/Resources
fn_View_AllTerminals = fn_View_AllTerminals.as_view("fn_View_AllTerminals")
fn_Create_Terminals = fn_Create_Terminals.as_view("fn_Create_Terminals")
fn_Update_Terminals = fn_Update_Terminals.as_view("fn_Update_Shifts")
fn_Update_Terminals_Status = fn_Update_Terminals_Status.as_view("fn_Update_Shifts_Status")
fn_Delete_Terminals = fn_Delete_Terminals.as_view("fn_Delete_Shifts")

# # # adding routes to the Views we just created
Terminals_view.add_url_rule('/all_terminals', view_func=fn_View_AllTerminals, methods=['GET'])
Terminals_view.add_url_rule('/create_terminals', view_func=fn_Create_Terminals, methods=['POST'])
Terminals_view.add_url_rule('/update_terminals', view_func=fn_Update_Terminals, methods=['POST'])
Terminals_view.add_url_rule('/update_terminals_status', view_func=fn_Update_Terminals_Status, methods=['POST'])
Terminals_view.add_url_rule('/delete_terminals', view_func=fn_Delete_Terminals, methods=['POST'])
