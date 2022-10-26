import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required

Subarea_View = Blueprint('Subarea_View', __name__)

class fn_View_AllSubarea(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllSubarea.yaml', methods=['GET'])
    def get(self):
        try:
            data = SubAreaMasters()
            respone = { "status": 'success', "message": "Success", "subarea": data }
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Create_subarea(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateSubarea.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            code = request_data["code"]
            name = request_data['name']
            query = Subarea.query.filter(Subarea.code.ilike(f'%{code}%')).first()
            query_1 = Subarea.query.filter(Subarea.name.ilike(f'%{name}%')).first()
            if query or query_1:
                respone = {"status": 'error', "message": "Subarea Code or Name already exists"}
                return make_response(jsonify(respone)), 200
            else:
                data = Subarea.Add_Subarea(request_data['code'],
                                           request_data['name'], request_data['description'],
                                           request_data['status'])
                respone = {"status": 'success', "message": "Subarea created successfully", "subarea": data}
                return make_response(jsonify(respone)), 200
                
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Subarea(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateSubarea.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Subarea.Update_Subarea(request_data['id'],request_data['code'],
                                       request_data['name'], request_data['description'])
            respone = {"status": 'success', "message": "Subarea updated successfully", "subarea": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Subarea_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/SubareaStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Subarea.Change_Status(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "Subarea Status updated successfully", "subarea": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_Subarea(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteSubarea.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Subarea.Delete(request_data['id'])
            respone = {"status": 'success', "message": "Subarea Deleted successfully", "subarea": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_View_AllSubarea_Page(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/AllSubarea.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            page = request_data["pageno"]
            offset = int(10) * (int(page) - 1)
            search = request_data["search"]
            if search:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' AND name ilike '%{search}%' "
                # All_data = db.session.execute(search_query)
                All_data = Subarea.query.filter(Subarea.status != 'delete' and (Subarea.name.ilike(f'%{search}%')|Subarea.code.ilike(f'%{search}%'))).order_by(
                    Subarea.name).all()
                GroupSchema = Subarea_schema(many=True)
                output = GroupSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM  WHERE status != 'delete' AND name ilike '%te%' limit 10 offset {
                # offset} " All_data_p = db.session.execute(search_query_p)
                All_data_p = Subarea.query.filter(Subarea.status != 'delete'and 
                                                  (Subarea.name.ilike(f'%{search}%')|Subarea.code.ilike(f'%{search}%'))).order_by(
                    Subarea.name).limit(10).offset(offset)
                GroupSchema = Subarea_schema(many=True)
                output_p = GroupSchema.dump(All_data_p)
            else:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = Subarea.query.filter(Subarea.status != 'delete').order_by(Subarea.name).all()
                GroupSchema = Subarea_schema(many=True)
                output = GroupSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM {table} WHERE status != 'delete' limit 10 offset {offset}"
                # All_data_p = db.session.execute(search_query_p)
                All_data_p = Subarea.query.filter(Subarea.status != 'delete').order_by(Subarea.name).limit(10).offset(
                    offset)
                GroupSchema = Subarea_schema(many=True)
                output_p = GroupSchema.dump(All_data_p)

            response = {"status": 'success', "message": "Success", "count": len(output), "subarea": output_p}
            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

# # # Creating View Function/Resources
fn_View_AllSubarea = fn_View_AllSubarea.as_view("fn_View_AllSubarea")
fn_Create_subarea = fn_Create_subarea.as_view("fn_Create_subarea")
fn_Update_Subarea = fn_Update_Subarea.as_view("fn_Update_Subarea")
fn_Update_Subarea_Status = fn_Update_Subarea_Status.as_view("fn_Update_Subarea_Status")
fn_Delete_Subarea = fn_Delete_Subarea.as_view("fn_Delete_Subarea")
fn_View_AllSubarea_Page = fn_View_AllSubarea_Page.as_view("fn_View_AllSubarea_Page")


# # # adding routes to the Views we just created
Subarea_View.add_url_rule('/all_subarea', view_func=fn_View_AllSubarea, methods=['GET'])
Subarea_View.add_url_rule('/create_subarea', view_func=fn_Create_subarea, methods=['POST'])
Subarea_View.add_url_rule('/update_subarea', view_func=fn_Update_Subarea, methods=['POST'])
Subarea_View.add_url_rule('/update_subarea_status', view_func=fn_Update_Subarea_Status, methods=['POST'])
Subarea_View.add_url_rule('/delete_subarea', view_func=fn_Delete_Subarea, methods=['POST'])
Subarea_View.add_url_rule('/all_subarea_page', view_func=fn_View_AllSubarea_Page, methods=['POST'])
