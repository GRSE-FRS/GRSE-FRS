import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime

User_terminals_view = Blueprint('User_terminals_view', __name__)

class fn_View_AllTerminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllUserTerminals.yaml', methods=['GET'])
    def get(self):
        try:
            All_data = User_terminals.query.all()
            UsrTerminal_schema = User_terminals_schema()
            UsrTerminal_schema = User_terminals_schema(many=True)
            output = UsrTerminal_schema.dump(All_data)
            respone = { "status": 'success', "message": "Success", "user_terminals": output}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_View_AllTerminals_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllUserTerminalsPaginate.yaml', methods=['GET'])
    def get(self,page):
        try:
            All_data = User_terminals.query.all()
            UsrTerminal_schema = User_terminals_schema()
            UsrTerminal_schema = User_terminals_schema(many=True)
            output = UsrTerminal_schema.dump(All_data)
            respone = { "status": 'success', "message": "Success","count":len(output),"user_terminals": Paginate(output, page)}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Assign_User_terminalGroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UserAssignTerminal.yaml', methods=['POST'])
    def post(self):
        try:
            # user_id, terminal_id, is_block, block_from, block_to, status
            request_data = request.get_json(force=True)
            user_id = request_data['user_id']
            alpeta_user_id = request_data['alpeta_user_id']
            group_id = request_data['group_id']

            # check user_id blocked?


            # check user_id -> existing_group_id -> to terminal_id's -> disconnect user from terminal
            query = Users.query.filter_by(id=user_id).first()
            UserSchema = User_schema()
            user_data = UserSchema.dump(query)
            # print(user_data)


            if len(user_data) > 0:
                groupID = user_data['group_id']
                del_terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(groupID)
                print(del_terminal_list,"del_terminal_list")
                del_Alpeta_terminal_id = []
                for i in del_terminal_list:
                    query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                        Terminals.id == i).first()
                    Groupterminalsschema = Terminals_schema()
                    output = Groupterminalsschema.dump(query)
                    del_Alpeta_terminal_id.append(output)
                    User_terminals.Delete(i,user_id)
                print(del_Alpeta_terminal_id,"del_Alpeta_terminal_id")

                # delete Alpeta user terminal connection
                for i in [i["alpeta_terminal_id"] for i in del_Alpeta_terminal_id]:
                    Delete_userToTerMiNaLs(i, alpeta_user_id)

            Alpeta_terminal_id = []
            #
            terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(group_id)
            print('terminal_list',terminal_list)
            Users.query.filter(Users.id == user_id).update(
                {Users.group_id: group_id, Users.group_assign_date: current_timestamp, Users.group_updated_date:
                    current_timestamp})
            db.session.flush()
            db.session.commit()

            for i in terminal_list:
                query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                    Terminals.id == i).first()
                Groupterminalsschema = Terminals_schema()
                output = Groupterminalsschema.dump(query)
                Alpeta_terminal_id.append(output)

            print('Alpeta_terminal_id',Alpeta_terminal_id)

            #delete Alpeta user terminal connection
            for i in [i["alpeta_terminal_id"] for i in Alpeta_terminal_id]:
                Delete_userToTerMiNaLs(i, alpeta_user_id)

            # assign Alpeta user terminal connection
            for i in [i["alpeta_terminal_id"] for i in Alpeta_terminal_id]:
                Assign_userToTerMiNaLs(i, alpeta_user_id)
            #
            for i in terminal_list:
                # print("terminal_id",i)
                # print("group_id", group_id)
                # print("user_id", request_data['user_id'])
                # print("####################################")
                if User_terminals.check_ROW_if_exists_in_Table(i, request_data['user_id']):
                    pass
                else:
                    # User_terminals.Delete(i,request_data['user_id'])
                    User_terminals.Add_User_Terminals(request_data['user_id'], i, request_data['status'])

            Users.query.filter(Users.id == user_id).update({Users.group_id: group_id,
                Users.group_updated_date: current_timestamp})
            db.session.flush()
            db.session.commit()

            respone = { "status": 'success', "message": "success"}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class fn_Update_User_terminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateUserTerminals.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = User_terminals.Update_User_terminals(request_data['id'],
                                                        request_data['user_id'],
                                                        request_data['terminal_id'],
                                                        request_data['is_block'],
                                                        request_data['block_from'],
                                                        request_data['block_to'],
                                                        current_timestamp)
            respone = {"status": 'success', "message": "User Terminal updated successfully", "user_terminals": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_User_terminal_status(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/USerTerminalStatus.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = User_terminals.Change_Status(request_data['id'],request_data['status'])
            respone = {"status": 'success', "message": "User Terminal Status updated successfully", "user_terminals": data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class FetchUSers_by_Terminal_id(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/FetchUsersByTermianlID.yaml', methods=['GET'])
    def get(self,TerminalID):
        try:
            final_list_data = []
            data = User_terminals.Get_USers_by_TerminalID(TerminalID)
            for i in data:
                query = Users.query.with_entities(Users.employee_id,
                                                  Users.email,
                                                  Users.full_name,
                                                  Users.id).filter(Users.id==i).first()
                UserSchema = User_schema()
                output = UserSchema.dump(query)
                final_list_data.append(output)
            respone = {"status": 'success', "message": "success",
                       "user_details": final_list_data}
            return make_response(jsonify(respone)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_User_terminals(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteUSerTerminal.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            row_id = request_data['id']
            query = User_terminals.query.filter_by(id=row_id).first()
            Groupterminalsschema = User_terminals_schema()
            output = Groupterminalsschema.dump(query)
            user_id = request_data["user_id"]
            terminal_id = output["terminal_id"]
            alpeta_user_id = Users.FetchUSerDetails_By_ID(user_id)["alpeta_user_id"]
            alpeta_terminal_id = Terminals.FetchTerminals_By_ID(terminal_id)["alpeta_terminal_id"]
            Delete_USER_from_Terminal(TerminalID=alpeta_terminal_id,User_id=alpeta_user_id)
            data = User_terminals.Delete(request_data['id'],user_id)
            respone = {"status": 'success', "message": "User Terminal Deleted successfully", "user_terminals": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


# # # Creating View Function/Resources
fn_View_AllTerminals = fn_View_AllTerminals.as_view("fn_View_AllTerminals")
fn_View_AllTerminals_Paginate = fn_View_AllTerminals_Paginate.as_view("fn_View_AllTerminals_Paginate")
fn_Assign_User_terminalGroup = fn_Assign_User_terminalGroup.as_view("fn_Assign_User_terminalGroup")
fn_Update_User_terminals = fn_Update_User_terminals.as_view("fn_Update_User_terminals")
fn_Update_User_terminal_status = fn_Update_User_terminal_status.as_view("fn_Update_User_terminal_status")
fn_Delete_User_terminals = fn_Delete_User_terminals.as_view("fn_Delete_User_terminals")
FetchUSers_by_Terminal_id = FetchUSers_by_Terminal_id.as_view("FetchUSers_by_Terminal_id")


# # # adding routes to the Views we just created
User_terminals_view.add_url_rule('/all_userTerminals', view_func=fn_View_AllTerminals, methods=['GET'])
User_terminals_view.add_url_rule('/all_userTerminals/<page>', view_func=fn_View_AllTerminals_Paginate, methods=['GET'])
User_terminals_view.add_url_rule('/assign_user_terminals', view_func=fn_Assign_User_terminalGroup, methods=['POST'])
User_terminals_view.add_url_rule('/update_user_terminals', view_func=fn_Update_User_terminals, methods=['POST'])
User_terminals_view.add_url_rule('/update_user_terminals_status', view_func=fn_Update_User_terminal_status, methods=['POST'])
User_terminals_view.add_url_rule('/delete_user_terminals', view_func=fn_Delete_User_terminals, methods=['POST'])
User_terminals_view.add_url_rule('/userDetails/<TerminalID>', view_func=FetchUSers_by_Terminal_id, methods=['GET'])
