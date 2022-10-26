import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime

Group_Terminals_View = Blueprint('Group_Terminals_View', __name__)

class Group_Terminal_Assign(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/GroupTerminalAssign.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            Group_id = request_data["group_id"]
            Terminal_id = request_data["terminal_id"]
            status = request_data["status"]
            # if checkTerminalsFor_Dublicate is False:
            for i in Terminal_id:
                Group_terminals.Add_TerminalToGroup(Group_id, i, status)
            respone = {"status": 'success', "message": "Terminal Added successfully"}
            return make_response(jsonify(respone)), 200
            # else:
            #     respone = {"status": 'error', "message": "Terminal ID Already exists on other Group"}
            #     return make_response(jsonify(respone)), 200
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
            for i in Terminal_id:
                Group_terminals.Delete(Group_id, i)
            respone = {"status": 'success', "message": "Terminal Deleted from group successfully"}
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



# # # Creating View Function/Resources
Group_Terminal_Assign = Group_Terminal_Assign.as_view("Group_Terminal_Assign")
Group_Terminal_Delete = Group_Terminal_Delete.as_view("Group_Terminal_Delete")
Get_Terminal_Details_by_groupID = Get_Terminal_Details_by_groupID.as_view("Get_Terminal_Details_by_groupID")


# # # adding routes to the Views we just created
Group_Terminals_View.add_url_rule('/assignTerminals_toGroup', view_func=Group_Terminal_Assign, methods=['POST'])
Group_Terminals_View.add_url_rule('/Group_Terminal_Delete', view_func=Group_Terminal_Delete, methods=['POST'])
Group_Terminals_View.add_url_rule('/TerminalDetails/<group_id>', view_func=Get_Terminal_Details_by_groupID, methods=['GET'])
