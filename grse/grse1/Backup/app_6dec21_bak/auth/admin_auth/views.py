import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
import datetime

admin_auth = Blueprint('admin_auth', __name__)

class LoginView(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/login.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            user = Users.query.filter_by(email=request_data["email"]).first()
            if not user:
                response = {"success": "error", "status": 401, "Message": "The email address you provided is not associated with an account"}
                return make_response(jsonify(response)), 200

            if user.email == request_data["email"] and bcrypt.check_password_hash(user.password, request_data["password"]):
                print("USER VERIFIED")
                # bcrypt.check_password_hash(user.password, request_data["password"])
                expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                print("TYPE TIME",type(expiration_time))
                token = jwt.encode({'exp':str(expiration_time), "email":request_data["email"]},
                                   current_app.config['USER_SECRET_KEY'], algorithm='HS256')
                print("TYPE TOKEN",type(token))
                # response = {"success": True, "status": 200, "Message": "You have successfully Logged In",
                #             "Access_Token": token.decode('utf-8')}

                admin_details = Users.Fetch_user(request_data["email"])
                admin_schema = User_schema()
                output = admin_schema.dump(admin_details)
                print("TYPE OUTPUT",type(output))

                response = {"status": "success","message": "Logged In Successfully","token":token.decode("utf-8") ,
                            "admin_details":output}
                print("TYPE RESPONSE",type(response))

                #session.clear()
                #session['email']=request_data["email"]
                #session.permanent = True
                #create_app.permanent_session_lifetime = timedelta(hours=24)
                #print(session)
                return make_response(jsonify(response)), 200
            elif user.Password != request_data["Password"]:
                response = {"success": "error", "status": 401, "Message": "Invalid Password"}
                return make_response(jsonify(response)), 200
        except Exception as e:
            print(str(e))
            response = {"success": "error", "status": 401,
                        "Message": "Try checking Your Credentials and Try again", "error" : str(e)}
            return make_response(jsonify(response)), 200

class LogOutView(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/logout.yaml', methods=['GET'])
    def get(self):
        try:
            token = request.headers.get('token')
            # token = request.headers['token']
            # print(token)
            session.clear()
            response = {"success": "success", "status": 200,
                        "Message": "You have successfully Logged Out",
                        "Access_Token": "Access Token has been Destroyed"}
            return make_response(jsonify(response)), 200
        except:
            response = {"success": "error", "status": 401,
                        "Message": "LogOut attempt failed try again"}
            return make_response(jsonify(response)), 200

class Update_Admin_Password(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateAdminPass.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            user_id = request_data["user_id"]
            password = request_data["password"]

            Users.query.filter(Users.id==user_id).update({Users.password:password})
            db.session.flush()
            db.session.commit()

            response = {"status": 'success', "message": "success"}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class Update_Admin_Details(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpdateAdminDetails.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            user_id = request_data["user_id"]
            email = request_data["email"]
            first_name = request_data["first_name"]
            middle_name = request_data["middle_name"]
            last_name = request_data["last_name"]
            dob = datetime.datetime.fromisoformat(request_data["dob"])
            gender = request_data["gender"]
            phone = request_data["phone"]
            Users.query.filter(Users.id==user_id).update({Users.email: email,
                                                   Users.first_name: first_name,
                                                   Users.middle_name: middle_name,
                                                   Users.last_name: last_name,
                                                   Users.dob: dob,
                                                   Users.gender: gender,
                                                   Users.phone: phone})
            db.session.flush()
            db.session.commit()

            response = {"status": 'success', "message": "success"}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class AssignUserToTerminals(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AssignUserToTerminals.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            terminalID  = request_data["terminalID"]
            userID  = request_data["userID"]
            Assign_userToTerMiNaLs(terminalID,userID)
            response = {"status": 'success', "message": "success"}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class Registerable_UserID(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/Registerable_UserID.yaml', methods=['GET'])
    def get(self):
        try:
            response = get_next_user_id()
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
            return make_response(jsonify(response)), 200

class Get_Terminals(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/Terminals.yaml', methods=['GET'])
    def get(self):
        try:
            response = get_terminals()
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
            return make_response(jsonify(response)), 200

class Get_Terminal_Deatils(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/TerminalDetails.yaml', methods=['GET'])
    def get(self,terminal_id):
        try:
            response = get_terminal_details(terminal_id)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
            return make_response(jsonify(response)), 200

class Edit_terminal_details(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/EditTerminal.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            terminal_id = request_data["terminal_id"]
            json_param = {
                "ID": request_data["ID"],
                    "Name":  request_data["Name"],
                    "GroupID":  request_data["GroupID"],
                    "State":  request_data["State"],
                    "Type":  request_data["Type"],
                    "FuncType":  request_data["FuncType"],
                    "IPAddress":  request_data["IPAddress"],
                    "MacAddress":  request_data["MacAddress"],
                    "Version":  request_data["Version"],
                    "RemoteDoor":  request_data["RemoteDoor"],
                    "UTCIndex":  request_data["UTCIndex"],
                    "Description": request_data["Description"]
                    }
            response = Edit_terminal(terminal_id,json_data=json_param)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
            return make_response(jsonify(response)), 200

class Fetchmaster(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/FetchMaster.yaml', methods=['GET'])
    def get(self):
        try:
            ApletaUserID = get_next_user_id()
            AvailableTerminalList= get_terminals()
            department  = DepartmentMaster()
            vendor = VendorMaster()
            subarea_masters = SubAreaMasters()
            shift_masters = ShiftMasters()
            designation_masters = DesignationMaster()
            fingerprint_master = FingerPrintmaster()

            master = {"ApletaUserID":ApletaUserID,"AvailableTerminalList":AvailableTerminalList,
                      "department":department,"vendor":vendor,"subarea_masters":subarea_masters,
                      "shift_masters":shift_masters,
                      "designation_masters":designation_masters,"fingerprint_master":fingerprint_master}
            response = { "status": 'success', "message": 'Success', "master": master}
            return make_response(jsonify(response)),200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class test(MethodView):
    # @user_Required
    @cross_origin(supports_credentials=True)
    def get(self):
        return VendorMaster()

# # # Creating View Function/Resources
Loginview = LoginView.as_view('loginview')
Logoutview = LogOutView.as_view('logoutview')
Next_Registerable_UserID = Registerable_UserID.as_view("Registerable_UserID")
Get_Terminals = Get_Terminals.as_view("Get_Terminals")
Fetchmaster = Fetchmaster.as_view("Fetchmaster")
test = test.as_view("test")
Get_Terminal_Deatils = Get_Terminal_Deatils.as_view("Get_Terminal_Deatils")
Edit_terminal_details = Edit_terminal_details.as_view("Edit_terminal_details")
Update_Admin_Password =Update_Admin_Password.as_view("Update_Admin_Password")
Update_Admin_Details = Update_Admin_Details.as_view("Update_Admin_Details")
AssignUserToTerminals = AssignUserToTerminals.as_view("AssignUserToTerminals")

# # # adding routes to the Views we just created

admin_auth.add_url_rule('/admin/login', view_func=Loginview, methods=['POST'])
admin_auth.add_url_rule('/admin/logout', view_func=Logoutview, methods=['GET'])
admin_auth.add_url_rule('/admin/next_user_id', view_func=Next_Registerable_UserID, methods=['GET'])
admin_auth.add_url_rule('/admin/get_terminals', view_func=Get_Terminals, methods=['GET'])
admin_auth.add_url_rule('/admin/terminal_details/<terminal_id>', view_func=Get_Terminal_Deatils, methods=['GET'])
admin_auth.add_url_rule('/admin/fetchmaster', view_func=Fetchmaster, methods=['GET'])
admin_auth.add_url_rule('/admin/test', view_func=test, methods=['GET'])
admin_auth.add_url_rule('/admin/update_terminal', view_func=Edit_terminal_details, methods=['POST'])
admin_auth.add_url_rule('/admin/update_password', view_func=Update_Admin_Password, methods=['POST'])
admin_auth.add_url_rule('/admin/update_admin_details', view_func=Update_Admin_Details, methods=['POST'])
admin_auth.add_url_rule('/admin/AssignUserToTerminals', view_func=AssignUserToTerminals, methods=['POST'])
