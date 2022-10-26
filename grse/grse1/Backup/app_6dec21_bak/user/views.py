import json
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import current_app, Blueprint
from app.auth.admin_auth.utils import user_Required
from datetime import datetime
from sqlalchemy import or_

users_view = Blueprint('user_view', __name__)

class Get_Employee_Details(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/EmployeeDetails.yaml', methods=['GET'])
    def get(self,employee_code):
        try:
            output = Get_Employee_details(employee_code)
            response = {"status": 'success', "message": 'Account details fetched successfully', "user_data": output}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class ScanFingerPrint(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/scanFingerPrint.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            terminal_id = request_data["terminal_id"]
            alpeta_user_id = request_data["alpeta_user_id"]
            alpeta_figerprint_id = request_data["alpeta_figerprint_id"]
            response = scanFingerPrint(terminal_id,alpeta_user_id,alpeta_figerprint_id)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class ScanFaceData(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/ScanFaceData.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            terminal_id = request_data["terminal_id"]
            response = scanFaceData(terminal_id)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class ScanCard(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/ScanCard.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            terminal_id = request_data["terminal_id"]
            response = scanCardData(terminal_id)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class CreateUser(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreatUser.yaml', methods=['POST'])
    def post(self):
        try:
            alpeta_fingerprint_data_str = request.form["alpeta_fingerprint_data"]
            alpeta_fingerprint_data = json.loads(alpeta_fingerprint_data_str)

            apleta_card_data_str = request.form["alpeta_card_data"]
            apleta_card_data = json.loads(apleta_card_data_str)

            alpeta_face_data_str = request.form["alpeta_face_data"]
            alpeta_face_data = json.loads(alpeta_face_data_str)


            # print(alpeta_fingerprint_data)
            # return {"success":"true"}
            _user = Users.query.filter_by(employee_id=request.form["employee_id"]).first()
            # print("USER DATA,", _user.alpeta_user_id)
            if _user is None:
                try:
                    usr_data = Users.addUser(employee_id=request.form["employee_id"],
                                    department_id=request.form["department_id"],
                                    vendor_id=request.form["vendor_id"],
                                    alpeta_user_id=request.form["alpeta_user_id"],
                                    designation_id=request.form["designation_id"],
                                    role_id=request.form["role_id"],
                                    shift_id=request.form["shift_id"],
                                    first_name=request.form["first_name"],
                                    middle_name=request.form["middle_name"],
                                    last_name=request.form["last_name"],
                                    dob=datetime.fromisoformat(request.form["dob"]),
                                    gender=request.form["gender"],
                                    nationality=request.form["nationality"],
                                    marital_status=request.form["marital_status"],
                                    address=request.form["address"],
                                    email=request.form["email"],
                                    phone=request.form["phone"],
                                    esi_no=request.form["esi_no"],
                                    pf_no=request.form["pf_no"],
                                    # employment_start_date=datetime.fromisoformat(request.form["employment_start_date"]),
                                    # employment_end_date=datetime.fromisoformat(request.form["employment_end_date"]),
                                    password=request.form["password"],
                                    alpeta_password=request.form["alpeta_password"],
                                    profile_picture=request.form["profile_picture"]
                                    # last_updated_by=request.form["last_updated_by"],
                                    # last_update_date=request.form["last_update_date"],
                                    # is_deleted=request.form["is_deleted"]
                                             )
                    print("LOCAL DB USER DATA INGESTION SUCCESSFUL")
                except Exception as e:
                    response = {"status": 'error', "message": str(e)}
                    return make_response(jsonify(response)), 200
                try:
                    print("ADDING FINGER PRINTS")
                    UserFPdata = []
                    for i in alpeta_fingerprint_data:
                        FP_obj1 = {"FingerID": i['FingerID'],"MinConvType": 3,"TemplateIndex": 1,
                               "TemplateData": i['Template1']}
                        FP_obj2 = {"FingerID": i['FingerID'],"MinConvType": 3,
                                "TemplateIndex": 2,"TemplateData": i['Template2']}
                        UserFPdata.append(FP_obj1)
                        UserFPdata.append(FP_obj2)
                        User_fingerprints.add_fingerprint(user_id=usr_data.id,
                                                          alpeta_user_id=request.form['alpeta_user_id'],
                                                          fingerid=i['FingerID'],
                                                          totalsize=i['TotalSize'],
                                                          template1=i['Template1'],
                                                          template2=i['Template2'],
                                                          convimage1=i['ConvImage1'],
                                                          convimage2=i['ConvImage2'])

                    print("LOCAL DB FINGER PRINTS INGESTION SUCCESSFUL")
                except Exception as e:
                    response = {"status": 'error', "message": str(e)}
                    return make_response(jsonify(response)), 200
                try:
                    print("ADDING CARD DATA")
                    card_record_create = User_cards.addCards(user_id=usr_data.id, cardnum=apleta_card_data['CardNum'])
                    print("LOCAL DB CARD DATA INGESTION SUCCESSFUL")
                except Exception as e:
                    response = {"status": 'error', "message": str(e)}
                    return make_response(jsonify(response)), 200

                # alpeta_face_data_str = request.form["alpeta_face_data"]
                # alpeta_face_data = json.loads(alpeta_face_data_str)

                try:
                    print("ADDING FACE DATA")
                    User_facedatas.AddFaceData(user_id=usr_data.id,
                                               templatesize=alpeta_face_data[0]['TemplateSize'],
                                               templatedata=alpeta_face_data[0]['TemplateData'],
                                               templatetype=alpeta_face_data[0]['TemplateType'])
                    print("LOCAL DB FACE DATA INGESTION SUCCESSFUL")
                except Exception as e:
                    response = {"status": 'error', "message": str(e)}
                    return make_response(jsonify(response)), 200

                # Post Data to alpeta server;
                print("ADDING DATA TO ALPETA SERVER")
                params = {
                    "UserInfo": {
                        "ID": str(usr_data.alpeta_user_id),
                        "UniqueID": str(usr_data.alpeta_user_id),
                        "Name": usr_data.first_name + " " + usr_data.last_name,
                        # // "AuthInfo": [9, 2, 0, 0, 0, 0, 0, 2],
                        "AuthInfo": list_auth_info[request.form["AuthInfo"]],
                        "Privilege": 2,
                        "CreateDate": str(current_timestamp),
                        "UsePeriodFlag": 0,
                        "RegistDate": str(current_timestamp),
                        "ExpireDate": "2099-12-31 23:59:59",
                        "Password": request.form["password"],
                        "GroupCode": 0,
                        "AccessGroupCode": 0,
                        "UserType": 0,
                        "TimezoneCode": 0,
                        "BlackList": 0,
                        "FPIdentify": 1,
                        "FaceIdentify": 0,
                        "Partition": 0,
                        "APBExcept": 0,
                        "APBZone": 0,
                        "WorkCode": "****",
                        "MealCode": "****",
                        "MoneyCode": "****",
                        "MessageCode": 0,
                        "VerifyLevel": 0,
                        "PositionCode": 1000,
                        "Department": "",
                        "LoginPW": "",
                        "LoginAllowed": 0,
                        "Picture": "",
                        "EmployeeNum": usr_data.employee_id,
                        "Email": usr_data.email,
                        "Phone": usr_data.phone
                    },
                    "UserFPInfo": UserFPdata,
                    "UserCardInfo": [{
                        "CardNum": apleta_card_data['CardNum']
                    }],
                    "UserFaceWTInfo": [{
                        "UserID": usr_data.alpeta_user_id,
                        "TemplateSize": alpeta_face_data[0]['TemplateSize'],
                        "TemplateData": alpeta_face_data[0]['TemplateData'],
                        "TemplateType": alpeta_face_data[0]['TemplateType']
                    }],
                }
                try:
                    url = f"{Settings.config.base_url}/users?UserID={request.form['alpeta_user_id']}"
                    print("SENDING REQUEST")
                    print("JSON :", params)
                    req = requests.post(url, cookies=Login_cookie(), json=params)
                    # print("JSON :",jsonify(params))
                    status = req.status_code
                    content = json.loads(req.content.decode("utf-8"))
                    print("TOTAL CONTENT",content)
                    if status == 200:
                        ResultCode = content['Result']['ResultCode']
                        if ResultCode == 0:
                            response = {"status": 'success', "message": 'User created successfully', "user": content}
                            return make_response(jsonify(response)), 200
                        else:
                            User_fingerprints.Delete(usr_data.id)
                            User_cards.Delete(usr_data.id)
                            User_facedatas.Delete(usr_data.id)
                            Users.Delete(usr_data.id)
                            response = {"status": 'error',
                                        "message": f'Something went wrong in alpetaServer while selnding data, ResultCode {ResultCode}'}
                            return response
                    else:
                        response = {"status": 'error',
                                    "message": f'Something went 'f'wrong in alpetaServer while '
                                        f'selnding data, CONTENT {content} , Status code {status}'}
                        return response

                except Exception as e:
                    response = {"status": 'error', "message": str(e)}
                    return make_response(jsonify(response)), 200

            elif _user is not None and _user.alpeta_user_id is None :
                try:
                    try:
                        print("ADDING FINGER PRINTS")
                        UserFPdata = []
                        for i in alpeta_fingerprint_data:
                            FP_obj1 = {"FingerID": i['FingerID'], "MinConvType": 3, "TemplateIndex": 1,
                                       "TemplateData": i['Template1']}
                            FP_obj2 = {"FingerID": i['FingerID'], "MinConvType": 3,
                                       "TemplateIndex": 2, "TemplateData": i['Template2']}
                            UserFPdata.append(FP_obj1)
                            UserFPdata.append(FP_obj2)
                            User_fingerprints.add_fingerprint(user_id=_user.id,
                                                              alpeta_user_id=request.form['alpeta_user_id'],
                                                              fingerid=i['FingerID'],
                                                              totalsize=i['TotalSize'],
                                                              template1=i['Template1'],
                                                              template2=i['Template2'],
                                                              convimage1=i['ConvImage1'],
                                                              convimage2=i['ConvImage2'])

                        print("LOCAL DB FINGER PRINTS INGESTION SUCCESSFUL")
                    except Exception as e:
                        response = {"status": 'error', "message": str(e)}
                        return make_response(jsonify(response)), 200
                    try:
                        print("ADDING CARD DATA")
                        card_record_create = User_cards.addCards(user_id=_user.id,
                                                                 cardnum=apleta_card_data['CardNum'])
                        print("LOCAL DB CARD DATA INGESTION SUCCESSFUL")
                    except Exception as e:
                        response = {"status": 'error', "message": str(e)}
                        return make_response(jsonify(response)), 200
                    try:
                        print("ADDING FACE DATA")
                        User_facedatas.AddFaceData(user_id=_user.id,
                                                   templatesize=alpeta_face_data[0]['TemplateSize'],
                                                   templatedata=alpeta_face_data[0]['TemplateData'],
                                                   templatetype=alpeta_face_data[0]['TemplateType'])
                        print("LOCAL DB FACE DATA INGESTION SUCCESSFUL")
                    except Exception as e:
                        response = {"status": 'error', "message": str(e)}
                        return make_response(jsonify(response)), 200

                    Users.query.filter(Users.employee_id == request.form["employee_id"]).update(
                        {Users.alpeta_user_id: request.form["alpeta_user_id"]})
                    db.session.flush()
                    db.session.commit()
                    params = {
                        "UserInfo": {
                            "ID": str(_user.alpeta_user_id),
                            "UniqueID":str( _user.alpeta_user_id),
                            "Name": _user.first_name + " " + _user.last_name,
                            # // "AuthInfo": [9, 2, 0, 0, 0, 0, 0, 2],
                            "AuthInfo": [9, 2, 1, 0, 0, 0, 0, 3],
                            "Privilege": 2,
                            "CreateDate": str(current_timestamp),
                            "UsePeriodFlag": 0,
                            "RegistDate": str(current_timestamp),
                            "ExpireDate": "2099-12-31 23:59:59",
                            "Password": request.form["password"],
                            "GroupCode": 0,
                            "AccessGroupCode": 0,
                            "UserType": 0,
                            "TimezoneCode": 0,
                            "BlackList": 0,
                            "FPIdentify": 1,
                            "FaceIdentify": 0,
                            "Partition": 0,
                            "APBExcept": 0,
                            "APBZone": 0,
                            "WorkCode": "****",
                            "MealCode": "****",
                            "MoneyCode": "****",
                            "MessageCode": 0,
                            "VerifyLevel": 0,
                            "PositionCode": 1000,
                            "Department": "",
                            "LoginPW": "",
                            "LoginAllowed": 0,
                            "Picture": "",
                            "EmployeeNum": _user.employee_id,
                            "Email": _user.email,
                            "Phone": _user.phone
                        },
                        "UserFPInfo": UserFPdata,
                        "UserCardInfo": [{
                            "CardNum": apleta_card_data['CardNum']
                        }],
                        "UserFaceWTInfo": [{
                            "UserID": _user.alpeta_user_id,
                            "TemplateSize": alpeta_face_data[0]['TemplateSize'],
                            "TemplateData": alpeta_face_data[0]['TemplateData'],
                            "TemplateType": alpeta_face_data[0]['TemplateType']
                        }],
                    }

                    url = f"{Settings.config.base_url}/users?UserID={request.form['alpeta_user_id']}"
                    req = requests.post(url, cookies=Login_cookie(), json=params)
                    print("REQUEST SEND TO ALPETA SERVER")
                    status = req.status_code
                    content = json.loads(req.content.decode("utf-8"))
                    if status == 200:
                        ResultCode = content['Result']['ResultCode']
                        print("ALPETA SERVER RESPONSE RESULT CODE :", ResultCode)
                        if ResultCode == 0:
                            response = {"status": 'success', "message": "User Updated"}
                            return make_response(jsonify(response)), 200
                        else:
                            User_fingerprints.Delete(_user.id)
                            User_cards.Delete(_user.id)
                            User_facedatas.Delete(_user.id)
                            Users.query.filter(Users.employee_id == None).update(
                                {Users.alpeta_user_id: request.form["alpeta_user_id"]})
                            db.session.flush()
                            db.session.commit()

                            response = {"status": 'error', "message": f'Something went'
                                        f'wrong in alpetaServer while '
                                        f'selnding data, ResultCode {ResultCode}'}
                        return response
                    else:
                        response = {"status": 'error', "message": f'Something went '
                                                                  f'wrong in alpetaServer while '
                                                                  f'selnding data, CONTENT {content} , Status code {status}'}
                        return response
                except Exception as e:
                    response = {"status": 'error', "message": f"{str(e)} : 'Something went wrong"}
                    return make_response(jsonify(response)), 200

            elif _user is not None and _user.alpeta_user_id is not None:
                response = {"status": 'error', "message": "User exists"}
                return make_response(jsonify(response)), 200
            else:
                response = {"status": 'error', "message": "Else error"}
                return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f"{str(e)} : 'Something went wrong"}
            return make_response(jsonify(response)), 200


class fn_View_Users_by_RoleID(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllUsers.yaml', methods=['POST'])
    def post(self,role_id,page):
        try:
            request_data = request.get_json(force=True)
            search_status = request_data["search_status"]
            search_key = request_data["search_key"]
            search = "%{}%".format(search_key)
            if search_status == True:
                search_query = Users.query.filter(Users.role_id==role_id,Users.employee_id.match(search)).all()
                Userschema = User_schema(many=True)
                output = Userschema.dump(search_query)
                respone = {
                    "status": 'success',
                    "message": "Success",
                    "SearchCount":len(output),
                    "Users": Paginate(output, page)}
                return make_response(jsonify(respone)),200

            elif search_status == False:
                query = Users.query.filter_by(role_id=role_id).all()
                Userschema = User_schema(many=True)
                output = Userschema.dump(query)
                respone = {"status": 'success', "message": "Success", "SearchCount":len(output),"Users": Paginate(output,page)}
                return make_response(jsonify(respone)),200
            else:
                respone = {"status": 'error', "message": "key 'Success' must ne True or Flase"}
                return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Delete_Employee(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/DeleteUsers.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Users.Delete(request_data['id'])
            respone = {"status": 'success', "message": "User Deleted successfully", "Users": data}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_SearchUser(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/SearchUser.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            data = Users.query.filter(Users.role_id == int(request_data["role_id"]),
                                      or_(Users.employee_id.like(request_data["employee_id"]),
                                            Users.first_name.like(request_data["first_name"]),
                                          Users.last_name.like(request_data["last_name"]),
                                          Users.alpeta_user_id.like(request_data["alpeta_user_id"])
                                          )
            )
            Userschema = User_schema(many=True)
            output = Userschema.dump(data)

            respone = {"status": 'success', "message": "success", "Users": output}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_Update_ProfilePIC(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UpadeePrfilePic.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            img_str = request_data['img_str']
            id = request_data['id']
            response = Update_USER_ProfilePIC(id=id,image_str=img_str)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class fn_UserInfo_by_TerminalID(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UserInfoBYTerminalID.yaml', methods=['GET'])
    def get(self,id):
        try:
            response = Get_USER_Info_from_TerminalID(id=id)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

class User_CompleteDetails(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/UserCompleteDetails.yaml', methods=['GET'])
    def get(self, id):
        try:
            # usr_id = int(id)
            UserDetails = Users.FetchUSerDetails_By_ID(_id=id)

            # print("Variable type ", type(id))

            user_id=UserDetails["id"]
            department_id = UserDetails["department_id"]
            shift_id = UserDetails["shift_id"]
            designation_id = UserDetails["designation_id"]

            DepartmentDetails = Department.FetchDEpartmentDetails_By_ID(department_id)
            ShiftDetails = Shifts.FetchShiftsDetails_By_ID(shift_id)
            DEsignationDetails = Designations.FetchDesignationDetails_By_ID(designation_id)
            FingerPrintDetails = User_fingerprints.FetchUserFingerPrintDetails_By_ID(user_id)
            CardData = User_cards.FetchUserCardsDetails_By_ID(user_id)
            FaceData = User_facedatas.FetchUserfacedatas_By_ID(user_id)

            details_json = {"UserDetails":UserDetails,"DepartmentDetails":DepartmentDetails,
                            "ShiftDetails":ShiftDetails,"DEsignationDetails":DEsignationDetails,
                            "FingerPrintDetails":FingerPrintDetails,"CardData":CardData,
                            "FaceData":FaceData}
            response = {"status": 'success', "message": 'Details fetched successfully', "user_data": details_json}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200

fn_View_Users_by_RoleID = fn_View_Users_by_RoleID.as_view("fn_View_Users")
Get_Employee_Details = Get_Employee_Details.as_view("Get_Employee_Details")
ScanFingerPrint = ScanFingerPrint.as_view("ScanFingerPrint")
ScanFaceData=ScanFaceData.as_view("ScanFaceData")
ScanCard = ScanCard.as_view("ScanCard")
CreateUser = CreateUser.as_view("CreateUser")
DeleteEmployee = fn_Delete_Employee.as_view("DeleteEmployee")
fn_SearchUser = fn_SearchUser.as_view("fn_SearchUser")
fn_Update_ProfilePIC = fn_Update_ProfilePIC.as_view("fn_Update_ProfilePIC")
fn_UserInfo_by_TerminalID = fn_UserInfo_by_TerminalID.as_view("fn_UserInfo_by_TerminalID")
User_CompleteDetails = User_CompleteDetails.as_view("User_CompleteDetails")

# # # adding routes to the Views we just created
users_view.add_url_rule('/user/all_users/<int:role_id>/<page>', view_func=fn_View_Users_by_RoleID, methods=['POST'])
users_view.add_url_rule('/user/employee_details/<employee_code>', view_func=Get_Employee_Details, methods=['GET'])
users_view.add_url_rule('/user/scanFingerPrint', view_func=ScanFingerPrint, methods=['POST'])
users_view.add_url_rule('/user/scanFaceData', view_func=ScanFaceData, methods=['POST'])
users_view.add_url_rule('/user/scanCard', view_func=ScanCard, methods=['POST'])
users_view.add_url_rule('/user/create_user', view_func=CreateUser, methods=['POST'])
users_view.add_url_rule('/user/delete_user', view_func=DeleteEmployee, methods=['POST'])
users_view.add_url_rule('/user/search', view_func=fn_SearchUser, methods=['POST'])
users_view.add_url_rule('/user/updateProfilePic', view_func=fn_Update_ProfilePIC, methods=['POST'])
users_view.add_url_rule('/user/terminalUsers/info/<id>', view_func=fn_UserInfo_by_TerminalID, methods=['GET'])
users_view.add_url_rule('/user/userDetails/<int:id>', view_func=User_CompleteDetails, methods=['GET'])
