import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime
global current_timestamp
Group_Terminals_View = Blueprint('Group_Terminals_View', __name__)

class Group_Terminal_Assign(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GroupTerminalAssign.yaml', methods=['POST'])
    def post(self):
        try:
            current_timestamp = datetime.now()
            request_data = request.get_json(force=True)
            Group_id = request_data["group_id"]
            Terminal_id = request_data["terminal_id"]
            status = request_data["status"]

            for i in Terminal_id:
                # print(Group_terminals.check_terminal_if_exists_in_group(terminal_id=i,group_id=Group_id))
                if Group_terminals.check_terminal_if_exists_in_group(terminal_id=i,group_id=Group_id):
                    Group_terminals.Add_TerminalToGroup(Group_id, i, status)
                    # print(current_timestamp,"current_timestamp")
                else:
                    pass
            print("current_timestamp",current_timestamp)
            terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(Group_id)

            # delete
            deff_terminal_id = dif(terminal_list, Terminal_id)
            # print(deff_terminal_id,"deff_terminal_id")



            del_Alpeta_terminal_id = []

            for i in deff_terminal_id:
                query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                    Terminals.id == i).first()
                Groupterminalsschema = Terminals_schema()
                output = Groupterminalsschema.dump(query)
                del_Alpeta_terminal_id.append(output)
                Group_terminals.Delete(i, Group_id)

            # print(del_Alpeta_terminal_id,"del_Alpeta_terminal_id")

            Alpeta_terminal_id = []

            new_terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(Group_id)
            for i in new_terminal_list:
                query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                    Terminals.id == i).first()
                Groupterminalsschema = Terminals_schema()
                output = Groupterminalsschema.dump(query)
                Alpeta_terminal_id.append(output)

            # print(Alpeta_terminal_id,"Alpeta_terminal_id")

            # Now Check group assigned to which users: thn update user details to terminal.
            user_data = Users.FetchUSerDetails_By_group_id(Group_id)
            for i in user_data:
                user_id = i['id']
                alpeta_user_id = i['alpeta_user_id']

                #delete Alpeta user terminal connection
                for i in [i["alpeta_terminal_id"] for i in del_Alpeta_terminal_id]:
                    Delete_userToTerMiNaLs(i, alpeta_user_id)

                # assign Alpeta user terminal connection
                for i in [i["alpeta_terminal_id"] for i in Alpeta_terminal_id]:
                    Assign_userToTerMiNaLs(i, alpeta_user_id)

                for i in deff_terminal_id:
                    if User_terminals.GET_id_to_be_deleted(i,user_id) is None:
                        pass
                    else:
                        id = User_terminals.GET_id_to_be_deleted(i,user_id)
                        db.session.execute(f"DELETE FROM user_terminals WHERE id='{id}';")
                        db.session.commit()
                for i in Terminal_id:
                    if User_terminals.check_ROW_if_exists_in_Table(i, user_id):
                        pass
                    else:
                        User_terminals.Add_User_Terminals(user_id, i, status)
                Users.query.filter(Users.id ==user_id).update({Users.group_updated_date: current_timestamp,
                    Users.updated_at: current_timestamp})
                db.session.flush()
                db.session.commit()

            #delete
            deff_terminal_id = dif(terminal_list, Terminal_id)

            del_Alpeta_terminal_id = []
            for i in deff_terminal_id:
                # print("deleting User from terminal")
                query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                    Terminals.id == i).first()
                Groupterminalsschema = Terminals_schema()
                output = Groupterminalsschema.dump(query)
                del_Alpeta_terminal_id.append(output)
                Group_terminals.Delete(i, Group_id)

            Group.query.filter(Group.id == Group_id).update({Group.updated_at: current_timestamp})
            db.session.flush()
            db.session.commit()

            respone = {"status": 'success', "message": "Terminal Group Updated Successfully"}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class Group_Terminal_Delete(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GroupTerminalDelete.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            Group_id = request_data["group_id"]
            Terminal_id = request_data["terminal_id"]

            Alpeta_terminal_id = []
            for i in Terminal_id:
                query = Terminals.query.with_entities(Terminals.alpeta_terminal_id).filter(
                    Terminals.id == i).first()
                Groupterminalsschema = Terminals_schema()
                output = Groupterminalsschema.dump(query)
                Alpeta_terminal_id.append(output)

            # find user details:
            user_data = Users.FetchUSerDetails_By_group_id(Group_id)
            for i in user_data:
                user_id = i['id']
                alpeta_user_id = i['alpeta_user_id']

                for id in Alpeta_terminal_id:
                    Delete_userToTerMiNaLs(id, alpeta_user_id)
                    Group_terminals.Delete(id,Group_id)

            respone = {"status": 'success', "message": "Terminal Group Deleted from group successfully"}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class Get_Terminal_Details_by_groupID(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GetTerminalDetailsByGroupID.yaml', methods=['GET'])
    def get(self, group_id):
        try:
            GroupDetais = Group.FetchGroupDetails_By_ID(group_id)
            terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(group_id)
            terminal_data = []
            for i in terminal_list:
                T_data = Terminals.FetchTerminals_By_ID(i)
                terminal_data.append(T_data)

            respone = {"status": 'success',
                       "message": "success",
                       "GroupDetais": GroupDetais,
                       "TerminalsDetails": terminal_data}

            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class Get_Terminal_Details_by_groupID_Paginate(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GetTerminalDetailsByGroupIDPaginate.yaml', methods=['GET'])
    def get(self, group_id, page):
        try:
            GroupDetais = Group.FetchGroupDetails_By_ID(group_id)
            terminal_list = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(group_id)
            terminal_data = []
            for i in terminal_list:
                T_data = Terminals.FetchTerminals_By_ID(i)
                terminal_data.append(T_data)

            respone = {"status": 'success',
                       "message": "success",
                       "count":len(terminal_data),
                       "GroupDetais": GroupDetais,
                       "TerminalsDetails": Paginate(terminal_data, page)}

            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


# # # Creating View Function/Resources
Group_Terminal_Assign = Group_Terminal_Assign.as_view("Group_Terminal_Assign")
Group_Terminal_Delete = Group_Terminal_Delete.as_view("Group_Terminal_Delete")
Get_Terminal_Details_by_groupID = Get_Terminal_Details_by_groupID.as_view("Get_Terminal_Details_by_groupID")
Get_Terminal_Details_by_groupID_Paginate = Get_Terminal_Details_by_groupID_Paginate.as_view("Get_Terminal_Details_by_groupID_Paginate")

# # # adding routes to the Views we just created
Group_Terminals_View.add_url_rule('/assignTerminals_toGroup', view_func=Group_Terminal_Assign, methods=['POST'])
Group_Terminals_View.add_url_rule('/Group_Terminal_Delete', view_func=Group_Terminal_Delete, methods=['POST'])
Group_Terminals_View.add_url_rule('/TerminalDetails/<group_id>', view_func=Get_Terminal_Details_by_groupID,methods=['GET'])
Group_Terminals_View.add_url_rule('/TerminalDetails/<group_id>/<page>',view_func=Get_Terminal_Details_by_groupID_Paginate, methods=['GET'])
