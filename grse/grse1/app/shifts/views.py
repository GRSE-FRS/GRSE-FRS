import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime

Shifts_View = Blueprint('Shifts_View', __name__)

class fn_View_AllShifts(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllShifts.yaml', methods=['GET'])
    def get(self):
        try:
            data = ShiftMasters()
            respone = { "status": 'success', "message": "Success", "shift": data }
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200
            
class fn_View_AllShifts_page(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/AllShifts.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            page = request_data["pageno"]
            offset = int(10) * (int(page) - 1)
            search = request_data["search"]
            if search:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' AND name ilike '%{search}%' "
                # All_data = db.session.execute(search_query)
                All_data = Shifts.query.filter(Shifts.status != 'delete', Shifts.name.ilike(f'%{search}%')).order_by(
                    asc(Shifts.name)).all()
                # shift_schema = Shifts_schema()
                shift_schema = Shifts_schema(many=True)
                output = shift_schema.dump(All_data)
                # search_query_p = f"SELECT * FROM  WHERE status != 'delete' AND name ilike '%te%' limit 10 offset {
                # offset} " All_data_p = db.session.execute(search_query_p)
                All_data_p = Shifts.query.filter(Shifts.status != 'delete', Shifts.name.ilike(f'%{search}%')).order_by(
                    asc(Shifts.name)).limit(10).offset(offset)
                # shift_schema = Shifts_schema()
                shift_schema = Shifts_schema(many=True)
                output_p = shift_schema.dump(All_data_p)
            else:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = Shifts.query.filter(Shifts.status != 'delete').order_by(
                    asc(Shifts.name)).all()
                # shift_schema = Shifts_schema()
                shift_schema = Shifts_schema(many=True)
                output = shift_schema.dump(All_data)
                # search_query_p = f"SELECT * FROM  WHERE status != 'delete' AND name ilike '%te%' limit 10 offset {
                # offset} " All_data_p = db.session.execute(search_query_p)
                All_data_p = Shifts.query.filter(Shifts.status != 'delete').order_by(
                    asc(Shifts.name)).limit(10).offset(offset)
                # shift_schema = Shifts_schema()
                shift_schema = Shifts_schema(many=True)
                output_p = shift_schema.dump(All_data_p)
            response = {"status": 'success', "message": "Success", "count": len(output), "shift": output_p}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Create_Shifts(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateShifts.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            name = request_data["name"]
            code = request_data['code']
            query = Shifts.query.filter(Shifts.name.ilike(f'%{name}%')).first()
            query_1 = Shifts.query.filter(Shifts.code.ilike(f'%{code}%')).first()
            if query or query_1:
                respone = {"status": 'error', "message": "Shift Code or Name already exists"}
                return make_response(jsonify(respone)), 200
            else:
                data = Shifts.Add_shifts(request_data['name'],
                                         request_data['code'],
                                         request_data['shift_start_time'],
                                         request_data['shift_end_time'],
                                         request_data['status'])
    
                respone = {"status": 'success', "message": "Shifts created successfully", "shift": data}
            return make_response(jsonify(respone)), 200

        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Shifts(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateShifts.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Shifts.Update_Shifts(request_data['id'],request_data['name'],
                                     request_data['code'],request_data['shift_start_time'],
                                     request_data['shift_end_time'])
            respone = {"status": 'success', "message": "Shifts updated successfully", "shift": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Shifts_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/ShiftsStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Shifts.Change_Status(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "Shifts Status updated successfully", "shift": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_Shifts(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteShifts.yaml', methods=['POST'])
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
fn_View_AllShifts = fn_View_AllShifts.as_view("fn_View_AllShifts")
fn_Create_Shifts = fn_Create_Shifts.as_view("fn_Create_Shifts")
fn_Update_Shifts = fn_Update_Shifts.as_view("fn_Update_Shifts")
fn_Update_Shifts_Status = fn_Update_Shifts_Status.as_view("fn_Update_Shifts_Status")
fn_Delete_Shifts = fn_Delete_Shifts.as_view("fn_Delete_Shifts")
fn_View_AllShifts_page = fn_View_AllShifts_page.as_view("fn_View_AllShifts_page")


# # # adding routes to the Views we just created
Shifts_View.add_url_rule('/all_shifts', view_func=fn_View_AllShifts, methods=['GET'])
Shifts_View.add_url_rule('/create_shifts', view_func=fn_Create_Shifts, methods=['POST'])
Shifts_View.add_url_rule('/update_shifts', view_func=fn_Update_Shifts, methods=['POST'])
Shifts_View.add_url_rule('/update_shifts_status', view_func=fn_Update_Shifts_Status, methods=['POST'])
Shifts_View.add_url_rule('/delete_shifts', view_func=fn_Delete_Shifts, methods=['POST'])
Shifts_View.add_url_rule('/all_shifts_page', view_func=fn_View_AllShifts_page, methods=['POST'])
