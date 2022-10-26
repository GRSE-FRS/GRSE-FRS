import json
from app import *
import requests
import Settings.config
from app.Models import *
from sqlalchemy import asc, desc
import os
from functools import wraps
from flask import current_app
from werkzeug.utils import secure_filename
import stat
from sqlalchemy.exc import IntegrityError

def Login_cookie():
    try:
        userId = Settings.config.Alpeta_Login_Id
        password = Settings.config.Alpeta_Login_Password
        user_type = Settings.config.Alpeta_Login_UserType
        params = {"userId": userId, "password": password, "userType": user_type}
        req = requests.post(url=Settings.config.base_url + '/login', json=params)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        cookie = req.cookies
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                return cookie
            else:
                return {'status': 'error', "message": 'alpetaServerLogin Rejected. Error Code: ' + str(ResultCode)}
        else:
            resp = {"status": 'error', "message": 'Something went wrong in alpetaServerLogin'}
            return resp
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServerLogin'}
        return resp


def get_terminals():
    try:
        req = requests.get(f"{Settings.config.base_url}/terminals?offset=0&limit=999999999", cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            print(ResultCode)
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success', "treminals": content}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def get_auth_image(IndexKey,UserID):
    try:
        # http://192.168.1.116:9004/v1/authLogs/202202000000009?
        # Settings.config.base_url}/authLogs?/{IndexKey}?searchCategory=user_id&searchKeyword=10&offset=-1&
        # http://192.168.1.116:9004/v1/authLogs/202202000000017?searchCategory=user_id&searchKeyword=10&offset=0&
        # print(IndexKey,UserID,f"{Settings.config.base_url}/authLogs?/{IndexKey}?searchCategory=user_id&searchKeyword={UserID}&offset=0&")
        # http://192.168.1.116:9004/v1/authLogs/202202000000005?searchCategory=all&searchKeyword=&offset=0&

        if UserID:
            print(IndexKey, UserID)
            req = requests.get(
                f"{Settings.config.base_url}/authLogs/{IndexKey}?searchCategory=user_id&searchKeyword={UserID}&offset=0&",
                cookies=Login_cookie())
        else:
            print(IndexKey, UserID)
            req = requests.get(
                f"{Settings.config.base_url}/authLogs/{IndexKey}?searchCategory=all&searchKeyword=&offset=0&",
                cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        print(content)
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success', "Authlog_image": content}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong while fetching Authlog'}
            return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        resp = {"status": 'error', "message": 'Exception occured in Server while fetching Authlog' + str(e)}
        return resp


def get_auth(start_date_time, end_date_time):
    try:
        req = requests.get(
            f"{Settings.config.base_url}/authLogs?startTime=" + start_date_time + "&endTime=" + end_date_time +
            "&offset=0&limit=999999999&groupID=0&searchCategory=all&", cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success', "Authlog": content}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong while fetching Authlog'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": 'Exception occured in Server while fetching Authlog' + str(e)}
        return resp


def get_terminal_details(id):
    try:
        req = requests.get(f"{Settings.config.base_url}/terminals/{id}?apbflag=true&imageflag=true",
                           cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        # print(f"{Settings.config.base_url}/{id}?apbflag=true&imageflag=true")
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success', "details": content}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def Edit_terminal(id, json_data):
    try:
        req = requests.put(f"{Settings.config.base_url}/terminals/{id}", cookies=Login_cookie(), json=json_data)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        # print(f"{Settings.config.base_url}/{id}?apbflag=true&imageflag=true")
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success'}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def Get_Employee_details(employee_id):
    try:
        query = Users.query.filter_by(employee_id=employee_id).first()
        usr_schema = User_schema()
        output = usr_schema.dump(query)
        response = {"status": 'success', "message": 'Account details fetched successfully', "user_data": output}
        return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)}'}
        return response

def Get_All_Employee_Id():
    try:
        query = Users.query.with_entities(Users.id).all()
        usr_schema = User_schema(many=True)
        output = usr_schema.dump(query)
        # response = {"status": 'success', "message": 'Details fetched successfully', "user_id_data": output}
        return output
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)}'}
        return response

def get_terminal_information(id):
    try:
        req = requests.get(f"{Settings.config.base_url}/terminals/{id}", cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                return content
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def put_user_details(user_id, payload_json):
    req = requests.put(f"{Settings.config.base_url}/users/{user_id}",
                       cookies=Login_cookie(), json=payload_json)
    status = req.status_code
    content = json.loads(req.content.decode("utf-8"))
    if status == 200:
        ResultCode = content['Result']['ResultCode']
        if ResultCode == 0:
            response = {'status': 'success', "message": 'User updated successfully', 'user_details': content}
            return response
        else:
            response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
            return response
    else:
        response = {"status": 'error', "message": 'Something went wrong in alpetaServer while updating user details'}
        return response


def get_user_details(user_id):
    req = requests.get(f"{Settings.config.base_url}/users/{user_id}?fingerprint=false&face=false&picture=false",
                       cookies=Login_cookie())
    status = req.status_code
    content = json.loads(req.content.decode("utf-8"))
    if content.get('UserCardInfo'):
        content['UserCardInfo'][0]['UserID'] = user_id
    if status == 200:
        ResultCode = content['Result']['ResultCode']
        if ResultCode == 0:
            response = {'status': 'success', "message": 'success fetching user details', 'user_details': content}
            return response
        elif ResultCode == 4:
            response = {'status': 'success', "message": 'success fetching user finger details', 'user_finger': content}
            return response
        else:
            response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
            return response
    else:
        response = {"status": 'error', "message": 'Something went wrong in alpetaServer while fetching user details'}
        return response


def get_user_finger(user_id):
    req = requests.get(f"{Settings.config.base_url}/users/{user_id}/fingerPrint",
                       cookies=Login_cookie())
    status = req.status_code
    content = json.loads(req.content.decode("utf-8"))
    user_finger = content.get('UserFPInfo', [])
    if user_finger:
        for each in content['UserFPInfo']:
            each['UserID'] = user_id

    if status == 200:
        ResultCode = content['Result']['ResultCode']
        if ResultCode == 0:
            response = {'status': 'success', "message": 'success fetching user finger details', 'user_finger': content}
            return response
        elif ResultCode == 4:
            response = {'status': 'success', "message": 'success fetching user finger details', 'user_finger': content}
            return response
        else:
            response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
            return response
    else:
        response = {"status": 'error', "message": 'Something went wrong in alpetaServer while fetching user finger '
                                                  'details'}
        return response


def get_user_face(user_id):
    req = requests.get(f"{Settings.config.base_url}/users/{user_id}/faceWTInfo",
                       cookies=Login_cookie())
    status = req.status_code
    content = json.loads(req.content.decode("utf-8"))
    user_face = content.get('UserFaceWTInfo', [])
    if user_face:
        for each in content['UserFaceWTInfo']:
            each['UserID'] = user_id

    if status == 200:
        ResultCode = content['Result']['ResultCode']
        if ResultCode == 0:
            response = {'status': 'success', "message": 'success fetching user face details', 'user_face': content}
            return response
        elif ResultCode == 4:
            response = {'status': 'success', "message": 'success fetching user finger details', 'user_face': content}
            return response
        else:
            response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
            return response
    else:
        response = {"status": 'error', "message": 'Something went wrong in alpetaServer while fetching user face '
                                                  'details'}
        return response


def get_next_user_id():
    req = requests.get(f"{Settings.config.base_url}/users/initUserInfo", cookies=Login_cookie())
    status = req.status_code
    content = json.loads(req.content.decode("utf-8"))
    if status == 200:
        ResultCode = content['Result']['ResultCode']
        if ResultCode == 0:
            response = {'status': 'success', "message": 'success', 'user_id': content}
            return response
        else:
            response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
            return response
    else:
        response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
        return response


def Assign_userToTerMiNaLs(terminalID, userID):
    try:
        json_data = {"DownloadInfo": {"Total": 1, "Offset": 1}}
        req = requests.post(f"{Settings.config.base_url}/terminals/{terminalID}/users/{userID}", cookies=Login_cookie(),
                            json=json_data)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {'status': 'success', "message": 'success'}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def Delete_userToTerMiNaLs(terminalID, userID):
    try:
        json_data = {"DownloadInfo": {"Total": 1, "Offset": 1}}
        # v1 / terminals / 1 / users / 1
        req = requests.delete(f"{Settings.config.base_url}/terminals/{terminalID}/users/{userID}",
                              cookies=Login_cookie(),
                              json=json_data)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {'status': 'success', "message": 'success'}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def scanFingerPrint(terminal_id, alpeta_user_id, alpeta_figerprint_id):
    try:
        terminal_id = terminal_id
        alpeta_user_id = alpeta_user_id
        alpeta_figerprint_id = alpeta_figerprint_id

        req = requests.get(f"{Settings.config.base_url}/terminals/{terminal_id}/scan/fp_image?regcount=1&regtimeout=15"
                           f"&UserID={alpeta_user_id}&FingerID={alpeta_figerprint_id}", cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": "success", "message": "Fingerprint captured successfully.",
                            "dmFPImage": content['dmFPImage']}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return resp


def scanFaceData(terminal_id):
    try:
        terminal_id = terminal_id
        req = requests.get(f"{Settings.config.base_url}/terminals/{terminal_id}/scan/facewt?capture_timeout=30"
                           , cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'Face data captured successfully.', "UserFaceWTInfo":
                    content['UserFaceWTInfo']}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def scanCardData(terminal_id):
    try:
        terminal_id = terminal_id
        req = requests.get(f"{Settings.config.base_url}/terminals/{terminal_id}/scan/card", cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'Card captured successfully.',
                            "CardData": content["CardData"]}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def Update_USER_ProfilePIC(alpeta_id, user_id, image_str, type):
    try:
        json_data = {"ImageType": type,
                     "Picture": image_str.split(",")[-1]}
        req = requests.put(f"{Settings.config.base_url}/users/{alpeta_id}/picture", cookies=Login_cookie(),
                           json=json_data)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                # Users.query.filter(Users.id == user_id).update(
                #     {Users.profile_picture: image_str.split(",")[-1], Users.alpeta_updated_date: current_timestamp,
                #      Users.updated_at: current_timestamp})
                # db.session.flush()
                # db.session.commit()
                user_images.Add_profile_image(user_id, image_str.split(",")[-1], "active")
                download_to_terminal = User_terminals.Get_Terminals_by_userID_blacklist_status_(user_id)
                for each_terminal in download_to_terminal:
                    # download User to a specific terminal
                    Assign_userToTerMiNaLs(each_terminal, alpeta_id)

                response = {"status": 'success', "message": 'Profile picture updated'}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def Update_USER_Card(alpeta_id, user_id, cardnum):
    try:
        global current_timestamp
        current_timestamp = datetime.datetime.now()
        json_data = [
            {
                "CardNum": cardnum
            }
        ]
        req = requests.put(f"{Settings.config.base_url}/users/{alpeta_id}/card", cookies=Login_cookie(),
                           json=json_data)
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                User_cards.query.filter(User_cards.user_id == user_id).update({User_cards.cardnum: cardnum,
                                                                               User_cards.updated_at: current_timestamp})
                db.session.flush()
                db.session.commit()
                Users.query.filter(Users.employee_id == str(alpeta_id)).update(
                            {
                             Users.updated_at: current_timestamp,
                             Users.alpeta_updated_date: current_timestamp
                             })
                db.session.flush()
                db.session.commit()
                download_to_terminal = User_terminals.Get_Terminals_by_userID_blacklist_status_(user_id)
                for each_terminal in download_to_terminal:
                    # download User to a specific terminal
                    Assign_userToTerMiNaLs(each_terminal, alpeta_id)

                response = {"status": 'success', "message": 'Card Number updated'}
                return response
            else:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def Get_USER_Info_from_TerminalID(id):
    try:
        req = requests.get(Settings.config.base_url + "/terminalUsers/" + str(id) + "/info?offset=0&limit=99",
                           cookies=Login_cookie())
        # req = requests.get("http://14.140.119.59:9004/v1/terminalUsers/2/info?offset=0&limit=99",cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        # print(content)
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            # print(ResultCode)
            # print(hex(ResultCode))
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success', "users": content}
                return response
            elif ResultCode != 0:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                # print(response)
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def Delete_USER_from_Terminal(TerminalID, User_id):
    try:
        # req = requests.delete(Settings.config.base_url + "/terminals/"+ str(TerminalID)+"/users/" + str(User_id),cookies=Login_cookie())
        req = requests.delete(f"{Settings.config.base_url}/terminals/{TerminalID}/users/{User_id}",
                              cookies=Login_cookie())
        status = req.status_code
        content = json.loads(req.content.decode("utf-8"))
        if status == 200:
            ResultCode = content['Result']['ResultCode']
            if ResultCode == 0:
                response = {"status": 'success', "message": 'success'}
                return response
            elif ResultCode != 0:
                response = {'status': 'error', "message": 'alpetaServerError. Error Code: ' + str(ResultCode)}
                return response
        else:
            response = {"status": 'error', "message": 'Something went wrong in alpetaServer'}
            return response
    except Exception as e:
        response = {"status": 'error', "message": f'{str(e)} : Exception occured in alpetaServer'}
        return response


def FingerPrintmaster():
    try:
        All_data = Finger_masters.query.all()
        fingerprint_schema = Finger_masters_schema(many=True)
        output = fingerprint_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp


def DesignationMaster():
    try:
        All_data = Designations.query.filter(Designations.status != 'delete').order_by(asc(Designations.name)).all()
        designation_schema = Designations_schema(many=True)
        output = designation_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp


def ShiftMasters():
    try:
        All_data = Shifts.query.filter(Shifts.status != 'delete').all()
        shift_schema = Shifts_schema()
        shift_schema = Shifts_schema(many=True)
        output = shift_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp


def GroupMaster():
    try:
        All_data = Group.query.filter(Group.status != 'delete').order_by(Group.name).all()
        GroupSchema = Group_schema()
        GroupSchema = Group_schema(many=True)
        output = GroupSchema.dump(All_data)
        final_data_list = []
        for i in output:
            i['terminal_Count'] = len(Group_terminals.GET_TerminalsDEtails_BY_GRoupID(i['id']))
            final_data_list.append(i)
        return final_data_list

    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp


def SubAreaMasters():
    try:
        All_data = Subarea.query.filter(Subarea.status != 'delete').order_by(asc(Subarea.name)).all()
        subarea_schema = Subarea_schema(many=True)
        output = subarea_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp


def VendorMaster():
    try:
        All_data = Vendors.query.filter(Vendors.status != 'delete').all()
        vendor_schema = Vendors_schema(many=True)
        output = vendor_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp

def DepartmentMaster():
    try:
        All_data = Department.query.filter(Department.status != 'delete').order_by(Department.shop_name).all()
        department_schema = Department_schema()
        department_schema = Department_schema(many=True)
        output = department_schema.dump(All_data)
        return output
    except Exception as e:
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp











# def UnitsBySubAreaID(subarea_id):
#     try:
#         All_data = Units.Units_by_SubAreaID(subarea_id)
#         unt_schema = Units_schema()
#         output = unt_schema.dump(All_data)
#         respone = {"status": 'success', "message": "Success", "units": output}
#         return respone
#     except Exception as e:
#         resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
#         return resp


def Paginate(data, page=1, page_size=10):
    if int(page) == 1:
        return data[0: int(page) + int(page_size) - 1]
    else:
        _page = int(page) - 1
        return data[_page * int(page_size):int(page) * int(page_size)]


def list_auth_info(data):
    auth_info = {"FAW": 9, "FP": 1, "CD": 2, "PW": 3}
    result = []

    data = json.loads(data)

    for each in range(7):
        if each < len(data["authentication_combination"]):
            result.append(auth_info[data["authentication_combination"][each]["value"]])
        else:
            result.append(0)

    if data["authentication_mode"] == "AND":
        result.append(len(data["authentication_combination"]))
    elif data["authentication_mode"] == "OR":
        result.append(0)

    return result


def query_processor(json_data, role_id, offset):
    query = f"select * from users where role_id={role_id} "
    if json_data["status"] == "not deleted":
        query += " and status != 'delete' "
    if json_data["status"] == "active":
        query += " and status = 'active'"
    if json_data["status"] == "inactive":
        query += " and status = 'inactive'"
    if json_data["alpeta_user_id"] == "not null":
        query += " and alpeta_user_id is NOT Null "
    if json_data["alpeta_user_id"] == "null":
        query += " and alpeta_user_id is Null "
    if json_data["biometric_reg"] == True:
        query += " and alpeta_user_id is NOT NULL "
    if json_data["Alpeta_Reg_date"] == True:
        query += f" and (alpeta_created_date BETWEEN '{json_data['start_date']}' AND '{json_data['end_date']}') "
    return query


#
# def checkTerminalsFor_Dublicate(NewGroup_ID, TerminalID_List):
#     groupID = []
#     for i in TerminalID_List:
#         detls = Group_terminals.GET_GroupID_BY_terminalID(i)
#         groupID.extend(detls)
#     if NewGroup_ID in groupID:
#         return True
#     else:
#         return False


def Check_Parameter_Data(data):
    if not data:
        return None
    return data

def dif(li1, li2):
    return list(set(li1) - set(li2)) + list(set(li2) - set(li1))

#### Shifts fn

def Create_Shifts(name, code, shift_start_time, shift_end_time, status):
    return Shifts.Add_shifts(name, code, shift_start_time, shift_end_time, status)


def Update_Shifts(id, name, code, shift_start_time, shift_end_time, status):
    return Shifts.Update_Shifts(id, name, code, shift_start_time, shift_end_time, status)


def Status_update_Shifts(id, status):
    return Update_Shifts(id, status)


def Delete_Shifts(id):
    return Shifts.Delete(id)


# Designations

def Create_Designations(name, code, status):
    return Designations.Add_Designations(name, code, status)


def Update_Designations(id, name, code, status):
    return Designations.Update_Designation(id, name, code, status)


def Status_update_Designations(id, status):
    return Designations.Change_Status(id, status)


def Delete_Designations(id):
    return Designations.Delete(id)

def CrFormMaster(form_shortcode, code):
    try:
        query = f"select max(CAST(SPLIT_PART(unique_id, '_', 3) AS integer)) from cr_info"
        # select max(CAST(SPLIT_PART(unique_id, '_', 4) AS integer)) from cr_info where unique_id like 'CR_B2_4900012374%'
        data = db.session.execute(query)
        #CrFormSchema = cr_info_schema()
        output = [row[0] for row in data][0]
        
        #print("cr formsssssssssssssssssssssssssssssss",[row[0] for row in data])
        cr_code = "CR_" + form_shortcode + "_" + str(
            int(output) + 1) if output else "CR_" + form_shortcode + "_100001"
        #print(cr_code)
        return code if code else cr_code
    except Exception as e:
        import traceback
        traceback.print_exc()
        resp = {"status": 'error', "message": f'{str(e)} : Exception occured'}
        return resp

def convert_database_to_alpeta_formate(user_finger, _id):
    UserFPdata = []
    for i in user_finger:
        FP_obj1 = {"FingerID": i['fingerid'], "MinConvType": 3, "Reserved": 0, "TemplateIndex": 1,
                   "TemplateData": i['template1'], "UserID": str(_id)}
        FP_obj2 = {"FingerID": i['fingerid'], "MinConvType": 3, "Reserved": 0,
                   "TemplateIndex": 2, "TemplateData": i['template2'], "UserID": str(_id)}
        UserFPdata.append(FP_obj1)
        UserFPdata.append(FP_obj2)
    return UserFPdata

# ## Units fn
#
# def Create_Units(subarea_id, code, name, description, status):
#     return Units.Add_Units(subarea_id, code, name, description, status)
#
#
# def Update_Units(id, subarea_id, code, name, description):
#     return Units.Update_Units(id, subarea_id, code, name, description)
#
#
# def Status_update_Units(id, status):
#     return Units.Change_Status(id, status)
#
#
# def Delete_Units(id):
#     return Units.Delete(id)


# # Sub area fn

def Create_Subarea(code, name, description, status):
    return Subarea.Add_Subarea(code, name, description, status, )


def Update_Subarea(id, code, name, description, status):
    return Subarea.Update_Subarea(id, code, name, description, status)


def Status_update_Subarea(id, status):
    return Subarea.Change_Status(id, status)


def Delete_Subarea(id):
    return Subarea.Delete(id)
    
# def save_file(file, filename):
#     try:
#         data = file

#         # Find out what the year, month, day and time is
#         now = datetime.datetime.now()
#         year = now.strftime("%Y")
#         month = now.strftime("%m")
#         day = now.strftime("%d")
#         time = now.strftime("%H:%M:%S")

#         # Add the time and the .txt extension as the filename
#         filename = filename

#         # Construct the path /var/www/html/grse1/grse1/static
#         #path = "/var/www/html/grse1/grse1/static/{0}/{1}/{2}/".format(year, month, day)
#         path1 = "static/{0}/{1}/{2}/".format(year, month, day)

#         # Check if the path exists. If it doesn't create the directories
#         if not os.path.exists(path1): #change required
#             os.makedirs(path1)#change required

#         # Create the file
#         file.save(os.path.join(path1, filename))

#         response = {"status": 'Success', "message": path1 + filename}
#         # print(response)
#         return response
#     except Exception as e:
#         response = {"status": 'Error', "message": f'{str(e)}'}
#         print(response)
#         return jsonify(response), 200

def change_permissions_recursive(path, mode = 0o777):
    for each in [path.rsplit('/', 2)[0],pathrsplit('/', 1)[0],path.rsplit('/', 0)[0]]:
        if not os.path.exists(each): #change required
            os.makedirs(each,stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)
    for root, dirs, files in os.walk(path, topdown=False):
        for dir in [os.path.join(root,d) for d in dirs]:
            os.chmod(dir, stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)
    for file in [os.path.join(root, f) for f in files]:
            os.chmod(file, stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)

def save_file(file, filename):
    try:
        data = file

        # Find out what the year, month, day and time is
        now = datetime.datetime.now()
        year = now.strftime("%Y")
        month = now.strftime("%m")
        day = now.strftime("%d")
        time = now.strftime("%H:%M:%S")

        # Add the time and the .txt extension as the filename
        filename = filename

        # Construct the path /var/www/html/grse1/grse1/static
        path = "/var/www/html/grse1/grse1/static/{0}/{1}/{2}/".format(year, month, day)
        #path = "static/{0}/{1}/{2}/".format(year, month, day)
        path1 = "static/{0}/{1}/{2}/".format(year, month, day)

        change_permissions_recursive(path)
        
        
        # Create the file
        file.save(os.path.join(path, filename))

        response = {"status": 'Success', "message": path1 + filename}
        # print(response)
        return response
    except Exception as e:
        response = {"status": 'Error', "message": f'{str(e)}'}
        print(response)
        return jsonify(response), 200


def finite_state_machine(present_state, permit_state):
    if present_state:
        #print("hwer",permit_state,present_state)
        l = list(permit_state.keys())  # make a list of the keys
        k = present_state  # the actual key
        i, j = l.index(k), permit_state[k]
        k = i + 1 if i + 1 < len(l) else 0  # select next index or restart 0
        n = l[k]
        # print(n, permit_state[n])
        m = i - 1 if i - 1 >= 0 else 0  # select previous index or go end
        p = l[m]
        # print(p, permit_state[p])
        return {"next_state": n,
                "next_list": permit_state[n],
                "previous_state": p,
                "previous_list": permit_state[p]}
    else:
        return []


def permit(costcenter):
    permit_level = {
        "clms_nodal_user": [],
        "clms_nodal_ajs": [],
        "clms_nodal_hr": [],
        "clms_nodal_secu": [],
        "Admin": []
    }
    user_permit = Department.get_department_by_costcenter(costcenter)
    #print("user_permit", user_permit, costcenter)
    for k, v in user_permit.items():
        try:
            hod = Users.FetchUSerDetails_By_employee_id(user_permit[k])["costcntr"]
            department = Department.get_department_by_costcenter(hod)
            hod_man = department["hod_man"]
            hod_functinal_area = department["hod_functional_area"]
            if k != "clms_nodal_user":
                permit_level[k].append(hod_man)
                permit_level[k].append(hod_functinal_area)
                permit_level[k].append(user_permit[k])
            if k == "clms_nodal_user":
                permit_level["clms_nodal_user"].append(user_permit[k])
                permit_level["clms_nodal_user"].append(hod_man)
                permit_level["clms_nodal_user"].append(hod_functinal_area)
        except Exception as e:
            permit_level["clms_nodal_user"].append(user_permit[k])
    #print("eikhane somosha", permit_level)
    return permit_level


def last_submitted(cr_code):
    output = {}
    cr_info = Cr_info.Fetch_cr_info(cr_code)[0]
    output = Users.FetchUSerDetails_By_employee_id(Cr_info.Fetch_cr_info(cr_code)[0]["last_updated_by"])
    output["role"] = Cr_info.Fetch_cr_info(cr_code)[0]["state"]
    output["submit_date"] = Cr_info.Fetch_cr_info(cr_code)[0]["created_at"]
    output["designation_during_submission"] = Cr_info.Fetch_cr_info(cr_code)[0]["designation"]
    output["current_designation"] = Designations.FetchDesignationDetails_By_ID(output["designation_id"])["name"] if output["designation_id"] else ""
    output["submit_revised"] = len(Cr_info.Fetch_revision(Cr_info.Fetch_cr_info(cr_code)[0]["last_updated_by"], cr_code))
    return output


def next_assigne(cr_code):
    output = {}
    cr_info = Cr_info.Fetch_cr_info(cr_code)[0]
    cost_center = Cr_info.Fetch_cr_info(cr_code)[0]["cost_center"]
    present_state = Cr_info.Fetch_cr_info(cr_code)[0]["state"]
    present_status = Cr_info.Fetch_cr_info(cr_code)[0]["status"]
    present_form_status = Cr_info.Fetch_cr_info(cr_code)[0]["form_status"]
    costcenter = Cr_info.Fetch_cr_info(cr_code)[0]["cost_center"]
    next_assgn = finite_state_machine(present_state, permit(costcenter))
    print("nexxt_assssgn", next_assgn)
    output["role"] = next_assgn["next_state"]
    result = list()
    new_dict = dict()
    if present_status != "correction" and present_status != "rejected":
        for each in next_assgn["next_list"]:
            print(present_form_status, "present_form_status--------")
            if each != "TEST" and present_form_status != "onboard":
                new_dict = Users.FetchUSerDetails_By_employee_id(each)
                new_dict["designation"] = Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"])["name"]
                new_dict["status"] = True if Department.get_department_by_costcenter(cost_center)[
                                                 next_assgn["next_state"]] == new_dict["employee_id"] else False
                result.append(new_dict)

            elif each != "TEST" and present_form_status == "onboard":
                new_dict = Users.FetchUSerDetails_By_employee_id(each)
                new_dict["designation"] = Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"])[
                    "name"]
                new_dict["status"] = True if Department.get_department_by_costcenter(cost_center)[
                                                 next_assgn["next_state"]] == new_dict["employee_id"] else False
                result.append(new_dict)


    elif present_status == "rejected":
        return {"permit": []}
    else:
        if present_status == "correction":
            for each in next_assgn["previous_list"]:
                print(present_form_status, "present_form_status--------")
                if each != "TEST" and present_form_status != "onboard":
                    new_dict = Users.FetchUSerDetails_By_employee_id(each)
                    new_dict["designation"] = Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"])[
                        "name"]
                    print(new_dict["employee_id"])
                    # print(Department.get_department_by_costcenter(cost_center)[next_assgn["next_state"]])
                    if next_assgn["next_state"] != 'Admin':
                        new_dict["status"] = True if Department.get_department_by_costcenter(cost_center)[
                                                         next_assgn["next_state"]] == new_dict["employee_id"] else False
                    else:
                        new_dict["status"] = False
                    result.append(new_dict)
                elif each != "TEST" and present_form_status == "onboard":
                    new_dict = Users.FetchUSerDetails_By_employee_id(each)
                    new_dict["designation"] = Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"])[
                        "name"]
                    new_dict["status"] = True if Department.get_department_by_costcenter(cost_center)[
                                                     next_assgn["next_state"]] == new_dict["employee_id"] else False
                    result.append(new_dict)

    print("resulttttt", result)
    return {"permit": list({x['status']: x for x in result}.values())}


def attachment_codes(cr_code, state):
    a_code = {
        "clms_nodal_user": "A1",
        "clms_nodal_ajs": "B1",
        "clms_nodal_hr": "C1",
        "clms_nodal_secu": "D1"
    }
    current_state = a_code[state]
    search_query = f"SELECT attachment_code FROM media_doc WHERE unique_id like '{cr_code}%' AND attachment_code like '{current_state[0]}%'" \
                   f"ORDER BY created_at DESC "
    data = db.session.execute(search_query)
    MediaDocSchema = media_doc_schema(many=True)
    output = MediaDocSchema.dump(data)
    if output:
        output = output[0]["attachment_code"]
    return output[0] + str(int(output[1:3]) + 1) if output else current_state
    
def form_state(cr_code):
    output = list()
    # print("present form state", Cr_info.Fetch_cr_info(cr_code))
    label = [each['state'] for each in Cr_info.Fetch_cr_info(cr_code)]
    status = [each['status'] for each in Cr_info.Fetch_cr_info(cr_code)]
    print(label, [each['status'] for each in Cr_info.Fetch_cr_info(cr_code)])
    state_ = ["clms_nodal_user", "clms_nodal_ajs", "clms_nodal_hr", "clms_nodal_secu"]
    for each_state in state_:
        for each in Cr_info.Fetch_cr_info(cr_code):
            present_state = each["state"]
            costcenter = each["cost_center"]
            next_assgn = finite_state_machine(present_state, permit(costcenter))
            print(next_assgn["next_state"], each["state"], each["status"])
            if each["state"] == "Admin" and label[0] != "Admin":
                break
            elif each_state not in [each_["label"] for each_ in output] and each_state == each["state"] and status[
                0] == "correction":
                state = {"label": each["state"], "status": each["status"] if each["status"] != "correction" \
                    else "pending", "date": each["created_at"]}
                output.append(state)
            elif each_state not in [each_["label"] for each_ in output] and each_state == each["state"] and status[
                0] != "rejected":
                state = {"label": each["state"], "status": each["status"] if each["status"] != "correction" \
                    else "current", "date": each["created_at"]}
                output.append(state)
            elif each["status"] == "correction" and each_state not in [each_["label"] for each_ in output] \
                    and each["state"] not in [each_["label"] for each_ in output] and status[0] == "correction" and \
                    status[0] != "rejected":
                state = {"label": next_assgn.get("previous_state"), "status": "current", "date": None}
                output.append(state)
            elif each["status"] == "correction" and each_state not in [each_["label"] for each_ in output] \
                    and each["state"] not in [each_["label"] for each_ in output] and status[0] != "correction" and \
                    status[0] != "rejected":
                if label[0] == each["state"] and label.count(each["state"]) <= 2:
                    state = {"label": next_assgn.get("next_state"), "status": "current", "date": None}
                    output.append(state)
                elif label.count(each["state"]) >= 2:
                    pass
                else:
                    state = {"label": each["state"], "status": "current", "date": None}
                    output.append(state)
            elif each["status"] == "rejected" and each_state not in [each_["label"] for each_ in output] \
                    and each["state"] not in [each_["label"] for each_ in output]:
                state = {"label": each["state"], "status": "rejected", "date": each["created_at"]}
                output.append(state)
                break
        if each_state not in [each["label"] for each in output] and "current" not in [each["status"] for each in
                                                                                      output] and status[
            0] != "rejected":
            state = {"label": each_state, "status": "current", "date": None}
            output.append(state)
        elif each_state not in [each["label"] for each in output]:
            state = {"label": each_state, "status": "pending", "date": None}
            output.append(state)
    print(output)
    state_no = {"clms_nodal_user": 0, "clms_nodal_ajs": 1, "clms_nodal_hr": 2, "clms_nodal_secu": 3, "Admin": 4}
    list_of_data_uniq = []
    for data in sorted(output, key=lambda x: state_no[x["label"]]):
        if data not in list_of_data_uniq:
            list_of_data_uniq.append(data)
    return list_of_data_uniq

def state_machine(cr_code):
    present_state = Cr_info.Fetch_cr_info(cr_code)[0]["state"]
    present_status = Cr_info.Fetch_cr_info(cr_code)[0]["status"]
    costcenter = Cr_info.Fetch_cr_info(cr_code)[0]["cost_center"]
    present_assgn = finite_state_machine(present_state, permit(costcenter))
    previous_assgn = finite_state_machine(present_assgn["previous_state"], permit(costcenter))
    next_assgn = finite_state_machine(present_assgn["next_state"], permit(costcenter))
    print("present_state", present_state)
    print("present_status", present_status)
    print("present_assign", present_assgn)
    print("previous_assign", previous_assgn)
    print("next_assign", next_assgn)
    print(present_assgn, "next_assign")
    next_state = next_assgn["next_state"] if next_assgn["next_state"] != "clms_nodal_user" else None
    next_list = list()
    previous_state = previous_assgn["previous_state"]
    previous_list = list()
    present_state = present_assgn["next_state"]
    present_list = list()
    for present_each in present_assgn["next_list"]:
        if present_each != "TEST" and present_status != "correction":
            present_dict = Users.FetchUSerDetails_By_employee_id(present_each)
            if Designations.FetchDesignationDetails_By_ID(present_dict["designation_id"]):
                present_dict["designation"] = Designations.FetchDesignationDetails_By_ID(present_dict["designation_id"])[
                    "name"]
            present_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                 present_assgn["next_state"]] == present_dict[
                                                 "employee_id"] else False
            present_list.append(present_dict)
    for present_each in present_assgn["previous_list"]:
        if present_each != "TEST" and present_status == "correction":
            present_dict = Users.FetchUSerDetails_By_employee_id(present_each)
            if Designations.FetchDesignationDetails_By_ID(present_dict["designation_id"]):
                present_dict["designation"] = Designations.FetchDesignationDetails_By_ID(present_dict["designation_id"])[
                    "name"]
            present_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                 present_assgn["previous_state"]] == present_dict[
                                                 "employee_id"] else False
            present_list.append(present_dict)
            present_state = present_assgn["previous_state"]
    for previous_each in previous_assgn["next_list"]:
        if previous_each != "TEST" and present_status != "correction" and present_state != "clms_nodal_user"\
                and present_assgn["next_state"] != previous_assgn["next_state"] :
            print("present_state", present_state)
            previous_dict = Users.FetchUSerDetails_By_employee_id(previous_each)
            if Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"]):
                previous_dict["designation"] = Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"])[
                    "name"]
            previous_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                  previous_assgn["next_state"]] == previous_dict[
                                                  "employee_id"] else False
            previous_list.append(previous_dict)
            previous_state = previous_assgn["next_state"]
    for previous_each in previous_assgn["previous_list"]:
        if present_status == "correction" and present_state != "clms_nodal_user" and previous_each != "TEST":
            previous_dict = Users.FetchUSerDetails_By_employee_id(previous_each)
            if Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"]):
                previous_dict["designation"] = Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"])[
                    "name"]
            previous_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                  previous_assgn["previous_state"]] == previous_dict[
                                                  "employee_id"] else False
            previous_list.append(previous_dict)
            previous_state = previous_assgn["previous_state"]
        elif present_assgn["next_state"] == previous_assgn["next_state"]:
            if present_status != "correction" and present_state != "clms_nodal_user" and previous_each != "TEST":
                previous_dict = Users.FetchUSerDetails_By_employee_id(previous_each)
                if Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"]):
                    previous_dict["designation"] = \
                        Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"])[
                            "name"]
                previous_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                      previous_assgn["previous_state"]] == previous_dict[
                                                      "employee_id"] else False
                previous_list.append(previous_dict)
                previous_state = previous_assgn["previous_state"]

    if next_assgn["next_list"] and next_assgn["next_state"] != 'clms_nodal_user':
        for next_each in next_assgn["next_list"]:
            if next_each != "TEST" and present_status != "correction":
                new_dict = Users.FetchUSerDetails_By_employee_id(next_each)
                if Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"]):
                    new_dict["designation"] = Designations.FetchDesignationDetails_By_ID(new_dict["designation_id"])[
                        "name"]
                new_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                 next_assgn["next_state"]] == new_dict["employee_id"] else False
                next_list.append(new_dict)
    for previous_each in previous_assgn["next_list"]:
        if previous_each != "TEST" and present_status == "correction":
            previous_dict = Users.FetchUSerDetails_By_employee_id(previous_each)
            if Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"]): 
                previous_dict["designation"] = \
                    Designations.FetchDesignationDetails_By_ID(previous_dict["designation_id"])[
                        "name"]
            previous_dict["status"] = True if Department.get_department_by_costcenter(costcenter)[
                                                  previous_assgn["next_state"]] == previous_dict[
                                                  "employee_id"] else False
            next_list.append(previous_dict)
            next_state = previous_assgn["next_state"]
    # import pprint
    # pprint.pprint({
    #     "next_state": next_state,
    #     "next_list": next_list,
    #     "previous_state": previous_state,
    #     "previous_list": previous_list,
    #     "present_state": present_state,
    #     "present_list": present_list
    # })
    return {
        "next_state": next_state ,
        "next_list": list({x['status']: x for x in next_list}.values()),
        "previous_state": previous_state,
        "previous_list": list({x['status']: x for x in previous_list}.values()),
        "present_state": present_state,
        "present_list": list({x['status']: x for x in present_list}.values())
    }
    
def update_dd(_unique_id,value):
    cr_dd_ = cr_dd.get_dd_by_form_id(_unique_id)
    try:
        if cr_dd_:
            for each in cr_dd_:
                dd.Add_dd(each["dcode"], each["d_value"], each["efrom"], each["eto"], each["cby"], each["dremarks"],
                          each["cby"]+"_"+each["did"].split("_",1)[1], each["cby"])
        response = {
            "status": "success",
            "message": "All data inserted to dd table successfully"}
        print(response)
        return response
    except Exception as e:
        response = {"status": 'Error', "message": f'{str(e)}'}
        print(response)
        return response
        
        
def fetch_remark(cr_code):
    remark = list()
    for each in Cr_info.Fetch_cr_info(cr_code):
        if each["last_updated_by"]:
            output = Users.FetchUSerDetails_By_employee_id(each["last_updated_by"])
            if output["designation_id"] and each["remark"]:
                remark.append({"dremarks": each["remark"],
                               "dremark_date": each["created_at"],
                               "designation_during_submission": each["designation"],
                               "current_designation": Designations.FetchDesignationDetails_By_ID(output["designation_id"])[
                                   "name"] if output["designation_id"] else None ,
                               "user_details": output})

    return remark
    
    
# def save_file_log(file, filename):
#     try:
#         data = file

#         # Find out what the year, month, day and time is
#         now = datetime.datetime.now()
#         year = now.strftime("%Y")
#         month = now.strftime("%m")
#         day = now.strftime("%d")
#         time = now.strftime("%H:%M:%S")

#         # Add the time and the .txt extension as the filename
#         filename = filename

#         # Construct the path
#         #path = "/var/www/html/grse1/grse1/static/onboard_vendor"
#         path = "static/onboard_vendor"

#         # Check if the path exists. If it doesn't create the directories
#         if not os.path.exists(path):
#             os.makedirs(path)

#         # Create the file
#         file.save(os.path.join(path, filename))

#         response = {"status": 'Success', "message": path + filename}
#         # print(response)
#         return response
#     except Exception as e:
#         response = {"status": 'Error', "message": f'{str(e)}'}
#         print(response)
#         return jsonify(response), 200 

def change_permissions_recursive(path, mode = 0o777):
    for each in [path.rsplit('/', 2)[0],path.rsplit('/', 1)[0],path.rsplit('/', 0)[0]]:
        if not os.path.exists(each): #change required
            os.makedirs(each,stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)
    for root, dirs, files in os.walk(path, topdown=False):
        for dir in [os.path.join(root,d) for d in dirs]:
            os.chmod(dir, stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)
    for file in [os.path.join(root, f) for f in files]:
            os.chmod(file, stat.S_IRWXU|stat.S_IRWXG|stat.S_IRWXO)

def save_file(file, filename):
    try:
        data = file

        # Find out what the year, month, day and time is
        now = datetime.datetime.now()
        year = now.strftime("%Y")
        month = now.strftime("%m")
        day = now.strftime("%d")
        time = now.strftime("%H:%M:%S")

        # Add the time and the .txt extension as the filename
        filename = filename

        # Construct the path /var/www/html/grse1/grse1/static
        path = "/var/www/html/grse1/grse1/static/{0}/{1}/{2}/".format(year, month, day)
        #path = "static/{0}/{1}/{2}/".format(year, month, day)
        path1 = "static/{0}/{1}/{2}/".format(year, month, day)

        change_permissions_recursive(path)
        
        
        # Create the file
        file.save(os.path.join(path, filename))

        response = {"status": 'Success', "message": path1 + filename}
        # print(response)
        return response
    except Exception as e:
        response = {"status": 'Error', "message": f'{str(e)}'}
        print(response)
        return jsonify(response), 200

        
def labour_onboard_count(unique_id):
    test_query = db.session.execute(
                        f"select unique_id  from cr_dd where cr_dd.dcode in ('vd_b1') and cr_dd.d_value in ('{unique_id}')")
    demog = cr_dd_schema(many=True)
    output = demog.dump(test_query)
    if len(output) == 0:
        return 0
    output = [a_dict["unique_id"] for a_dict in output]
    output.append(output[-1])
    fetchQuery2 =f"select * from cr_info where cr_info.unique_id in {tuple(output)} and form_status = 'onboard' ORDER BY unique_id, created_at DESC"
    #countQuery = f"SELECT COUNT(*) FROM (select * from cr_info where cr_info.id in {tuple(access_form)} and cr_info.form_status in ('{status}')) as cnt"
    data2 = db.session.execute(fetchQuery2)
    CrInfoSchema = cr_info_schema(many=True)
    access_form = CrInfoSchema.dump(data2)
    fetchQuery3 = f"select * from cr_info where cr_info.unique_id in {tuple(output)} and form_status = 'release' ORDER BY unique_id, created_at DESC"
    # countQuery = f"SELECT COUNT(*) FROM (select * from cr_info where cr_info.id in {tuple(access_form)} and cr_info.form_status in ('{status}')) as cnt"
    data3 = db.session.execute(fetchQuery3)
    CrInfoSchema = cr_info_schema(many=True)
    access_form_1 = CrInfoSchema.dump(data3)
    return len(access_form) - len(access_form_1)

def onboard_form(_unique_id, request_data):
    try:
        po_num = Cr_info.Fetch_cr_info(_unique_id)[0]["po_number"]
        cost_c = str(Cr_info.Fetch_cr_info(_unique_id)[0]["cost_center"])
        po_expire = po_master.Fetch_po_expiry_with_po_number(po_num)
        #print("problem----", po_expire, str(datetime.datetime.now().date()))
        code = _unique_id.split("_", 2)[1]
        if code == "B1":
            name = request_data.get("vendor_name")
            vd_code = request_data.get("vendor_code")
            if "scrum_id" in request_data.keys():
                vd_scrum_id = request_data.get('scrum_id')
            else:
                vd_scrum_id = None
            labour_limit = 0
            # logo = save_file_log(logo_img, filename)
            if po_expire["expiry"] > str(datetime.datetime.now().date()):
                if vendors.check_cr_form_if_exists_in_vendor(vd_code):
                    vendors.Add_vendors(name, vd_code, vd_scrum_id,
                                        None, labour_limit,
                                        _unique_id, 0, "active")
                else:
                    vendors.query.filter(vendors.vd_code == vd_code).update({
                        vendors.name: name,
                        vendors.vd_code: vd_code,
                        vendors.vd_scrum_id: vd_scrum_id,
                        vendors.is_deleted: 0,
                        vendors.updated_at: datetime.datetime.now()})
                    db.session.flush()
                    db.session.commit()
                response = {
                    "status": "success",
                    "message": "New Vendor added successfully"}
                return response

            elif po_expire["expiry"] <= str(datetime.datetime.now().date()):
                response = {
                    "status": "Error",
                    "message": "Unable to onboard Vendor due to Po Expire"}

            else:
                response = {
                    "status": "Error",
                    "message": "Unable to onboard Vendor something went wrong"}

        elif code == "B2":
            employee_id = request_data.get("employee_id")
            employment_type = "GRSE-CLMS"
            role_id = 2
            shift_id = 3
            full_name = request_data.get("full_name")
            employment_start_date = request_data.get("employment_start_date")
            employment_end_date = request_data.get("employment_end_date")
            Aadhar_No = request_data.get("aadhar")
            Vendor_code = request_data.get("vendor_code") if request_data.get("vendor_code") else None
            Pass_valid_upto = request_data.get("cl_pass_valid_upto")
            Pcc_validity = request_data.get("cl_pcc_validity")
            #  get_vendor_form_id_by_demog_id(_unique_id) print
            # get_vendor_labour_limit_by_demog_id(_unique_id) print
            # replace vendors.fetch_vendor_by_vendor_code(Vendor_code) with get_vendor_labour_limit_by_demog_id(_unique_id)
            # count users with demog  from vd_b1
            vd_b1 = cr_dd.get_vendor_form_id_by_demog_id(_unique_id)
            if labour_onboard_count(vd_b1) < cr_dd.get_vendor_labour_limit_by_demog_id(vd_b1) \
                    and str(datetime.datetime.now().date()) <= Pass_valid_upto and str(
                datetime.datetime.now().date()) <= Pcc_validity and str(datetime.datetime.now().date()) <= po_expire[
                "expiry"]:
                if Users.FetchUSerDetails_By_employee_id(employee_id):
                    data = Users.FetchUSerDetails_By_clms_id(employee_id)
                    if request_data.get("form_state_status") == "release":
                            Users.query.filter(Users.id == data["id"]).update({Users.vendor_id: None})
                            # Users.alpeta_created_date: current_timestamp})
                            db.session.flush()
                            db.session.commit()
                            response = {
                                "status": "success",
                                "message": " Labour released from the existing cost centre"}
                    elif request_data.get("form_state") == "transfer":
                        print("transfer", request_data.get("group_id"))
                        group_id = request_data.get("group_id")
                        #url = "https://grsebatchprocess.dev13.ivantechnology.in/autt/assign_user_terminals"
                        url = "http://10.181.111.60:8130/attg/assign_user_terminals"
                        data = Users.FetchUSerDetails_By_clms_id(employee_id)
                        print(data)
                        if data["alpeta_user_id"]:
                            payload = {"alpeta_user_id": int(data["alpeta_user_id"]), "user_id": int(data["id"]), "group_id": int(group_id), "status": "active"}
                            headers = {}
                            response_ = requests.request("POST", url, headers=headers, json=payload)
                            if response_.json()["status"] == "Success":
                                response = {"status": 'Success', "message": "labour assigned to new group is running"}
                                print(response,response_)
                            else:
                                response = {"status": 'Error', "message": "Unable to assigned to new group"}
                                print(response,response_)
                        else:
                            response = {"status": 'Error', "message": "Unable to assigned to new group cause user not registered in alpeta"}

                    else:
                        # costcntr , del adhar,del alpeta_user_id,del role_id, employment_end_date & employment_start_date from dmong
                        Users.query.filter(Users.id == data["id"]).update({Users.employee_id: employee_id,
                                                                           Users.costcntr: cost_c,
                                                                           Users.vendor_id: Vendor_code,
                                                                           Users.employment_type: employment_type,
                                                                           Users.full_name: full_name,
                                                                           Users.dob: cr_dd.get_cl_dob_by_demog_id(_unique_id),
                                                                           Users.gender: cr_dd.get_cl_gender_by_demog_id(_unique_id),
                                                                           Users.employment_start_date:cr_dd.get_cl_job_start_by_demog_id(_unique_id),
                                                                           Users.employment_end_date: cr_dd.get_cl_job_end_by_demog_id(_unique_id)})
                        # Users.alpeta_created_date: current_timestamp})
                        db.session.flush()
                        db.session.commit()
                        response = {
                            "status": "success",
                            "message": " Labour updated due to Labour id already exist "}
                else:

                    #employment_end_date & employment_start_date, pfno,esino,dob,gender, from dmong,costcntr
                    addedUser = Users(employee_id=employee_id,
                                      costcntr=cost_c,
                                      employment_type=employment_type,
                                      role_id=int(role_id),
                                      shift_id=int(shift_id),
                                      full_name=full_name,
                                      aadhaar=Aadhar_No,
                                      vendor_id=Vendor_code,
                                      employment_start_date=cr_dd.get_cl_job_start_by_demog_id(_unique_id),
                                      employment_end_date= cr_dd.get_cl_job_end_by_demog_id(_unique_id),
                                      # profile_picture=profile_picture,
                                      alpeta_user_id=None,
                                      designation_id=None,
                                      dob=cr_dd.get_cl_dob_by_demog_id(_unique_id),
                                      gender=cr_dd.get_cl_gender_by_demog_id(_unique_id),
                                      nationality=None,
                                      marital_status=None,
                                      address=None,
                                      email=None,
                                      phone=None,
                                      esi_no=cr_dd.get_cl_esino_by_demog_id(_unique_id),
                                      pf_no=cr_dd.get_cl_pfno_by_demog_id(_unique_id),
                                      vd_scrum_id=None,
                                      scrum_wo_id=None,
                                      registration_done=None,
                                      employment_separation_date=None,
                                      alpeta_password=None,
                                      group_assign_date=None,
                                      group_updated_date=None,
                                      separation_reason=None,
                                      unit=None,
                                      cl_scrum_id=None,
                                      password=None,
                                      status='active',
                                      last_updated_by=None,
                                      last_update_date=None,
                                      is_deleted=0,
                                      created_at=datetime.datetime.now(),
                                      updated_at=None,
                                      alpeta_created_date=None,
                                      alpeta_updated_date=None,
                                      auth_comb="",
                                      group_id=None
                                      )
                    db.session.add(addedUser)
                    db.session.commit()
                    cr_dd.update_by_form_id(_unique_id, "cl_clms_id")

                    cr_dd.Add_cr_dd("cl_clms_id", employee_id, 1, None,
                                    str(1) + "_" + "cl_clms_id" + "_" + str(datetime.datetime.now().date()),
                                    1, _unique_id, "active")
                    #dd_table = update_dd(_unique_id, employee_id)
                    # print(dd_table,"lgSAFSAKFluisaf")
                    response = {
                        "status": "success",
                        "message": "New Labour added successfully"}
            elif Pass_valid_upto <= str(datetime.datetime.now().date()) and Pcc_validity <= str(
                    datetime.datetime.now().date()) and po_expire["expiry"] <= str(datetime.datetime.now().date()):
                response = {
                    "status": "Error",
                    "message": "something went wrong while onboard labour due to expired Pass_valid_upto or "
                               "Pcc_validity or Po_expire"}
            else:
                response = {
                    "status": "Error",
                    "message": "something went wrong while labour has exceed its labour limit"}
        else:
            response = {
                "status": "Error",
                "message": "Unable to onboard Labour something went wrong"}

        print(response)
        # print(Users.FetchUSerDetails_By_vendor_id(Vendor_code),"Users.FetchUSerDetails_By_vendor_id(Vendor_code)")
        # print(vendors.fetch_vendor_by_vendor_code(Vendor_code),"vendors.fetch_vendor_by_vendor_code(Vendor_code)")
        return response
    # except IntegrityError as err:
    #     import traceback
    #     traceback.print_exc()
    #     print(err,"hellllllllllp")
    #     error = str(err)
    #     response = {"status": 'Error', "message": f'{error} . Please check Employee ID & Aadhaar details'}
    except Exception as e:
        import traceback
        traceback.print_exc()
        response = {"status": 'Error', "message": f'{str(e.__dict__["orig"])} . Please check Employee ID & Aadhaar details'}
        print(response)
        return response


        
def form_details(cr_code):
    output = list()
    dcode = cr_dd.get_dd_by_form_id(cr_code)

    for each in dcode:
        data = {}
        demog_master = dm.get_demog_by_code(each["dcode"])
        print(demog_master)
        if demog_master != {} and cr_demog_groups.Fetch_cr_demog(demog_master["id"]):
            data["group_name"] = \
                cr_groups.Fetch_cr_group_by_groupid(cr_demog_groups.Fetch_cr_demog(demog_master["id"])["group_id"])["name"]
            data["logs"] = {"label": demog_master["name"], "value": each["d_value"],
                            "verified": True if each["status"] == "active" else False,
                            "user_details": each["user_details"],
                            "demog_details": each,
                            "demog_master": dm.get_demog_by_code(each["dcode"]),
                            "date": each["con"]}
            print(data)
            output.append(data)
        else:
            continue
    print(output)
    import itertools
    from operator import itemgetter
    data = sorted(output, key=itemgetter('group_name'))
    new_list = []

    for key, value in itertools.groupby(data, key=itemgetter('group_name')):
        new_dict = {}
        print (key)
        new_dict["group_name"] = key
        small_list = []
        small_list2 = []
        for i in value:
            #print (i.get('logs'))
            small_list.append(i.get('logs'))
        for k, v in itertools.groupby(sorted(small_list, key=itemgetter('label')), key=itemgetter('label')):
            n_dict = {}
            n_dict["questions"] = k
            s_list = []
            for j in v:
                #print(j)
                s_list.append(j)
            n_dict["logs"]=s_list
            small_list2.append(n_dict)
        new_dict["demog"]= small_list2
        new_list.append(new_dict)
    return new_list

def user_Access(U):
    @wraps(U)
    def wrapper(*args, **kwargs):
        token = request.headers.get('token')
        print(token)
        try:
            decoded_token = jwt.decode(token, current_app.config['USER_SECRET_KEY'], algorithms=['HS256'])
            print(decoded_token)
            print("user Verified")
            return U(*args, **kwargs)
        except Exception as e:
            return jsonify({"AUTH ERROR": "USER AUTHORISATION REQUIRED"}), 401

    return wrapper
    
def form_heading_concat(_unique_id):
    code = _unique_id.split("_", 2)[1]
    if code == "B1":
        company_name = cr_dd.get_demog_value_by_demog_id(_unique_id, "vd_company_name")
        vendor_po = cr_dd.get_demog_value_by_demog_id(_unique_id, "vd_po")
        vendor_code = cr_dd.get_demog_value_by_demog_id(_unique_id, "vd_vendor_code")
        return company_name.get("d_value", None) + "|" + vendor_po.get("d_value", None) + "|" + vendor_code.get(
            "d_value", None)
    elif code == "B2":
        company_unique = cr_dd.get_demog_value_by_demog_id(_unique_id, "vd_b1")
        company_name = cr_dd.get_demog_value_by_demog_id(company_unique.get("d_value", None), "vd_company_name")
        labour_name = cr_dd.get_demog_value_by_demog_id(_unique_id, "cl_name")
        aadhar = cr_dd.get_demog_value_by_demog_id(_unique_id, "cl_aadhaar")
        return company_name.get("d_value", None) + "|" + labour_name.get("d_value", None) + "|" + aadhar.get("d_value",None)


        
