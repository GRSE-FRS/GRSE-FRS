import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required

Department_View = Blueprint('department_View', __name__)

class fn_View_AllDepartment(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllDepartments.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            page = request_data["page_no"]
            offset = int(10) * (int(page) - 1)
            search = request_data["search"]
            if search:
                search_query = f"SELECT * FROM department WHERE status != 'delete' AND (costcntr ilike '%{search}%' " \
                               f"or shop_name ilike '%{search}%') ORDER BY shop_name  "
                All_data = db.session.execute(search_query)
                # All_data = Subarea.query.filter(Subarea.status != 'delete', Subarea.name.ilike(f'%{
                # search}%')).order_by( Subarea.name).all()
                department_schema = Department_schema(many=True)
                output = department_schema.dump(All_data)
                search_query = f"SELECT * FROM department WHERE status != 'delete' AND (costcntr ilike '%{search}%' " \
                               f"or shop_name ilike '%{search}%') ORDER BY shop_name limit 10 offset {offset} "
                All_data_p = db.session.execute(search_query)
                # All_data_p = Subarea.query.filter(Subarea.status != 'delete',
                #                                   Subarea.name.ilike(f'%{search}%')).order_by(
                #     Subarea.name).limit(10).offset(offset)
                department_schema = Department_schema(many=True)
                output_p = department_schema.dump(All_data_p)
            else:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = Department.query.filter(Department.status != "delete").order_by(Department.shop_name).all()
                department_schema = Department_schema(many=True)
                output = department_schema.dump(All_data)
                # search_query_p = f"SELECT * FROM {table} WHERE status != 'delete' limit 10 offset {offset}"
                # All_data_p = db.session.execute(search_query_p)
                All_data_p = Department.query.filter(Department.status != "delete").order_by(
                    Department.shop_name).limit(10).offset(offset)
                department_schema = Department_schema(many=True)
                output_p = department_schema.dump(All_data_p)

            response = {
                "status": "success",
                "message": "Department fetched successfully",
                "Department_List":  output_p,
                "SearchCount": len(output)

            }

            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

# class fn_View_AllDepartment(MethodView):
#     @cross_origin(supports_credentials=True)
#     @swag_from('apidocs/AllDepartments.yaml', methods=['POST'])
#     def post(self):
#         try:
#             request_data = request.get_json(force=True)
#             search = request_data["search"]
#             page_no = request_data["page_no"]
#             if search:
#                 if str.isdigit(search):
#                     search_query = f"SELECT * FROM department WHERE status != 'delete' AND costcntr ilike '%{search}%'"
#                 else:
#                     search_query = f"SELECT * FROM department WHERE status != 'delete' AND shop_name ilike '%{search}%'"
#                 data = db.session.execute(search_query)
#                 department_schema = Department_schema(many=True)
#                 output = department_schema.dump(data)
#             else:
#                 All_data = Department.query.filter(Department.status != "delete").order_by(Department.shop_name).all()
#                 department_schema = Department_schema(many=True)
#                 output = department_schema.dump(All_data)
#             response = {
#                 "status": "success",
#                 "message": "Department fetched successfully",
#                 "Department_List": Paginate(output, page_no) if page_no != "all" else output,
#                 "SearchCount": len(output)

#             }
#             return make_response(jsonify(response)), 200

#         except Exception as e:
#             response = {"status": 'error', "message": f'{str(e)}'}
#             return make_response(jsonify(response)), 200
            
class fn_SearchDepartment(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/SearchDepartment.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            search = request_data["search"]
            if str.isdigit(search):
                search_query = f"SELECT * FROM department WHERE status != 'delete' AND costcntr ilike '%{search}%'"
            else:
                search_query = f"SELECT * FROM department WHERE status != 'delete' AND shop_name ilike '%{search}%'"
            data = db.session.execute(search_query)
            Departmentschema = Department_schema(many=True)
            output = Departmentschema.dump(data)
            respone = {"status": 'success', "message": "success", "Department": output}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200
            
class fn_View_AllDepartment_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllDepartmentsPaginate.yaml', methods=['GET'])
    def get(self, page):
        try:
            All_data = Department.query.filter(Department.status != 'delete').order_by(Department.updated_at.desc()).all()
            department_schema = Department_schema()
            department_schema = Department_schema(many=True)
            output = department_schema.dump(All_data)
            respone = {"status": 'success', "message": "Success","count":len(output), "departments": Paginate(output, page)}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_DepartmentsBySubareaID(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DepartmentsBySubareaID.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Department.DepartmentsBySUBareaID(request_data['subarea_id'])
            department_schema = Department_schema()
            department_schema = Department_schema(many=True)
            output = department_schema.dump(data)
            response = {"status": 'success', "message": 'Success', "departments": output}
            return make_response(jsonify(response))
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_DepartmentsBySubareaID_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DepartmentsBySubareaIDPaginate.yaml', methods=['POST'])
    def post(self, page):
        try:
            request_data = request.get_json(force=True)
            data = Department.DepartmentsBySUBareaID(request_data['subarea_id'])
            department_schema = Department_schema()
            department_schema = Department_schema(many=True)
            output = department_schema.dump(data)
            response = {"status": 'success', "message": 'Success', "departments": Paginate(output, page)}
            return make_response(jsonify(response))
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200
            

class fn_Create_Departments(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateDepartments.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            costcntr = request_data['costcntr']
            shop_name = request_data['shop_name']
            query = Department.query.filter(Department.costcntr.ilike(f'%{costcntr}%')).first()

            #query_1 =Department.query.filter(Department.shop_name.ilike(f'%{shop_name}%')).first()

            if query :
                respone = {"status": 'error', "message": "Department Cost Center already exists", "departments": []}
            else:
                data = Department.Add_Department(subarea_id=request_data['subarea_id'],
                                                 costcntr=request_data['costcntr'],
                                                 shop_name=request_data['shop_name'],
                                                 dept_group=request_data['dept_group'],
                                                 hod_man=request_data['hod_man'],
                                                 hod_functional_area=request_data['hod_functional_area'],
                                                 clms_nodal_user=request_data['clms_nodal_user'],
                                                 clms_nodal_ajs=request_data['clms_nodal_ajs'],
                                                 clms_nodal_secu=request_data['clms_nodal_secu'],
                                                 clms_nodal_hr=request_data['clms_nodal_hr'],
                                                 clms_nodal_safety=request_data['clms_nodal_safety'],
                                                 clms_nodal_medical=request_data['clms_nodal_medical'],
                                                 status=request_data['status'])

                respone = {"status": 'success', "message": "Department created successfully", "departments": data}
            return make_response(jsonify(respone))
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_Departments(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateDepartments.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Department.Update_Department(id=request_data['id'],
                                                subarea_id=request_data['subarea_id'],
                                                costcntr=request_data['costcntr'],
                                                shop_name=request_data['shop_name'],
                                                dept_group=request_data['dept_group'],
                                                hod_man=request_data['hod_man'],
                                                hod_functional_area=request_data['hod_functional_area'],
                                                clms_nodal_user=request_data['clms_nodal_user'],
                                                clms_nodal_ajs=request_data['clms_nodal_ajs'],
                                                clms_nodal_secu=request_data['clms_nodal_secu'],
                                                clms_nodal_hr=request_data['clms_nodal_hr'],
                                                clms_nodal_safety=request_data['clms_nodal_safety'],
                                                clms_nodal_medical=request_data['clms_nodal_medical'])
            respone = {"status": 'success', "message": "Department updated successfully", "departments": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Update_Departments_Status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DepartmentStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Department.Change_Status(_id=request_data['id'], _status=request_data['status'])
            respone = {"status": 'success', "message": "Department Status updated successfully", "departments": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Delete_Department(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteDepartment.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Department.Delete(_id=request_data['id'])
            respone = {"status": 'success', "message": "Department Deleted successfully", "departments": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


# # # Creating View Function/Resources
fn_View_AllDepartment = fn_View_AllDepartment.as_view("fn_View_AllDepartment")
fn_View_AllDepartment_Paginate = fn_View_AllDepartment_Paginate.as_view("fn_View_AllDepartment_Paginate")
fn_Create_Departments = fn_Create_Departments.as_view("fn_Create_Departments")
fn_Update_Departments = fn_Update_Departments.as_view("fn_Update_Departments")
fn_Update_Departments_Status = fn_Update_Departments_Status.as_view("fn_Update_Departments_Status")
fn_Delete_Department = fn_Delete_Department.as_view("fn_Delete_Department")
fn_DepartmentsBySubareaID = fn_DepartmentsBySubareaID.as_view("fn_DepartmentsBySubareaID")
fn_DepartmentsBySubareaID_Paginate = fn_DepartmentsBySubareaID_Paginate.as_view("fn_DepartmentsBySubareaID_Paginate")
fn_SearchDepartment = fn_SearchDepartment.as_view("fn_SearchDepartment")
# # # adding routes to the Views we just created
Department_View.add_url_rule('/all_departments', view_func=fn_View_AllDepartment, methods=['POST'])
Department_View.add_url_rule('/all_departments/<page>', view_func=fn_View_AllDepartment_Paginate, methods=['GET'])
Department_View.add_url_rule('/create_department', view_func=fn_Create_Departments, methods=['POST'])
Department_View.add_url_rule('/update_department', view_func=fn_Update_Departments, methods=['POST'])
Department_View.add_url_rule('/update_departments_status', view_func=fn_Update_Departments_Status, methods=['POST'])
Department_View.add_url_rule('/delete_department', view_func=fn_Delete_Department, methods=['POST'])
Department_View.add_url_rule('/departments_by_subareaID', view_func=fn_DepartmentsBySubareaID, methods=['POST'])
Department_View.add_url_rule('/departments_by_subareaID/<page>', view_func=fn_DepartmentsBySubareaID_Paginate, methods=['POST'])
Department_View.add_url_rule('/search_department', view_func=fn_SearchDepartment, methods=['POST'])
