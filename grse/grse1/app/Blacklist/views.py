import traceback
from pymongo.errors import DuplicateKeyError, BulkWriteError
from helpers import *
from app import *
from app.Models import *
from flask.views import MethodView
from flask import Blueprint, send_file, url_for
import copy
from app.m_models import *
from datetime import datetime
from bson import json_util
import time

Blacklist_view = Blueprint('blacklist_view', __name__)


class CreateBlacklist(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/CreateBlacklist.yaml', methods=['POST'])
    def post(self):
        try:
            current_timestamp = datetime.now()
            request_data = request.get_json(force=True)
            _id = request_data['id']
            user_id = request_data['user_id']
            user_id_alpeta = request_data['alpeta_id']
            terminal_id = request_data['terminal_id']
            block_from = request_data['block_from']
            block_to = request_data['block_to']

            is_block = 1  # Inactive
            user_ = Users.FetchUSerDetails_By_ID(user_id)  # get user details from database
            user_["profile_picture"] = user_images.FetchProfileImage(_user_id=user_id).get("profile_picture", "")
            user_finger = User_fingerprints.FetchUserFingerPrintDetails_By_ID(user_id)  # get user finger from database
            user_finger = convert_database_to_alpeta_formate(user_finger, user_id)  # convert to Alp-eta structure
            user_face = User_facedatas.FetchUserfacedatas_By_ID(user_id)  # get user face from database
            if user_:
                user_details_alpeta = get_user_details(user_id_alpeta)  # get user details Alp-eta
                user_finger_alpeta = get_user_finger(user_id_alpeta)  # get user finger details Alp-eta
                user_face_alpeta = get_user_face(user_id_alpeta)  # get user face details Alp-eta
                Alpeta_terminal = Terminals.FetchTerminals_By_AlpetaID(terminal_id)["id"]
                if user_details_alpeta['status'] == 'success':
                    user_info = user_details_alpeta['user_details']
                    user_info['UserInfo']['AuthInfo'] = list_auth_info(user_["auth_comb"]) if user_["auth_comb"] else [
                        9, 2, 0, 0, 0, 0, 0, 2]
                    user_info['UserInfo']["Picture"] = user_["profile_picture"]
                    card_info = user_info.get('UserCardInfo', [])
                    if card_info:
                        user_info['UserCardInfo'][0]['UserID'] = user_id
                    user_info['UserFPInfo'] = user_finger_alpeta['user_finger'].get('UserFPInfo', user_finger)
                    user_info["UserFaceWTInfo"] = user_face_alpeta['user_face'].get("UserFaceWTInfo", [{
                        "UserID": user_face.get("user_id", ""),
                        "TemplateSize": user_face.get("templatesize", ""),
                        "TemplateData": user_face.get("templatedata", ""),
                        "TemplateType": user_face.get("templatetype", "")
                    }])
                    # Memory copy of the object
                    user_info_copy = copy.deepcopy(user_info)
                    user_info_copy['UserInfo']["BlackList"] = is_block
                    user_info_copy['UserInfo']['CreateDate'] = block_from if block_from \
                        else str(current_timestamp)
                    user_info_copy['UserInfo']["ExpireDate"] = block_to if block_to \
                        else str(datetime.strptime("2099-12-06 10:33:06", "%Y-%m-%d %H:%M:%S"))
                    user_info_copy['UserInfo']["UsePeriodFlag"] = 1
                    update_user_details = put_user_details(user_id_alpeta, user_info_copy)
                    if update_user_details['status'] == 'success':
                        # download User to a specific terminal
                        assign_user = Assign_userToTerMiNaLs(terminal_id, user_id_alpeta)
                        # update user back to the Alpeta
                        update_user_details_back = put_user_details(user_id_alpeta, user_info)
                        if assign_user['status'] == 'success' and update_user_details_back['status'] == 'success':
                            try:
                                data = User_terminals.Update_User_terminals(_id,
                                                                            user_id,
                                                                            Alpeta_terminal,
                                                                            is_block,
                                                                            datetime.strptime(block_from,
                                                                                              "%Y-%m-%d %H:%M:%S"),
                                                                            datetime.strptime(block_to,
                                                                                              "%Y-%m-%d %H:%M:%S"),
                                                                            current_timestamp)
                                respone = {"status": 'success',
                                           "message": "User Terminal database updated successfully &"
                                                      " User Inactivated/Blacklisted and "
                                                      "downloaded ",
                                           "user_terminals": {
                                               "Database status": "Database updated successfully" if data is None else data,
                                               "User details": update_user_details_back}}
                                return make_response(jsonify(respone)), 200
                            except Exception as e:
                                response = {"status": 'error', "message": f'{str(e)}'}
                                return make_response(jsonify(response)), 200
                        else:
                            respone = {"status": 'error', "message": "User Inactivated/Blacklisted successfully but "
                                                                       "failed to download to a specific terminal ",
                                       "user_update_details": update_user_details}
                            return make_response(jsonify(respone)), 200
                    else:
                        respone = {"status": 'error', "message": "User Inactivated/Blacklisted unsuccessfully ",
                                   "user_details_alpeta": "Error while Blacklisting user " + str(update_user_details)}
                        return make_response(jsonify(respone)), 200
                else:
                    respone = {"status": 'error', "message": "Error fetching user details or user not registered in "
                                                             "server",
                               "user_details_alpeta": user_details_alpeta}
                    return make_response(jsonify(respone)), 200

            else:
                respone = {"status": 'error', "message": "Error fetching user details or user not registered in DB",
                           "user_details_alpeta": user_}
                return make_response(jsonify(respone)), 200

        except Exception as e:
            traceback.print_exc()
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


class RevertBlacklist(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/RevertBlacklist.yaml', methods=['POST'])
    def post(self):
        try:
            current_timestamp = datetime.now()
            request_data = request.get_json(force=True)
            _id = request_data['id']
            user_id = request_data['user_id']
            terminal_id = request_data['terminal_id']
            block_from = request_data['block_from']
            block_to = request_data['block_to']
            user_id_alpeta = request_data['alpeta_id']
            is_block = 0  # Active
            user_ = Users.FetchUSerDetails_By_ID(user_id)  # get user details from database
            user_["profile_picture"] = user_images.FetchProfileImage(_user_id=user_id).get("profile_picture", "")
            user_finger = User_fingerprints.FetchUserFingerPrintDetails_By_ID(user_id)  # get user finger from database
            user_finger = convert_database_to_alpeta_formate(user_finger, user_id)  # convert to Alp-eta structure
            user_face = User_facedatas.FetchUserfacedatas_By_ID(user_id)  # get user face from database
            if user_:
                user_details_alpeta = get_user_details(user_id_alpeta)  # get user details Alp-eta
                user_finger_alpeta = get_user_finger(user_id_alpeta)  # get user finger details Alp-eta
                user_face_alpeta = get_user_face(user_id_alpeta)  # get user face details Alp-eta
                Alpeta_terminal = Terminals.FetchTerminals_By_AlpetaID(terminal_id)["id"]
                if user_details_alpeta['status'] == 'success':
                    user_info = user_details_alpeta['user_details']
                    user_info['UserInfo']['AuthInfo'] = list_auth_info(user_["auth_comb"]) if user_["auth_comb"] else [
                        9, 2, 0, 0, 0, 0, 0, 2]
                    user_info['UserInfo']["Picture"] = user_["profile_picture"]
                    card_info = user_info.get('UserCardInfo', [])
                    if card_info:
                        user_info['UserCardInfo'][0]['UserID'] = user_id
                    user_info['UserFPInfo'] = user_finger_alpeta['user_finger'].get('UserFPInfo', user_finger)
                    user_info["UserFaceWTInfo"] = user_face_alpeta['user_face'].get("UserFaceWTInfo", [{
                        "UserID": user_face.get("user_id", ""),
                        "TemplateSize": user_face.get("templatesize", ""),
                        "TemplateData": user_face.get("templatedata", ""),
                        "TemplateType": user_face.get("templatetype", "")
                    }])
                    user_info_copy = copy.deepcopy(user_info)
                    user_info_copy['UserInfo']["BlackList"] = is_block
                    user_info_copy['UserInfo']['CreateDate'] = block_from if block_from \
                        else str(current_timestamp)
                    user_info_copy['UserInfo']["ExpireDate"] = block_to if block_to \
                        else str(datetime.strptime("2099-12-06 10:33:06", "%Y-%m-%d %H:%M:%S"))
                    user_info_copy['UserInfo']["UsePeriodFlag"] = 0
                    update_user_details = put_user_details(user_id_alpeta, user_info_copy)
                    if user_ and user_["alpeta_user_id"]:
                        if update_user_details['status'] == 'success':
                            assign_user = Assign_userToTerMiNaLs(terminal_id, user_id_alpeta)
                            if assign_user['status'] == 'success':
                                try:
                                    data = User_terminals.Update_User_terminals(_id,
                                                                                user_id,
                                                                                Alpeta_terminal,
                                                                                is_block,
                                                                                datetime.strptime(block_from,
                                                                                                  "%Y-%m-%d %H:%M:%S"),
                                                                                datetime.strptime(block_to,
                                                                                                  "%Y-%m-%d %H:%M:%S"),
                                                                                current_timestamp)
                                    respone = {"status": 'success',
                                               "message": "User Terminal database updated successfully &"
                                                          " User activated/undo Blacklisting and "
                                                          "downloaded ",
                                               "user_terminals":
                                                   {
                                                       "Database status": "Database updated successfully" if data is None else data,
                                                       "User details": update_user_details}}
                                    return make_response(jsonify(respone)), 200
                                except Exception as e:
                                    response = {"status": 'error', "message": f'{str(e)}'}
                                    return make_response(jsonify(response)), 200


                            else:
                                respone = {"status": 'error',
                                           "message": "User activated/undo Blacklisting successfully but "
                                                      "failed to download to a specific terminal ",
                                           "user_update_details": update_user_details}
                                return make_response(jsonify(respone)), 200
                        else:
                            respone = {"status": 'error', "message": "User activated unsuccessfully ",
                                       "user_details_alpeta": "Error while activating user from Blacklist " + str(
                                           update_user_details)}
                            return make_response(jsonify(respone)), 200
                    else:
                        respone = {"status": 'error',
                                   "message": "Error fetching user details or user not registered in "
                                              "server",
                                   "user_details_alpeta": user_details_alpeta}
                        return make_response(jsonify(respone)), 200
            else:
                respone = {"status": 'error', "message": "Error fetching user details or user not registered in DB",
                           "user_details_alpeta": user_}
                return make_response(jsonify(respone)), 200

        except TypeError as e:
            respone = {"TypeError": f'{str(e)}'}
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'error', "message": f'{str(e)}'}
            return make_response(jsonify(response)), 200


def terminal_type(type, time):
    if type == "auto":
        if str(time) < "12:00:00":
            return "P10"
        else:
            return "P20"
    elif type == "in":
        return "P10"
    else:
        return "P20"


class Get_Auth_log(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/Authlog.yaml', methods=['GET'])
    def get(self, Date):
        try:
            current_timestamp = datetime.now()
            end_date_time = Date + "23:59:59"
            start_date_time = Date + "00:00:00"
            print(start_date_time, end_date_time, "eikhane", datetime.now())
            Get_auth = get_auth(str(start_date_time), str(end_date_time))
            print(Get_auth)
            user_in = list()
            user_out = list()
            auth_list = list()
            if Get_auth['Authlog']['AuthLogList']:
                for each in Get_auth['Authlog']['AuthLogList']:
                    if each["AuthResult"] == 0 and Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"]) and \
                            Users.FetchUSerDetails_By_alpeta_ID(each['UniqueID']):

                        terminal_info = str(Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])["terminal_type"])
                        if each['UniqueID'] not in user_in and terminal_type(terminal_info,
                                                                             each['EventTime'].split(" ")[1]) \
                                == "P10":
                            terminal_infor = str(
                                Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])["terminal_type"])
                            user_in.append(each['UniqueID'])
                            event_time = min([(each_['EventTime'].split(" ")[1], each_["TerminalID"],
                                               each_['ServerRecordTime']) for each_ in
                                              Get_auth['Authlog']['AuthLogList']
                                              if each_['UniqueID'] == each['UniqueID'] and each_["AuthResult"] == 0 and
                                              terminal_type(terminal_info, each['EventTime'].split(" ")[1]) \
                                              == "P10"]) if terminal_type(terminal_info,
                                                                          each['EventTime'].split(
                                                                              " ")[1]) == "P10" else 0
                            print(event_time, "min time")
                            event_date = datetime.strptime(each['EventTime'].split(" ")[0], '%Y-%m-%d')
                            server_time = datetime.strptime(event_time[2], '%Y-%m-%d %H:%M:%S')
                            auth_list.append({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                              "LDATE": event_date.strftime("%d.%m.%Y"),
                                              "LTIME": event_time[0],
                                              "SATZA": terminal_type(terminal_infor,
                                                                     each['EventTime'].split(" ")[1]),
                                              "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(event_time[1])[
                                                  "short_code"],
                                              "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S")})

                        elif each['UniqueID'] not in user_out and terminal_type(terminal_info,
                                                                                each['EventTime'].split(" ")[1]) \
                                == "P20":
                            user_out.append(each['UniqueID'])
                            terminal_infor = str(
                                Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])["terminal_type"])
                            event_time = max([(each_['EventTime'].split(" ")[1], each_["TerminalID"],
                                               each_['ServerRecordTime']) for each_ in
                                              Get_auth['Authlog']['AuthLogList']
                                              if each_['UniqueID'] == each['UniqueID'] and each_["AuthResult"] == 0 and
                                              terminal_type(terminal_info, each['EventTime'].split(" ")[1])
                                              == "P20"]) if terminal_type(terminal_info,
                                                                          each['EventTime'].split(" ")[
                                                                              1]) == "P20" else 0
                            print(event_time, "max time")
                            event_date = datetime.strptime(each['EventTime'].split(" ")[0], '%Y-%m-%d')
                            server_time = datetime.strptime(event_time[2], '%Y-%m-%d %H:%M:%S')
                            auth_list.append({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                              "LDATE": event_date.strftime("%d.%m.%Y"),
                                              "LTIME": event_time[0],
                                              "SATZA": terminal_type(terminal_infor,
                                                                     each['EventTime'].split(" ")[1]),
                                              "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(event_time[1])[
                                                  "short_code"],
                                              "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S")})
                if auth_list:
                    respone = {"status": 'Success', "message": "Authlog exported", "Auth_list": auth_list}
                    print(respone)
                    return make_response(jsonify(respone)), 200
                else:
                    respone = {"status": 'Error', "message": "Authlog not found for the following date",
                               "Authlog": "Authlog not exported", "Auth_list": auth_list}
                    print(respone)
                    return make_response(jsonify(respone)), 200

            else:
                respone = {"status": 'Error', "message": "Authlog not found for the following date",
                           "Authlog": "Authlog not exported", "Auth_list": auth_list}
                print(respone)
                return make_response(jsonify(respone)), 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


auth_type = {
    "1": "FP 1:N",
    "2": "FP 1:1",
    "3": "Password",
    "4": "RFCard",
    "5": "FA 1:N",
    "6": "FA 1:1",
    "7": "Mobilekey",
    "8": "QR"
}

auth_result = {
    "0": "Success",
    "1": "Failed",
    "2": "Blocked",
    "3": "Timeout",
    "4": "Capture Timeout",
    "5": "1:1 Timeout",
    "6": "Anti Passback",
    "9": "Threat",
    "10": "Invalid User"
}


class Get_All_Auth_log(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllAuthlog.yaml', methods=['GET'])
    def get(self):
        try:
            CurrentDatetime = datetime.now()
            yesterday = CurrentDatetime - timedelta(days=7)
            Date = yesterday.strftime("%Y-%m-%d")
            Datenew = CurrentDatetime.strftime("%Y-%m-%d")
            end_date_time = Datenew + CurrentDatetime.strftime("%H:%M:%S")
            start_date_time = Date + "00:00:00"

            #start_date_time = "2022-07-3000:00:00"
            #end_date_time = "2022-07-3011:59:59"

            print('Get_All_Auth_log - start_date_time', start_date_time)
            print('Get_All_Auth_log - end_date_time', end_date_time)

            Get_auth = get_auth(str(start_date_time), str(end_date_time))
            auth_list = list()
            db = database_connect_mongo()
            db = db["all_attendance"]
            db.create_index('IndexKey', unique=True)
            if Get_auth['Authlog']['AuthLogList']:
                for each in Get_auth['Authlog']['AuthLogList']:
                    server_time = each['ServerRecordTime']
                    server_time = datetime.strptime(server_time, '%Y-%m-%d %H:%M:%S')
                    event_date = datetime.strptime(each['EventTime'].split(" ")[0], '%Y-%m-%d')
                    # image = get_auth_image(str(each["IndexKey"]), str(each["UniqueID"]))
                    if Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"]):
                        terminal_info = str(Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])["terminal_type"])
                        if each["UserID"] and each["UniqueID"]:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                           "LDATE": event_date.strftime("%d.%m.%Y"),
                                           "LTIME": each['EventTime'].split(" ")[1],
                                           "SATZA": "",
                                           "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])[
                                               "short_code"],
                                           "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                           # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                           "Reference": terminal_type(terminal_info,
                                                                      each['EventTime'].split(" ")[1]),
                                           "SAP_sync_status": "",
                                           "SAP_sync_date_time": "",
                                           "Auth_result": auth_result.get(str(each["AuthResult"]), "Unknown"),
                                           "Auth_type": auth_type.get(str(each["AuthType"]), "Unknown"),
                                           "IndexKey": each["IndexKey"],
                                           "Raw": each})
                            except (DuplicateKeyError, BulkWriteError) as err:
                                continue

                        else:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                           "LDATE": event_date.strftime("%d.%m.%Y"),
                                           "LTIME": each['EventTime'].split(" ")[1],
                                           "SATZA": "",
                                           "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])[
                                               "short_code"],
                                           "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                           # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                           "Reference": terminal_type(terminal_info,
                                                                      each['EventTime'].split(" ")[1]),
                                           "SAP_sync_status": "",
                                           "SAP_sync_date_time": "",
                                           "Auth_result": auth_result.get(str(each["AuthResult"]), "Unknown"),
                                           "Auth_type": auth_type.get(str(each["AuthType"]), "Unknown"),
                                           "IndexKey": each["IndexKey"],
                                           "Raw": each})
                            except (DuplicateKeyError, BulkWriteError):
                                continue
                        auth_list.append(each)
                    else:
                        print("pass")
                        pass
                respone = {"status": 'Success', "message": "Authlog Saved to Database"}
                return make_response(jsonify(respone)), 200

            else:
                respone = {"status": 'Error', "message": "Authlog not found for the following date",
                           "Authlog": "Authlog was not Saved to Database"}
                print(respone)
                return make_response(jsonify(respone)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class Get_All_Auth_log_pg(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllAuthlogPG.yaml', methods=['GET'])
    def get(self):
        try:
            CurrentDatetime = datetime.now()
            yesterday = CurrentDatetime - timedelta(days=1)
            yesterday = yesterday.strftime("%Y-%m-%d")
            Date = CurrentDatetime.strftime("%Y-%m-%d")
            end_date_time = Date
            start_date_time = yesterday
            print(yesterday + ' 09:30:00', Date + ' 09:29:59')

            Filter = {
                'Raw.ServerRecordTime': {
                    '$gte': yesterday + ' 09:30:00',
                    '$lt': Date + ' 09:29:59'
                },
                'Auth_result': 'Success'
            }
            print(Filter)

            # yesterday = "2022-09-11"
            # Date = "2022-09-26"
            # print(yesterday + ' 00:00:00', Date + ' 23:59:59')
            #
            # Filter = {
            #     'Raw.ServerRecordTime': {
            #         '$gte': yesterday + ' 00:00:00',
            #         '$lt': Date + ' 23:59:59'
            #     },
            #     'Auth_result': 'Success'
            # }
            # print(Filter)

            nrdb = database_connect_mongo()
            nrdb = nrdb["all_attendance"]
            data = nrdb.find(filter=Filter)
            for each in data:
                t_attn_raw.Add_attn_raw(each["PERNR"], each["TIMR6"], each["CHOIC"],
                                        datetime.strptime(each["LDATE"], '%d.%m.%Y'),
                                        each["LTIME"], "", each["TERMINAL_id"],
                                        datetime.strptime(each["SERVER_TIME"], '%d.%m.%Y %H:%M:%S'),
                                        "", "")
            respone = {"status": 'Success', "message": "Authlog Saved to PG Database"}
            return make_response(jsonify(respone)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class Get_Attendance(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/Attendance.yaml', methods=['GET'])
    def get(self):
        try:
            nrdb = database_connect_mongo()
            nrdb = nrdb["all_attendance"]
            CurrentDatetime = datetime.now()
            Date = CurrentDatetime.strftime("%Y-%m-%d")
            Filter = {
                'Raw.ServerRecordTime': {
                    '$gte': Date + ' 00:00:00'
                },
                'Auth_result': 'Success'
            }
            begin_mongo = time.time()
            data = nrdb.find(filter=Filter)
            end_mongo = time.time()
            print("eventTime_mongo_data_fetch_operation",end_mongo - begin_mongo)
            user_ = list()
            
            auth_list = list()
            for each in data:
                if each["PERNR"] not in user_:
                    begin_user = time.time()
                    old_index_max = [each["IndexKey"] for each in
                                     nrdb.find({'SATZA': "P20", "PERNR": each["PERNR"],
                                                "Raw.ServerRecordTime": {'$gte': Date + " 00:00:00"}})]
                    end_old_max = time.time()
                    #print("eventTime_old_max", end_old_max - begin_old_max,each["PERNR"])
                    begin_old_min = time.time()
                    old_index_min = [each["IndexKey"] for each in
                                     nrdb.find({'SATZA': "P10", "PERNR": each["PERNR"],
                                                "Raw.ServerRecordTime": {'$gte': Date + " 00:00:00"}})]
                    end_old_min = time.time()
                    #print("eventTime_old_min", end_old_min - begin_old_min ,each["PERNR"] )
                    user_.append(each["PERNR"])
                    user_id = each["PERNR"]
                    try:
                        begin_new_max = time.time()
                        maxi = max((each["PERNR"], each["TIMR6"], each["CHOIC"], each["LDATE"],
                                    each["LTIME"], each["SATZA"], each["TERMINAL_id"], each["SERVER_TIME"],
                                    each["IndexKey"], each["Reference"], each["SAP_sync_status"],
                                    each["SAP_sync_date_time"])
                                   for each in nrdb.find(filter=Filter) if
                                   each["Reference"] == "P20" and each["PERNR"] == user_id)
                        end_new_max = time.time()
                        #print("eventTime_new_max", end_new_max - begin_new_max, each["PERNR"])
                        if len(old_index_max) != 0:
                            if old_index_max[0] != maxi[8]:
                                nrdb.update_one({'IndexKey': old_index_max[0]}, {"$set": {'SATZA': ""}}, upsert=True)
                                nrdb.update_one({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, upsert=True)
                            else:
                                print("pass")
                        else:
                            nrdb.update_one({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, upsert=True)
                        #print({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, "DB updated")

                        auth_list.append({'PERNR': maxi[0], 'TIMR6': maxi[1], "CHOIC": maxi[2],
                                          "LDATE": maxi[3],
                                          "LTIME": maxi[4],
                                          "SATZA": maxi[9],
                                          "TERMINAL_id": maxi[6],
                                          "SERVER_TIME": maxi[7]
                                          })
                    except (ValueError, TypeError):
                        print('empty list or invalid input P20')
                    try:
                        begin_new_min = time.time()
                        mini = min((each["PERNR"], each["TIMR6"], each["CHOIC"], each["LDATE"],
                                    each["LTIME"], each["SATZA"], each["TERMINAL_id"], each["SERVER_TIME"],
                                    each["IndexKey"], each["Reference"], each["SAP_sync_status"],
                                    each["SAP_sync_date_time"])
                                   for each in nrdb.find(filter=Filter) if
                                   each["Reference"] == "P10" and each["PERNR"] == user_id)
                        end_new_min = time.time()
                        #print("eventTime_new_min", end_new_min - begin_new_min , each["PERNR"])
                        if len(old_index_min) != 0:
                            if old_index_min[0] != mini[8]:
                                nrdb.update_one({'IndexKey': old_index_min[0]}, {"$set": {'SATZA': ""}}, upsert=True)
                                nrdb.update_one({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, upsert=True)
                            else:
                                print("pass")
                        else:
                            nrdb.update_one({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, upsert=True)
                        #print({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, "DB updated")
                        auth_list.append({'PERNR': mini[0], 'TIMR6': mini[1], "CHOIC": mini[2],
                                          "LDATE": mini[3],
                                          "LTIME": mini[4],
                                          "SATZA": mini[9],
                                          "TERMINAL_id": mini[6],
                                          "SERVER_TIME": mini[7]
                                          })
                    except (ValueError, TypeError):
                        print('empty list or invalid input P10')
                    end_user = time.time()
                    
                    
            respone = {"status": 'Success', "message": "Authlog Exported", "Auth_list": auth_list}
            print("eventTime_per_user", end_user - begin_user,user_id)
            return make_response(jsonify(respone)), 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class Get_All_Attendance(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/All_Attendance.yaml', methods=['GET'])
    def get(self):
        try:
            nrdb = database_connect_mongo()
            nrdb = nrdb["all_attendance"]
            CurrentDatetime = datetime.now()
            yesterday = CurrentDatetime - timedelta(days=1)
            Date = yesterday.strftime("%Y-%m-%d")
            Filter = {
                'Raw.ServerRecordTime': {
                    '$gte': Date + ' 00:00:00',
                    '$lt': Date + ' 23:59:59'
                },
                'Auth_result': 'Success'
            }
            begin_mongo = time.time()
            data = nrdb.find(filter=Filter)
            end_mongo = time.time()
            print("eventTime_mongo_data_fetch_operation_all",end_mongo - begin_mongo)
            user_ = list()
            auth_list = list()
            for each in data:
                if each["PERNR"] not in user_:
                    begin_user_all = time.time()
                    old_index_max = [each["IndexKey"] for each in
                                     nrdb.find({'SATZA': "P20", "PERNR": each["PERNR"],
                                                "Raw.ServerRecordTime": {'$gte': Date + " 00:00:00",
                                                                         '$lt': Date + " 23:59:59"}})]
                    end_old_max = time.time()
                    #print("eventTime_old_max_all", end_old_max - begin_old_max,each["PERNR"])
                    begin_old_min = time.time()
                    old_index_min = [each["IndexKey"] for each in
                                     nrdb.find({'SATZA': "P10", "PERNR": each["PERNR"],
                                                "Raw.ServerRecordTime": {'$gte': Date + " 00:00:00",
                                                                         '$lt': Date + " 23:59:59"}})]
                    end_old_min = time.time()
                    #print("eventTime_old_min_all", end_old_min - begin_old_min , each["PERNR"])
                    user_.append(each["PERNR"])
                    user_id = each["PERNR"]
                    try:
                        begin_new_max = time.time()
                        maxi = max((each["PERNR"], each["TIMR6"], each["CHOIC"], each["LDATE"],
                                    each["LTIME"], each["SATZA"], each["TERMINAL_id"], each["SERVER_TIME"],
                                    each["IndexKey"], each["Reference"], each["SAP_sync_status"],
                                    each["SAP_sync_date_time"])
                                   for each in nrdb.find(filter=Filter) if each["Reference"] == "P20"
                                   and each["PERNR"] == user_id)
                        end_new_max = time.time()
                        #print("eventTime_new_max_all", end_new_max - begin_new_max, each["PERNR"])
                        # print(old_index_max, maxi)
                        if len(old_index_max) != 0:
                            if old_index_max[0] != maxi[8]:
                                nrdb.update_one({'IndexKey': old_index_max[0]}, {"$set": {'SATZA': ""}}, upsert=True)
                                nrdb.update_one({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, upsert=True)
                            else:
                                print("pass")
                        else:
                            nrdb.update_one({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, upsert=True)
                        # print({'IndexKey': maxi[8]}, {"$set": {'SATZA': maxi[9]}}, "DB updated")

                        auth_list.append({'PERNR': maxi[0], 'TIMR6': maxi[1], "CHOIC": maxi[2],
                                          "LDATE": maxi[3],
                                          "LTIME": maxi[4],
                                          "SATZA": maxi[9],
                                          "TERMINAL_id": maxi[6],
                                          "SERVER_TIME": maxi[7]
                                          })
                    except (ValueError, TypeError):
                        print('empty list or invalid input P20')
                    try:
                        begin_new_min = time.time()
                        mini = min((each["PERNR"], each["TIMR6"], each["CHOIC"], each["LDATE"],
                                    each["LTIME"], each["SATZA"], each["TERMINAL_id"], each["SERVER_TIME"],
                                    each["IndexKey"], each["Reference"], each["SAP_sync_status"],
                                    each["SAP_sync_date_time"])
                                   for each in nrdb.find(filter=Filter) if each["Reference"] == "P10"
                                   and each["PERNR"] == user_id)
                        # print({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}})
                        end_new_min = time.time()
                        #print("eventTime_new_min_all", end_new_min - begin_new_min , each["PERNR"])
                        if len(old_index_min) != 0:
                            if old_index_min[0] != mini[8]:
                                nrdb.update_one({'IndexKey': old_index_min[0]}, {"$set": {'SATZA': ""}}, upsert=True)
                                nrdb.update_one({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, upsert=True)
                            else:
                                print("pass")
                        else:
                            nrdb.update_one({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, upsert=True)
                        # print({'IndexKey': mini[8]}, {"$set": {'SATZA': mini[9]}}, "DB updated")
                        auth_list.append({'PERNR': mini[0], 'TIMR6': mini[1], "CHOIC": mini[2],
                                          "LDATE": mini[3],
                                          "LTIME": mini[4],
                                          "SATZA": mini[9],
                                          "TERMINAL_id": mini[6],
                                          "SERVER_TIME": mini[7]
                                          })
                    except (ValueError, TypeError):
                        print('empty list or invalid input P10')
                    end_user_all = time.time()

            respone = {"status": 'Success', "message": "Authlog Exported", "Auth_list": auth_list}
            print("eventTime_per_user", end_user_all - begin_user_all,user_id)
            return make_response(jsonify(respone)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class Search_Attendance(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/SearchAttendance.yaml', methods=['POST'])
    def post(self, page):
        try:
            nrdb = database_connect_mongo()
            nrdb = nrdb["all_attendance"]
            request_data = request.get_json(force=True)
            employee_id = request_data['employee_id']  # Man number
            start_date = request_data['start_date']  # dd.mm.yyyy HH:MM:SS
            end_date = request_data['end_date']  # dd.mm.yyyy HH:MM:SS
            attendance_type = request_data['attendance']  # list ["P10","P20"]
            search_status = request_data['search_status']  # True or False
            page_no = request_data['pageno']  # Page No
            result = list()
            all_result = list()
            sort = list({'LDATE': -1}.items())
            if employee_id and start_date != end_date:
                Filter = {
                    'SATZA': {
                        '$in': attendance_type
                    },
                    'Raw.EventTime': {
                        '$gte': start_date,
                        '$lt': end_date
                    },

                    'PERNR': employee_id
                }
            elif employee_id and start_date == end_date:
                Filter = {
                    'SATZA': {
                        '$in': attendance_type
                    },
                    'Raw.EventTime': {
                        '$gte': start_date,
                    },

                    'PERNR': employee_id
                }
            elif start_date != end_date and not employee_id:
                Filter = {
                    'SATZA': {
                        '$in': attendance_type
                    },
                    'Raw.EventTime': {
                        '$gte': start_date,
                        '$lt': end_date
                    }
                }
            else:
                Filter = {
                    'SATZA': {
                        '$in': attendance_type
                    },
                    'Raw.EventTime': {
                        '$gte': start_date,
                    }
                }
            print(Filter)
            all_data = nrdb.find(filter=Filter)
            for each in json.loads(json_util.dumps(all_data)):
                all_result.append(each)

            if search_status and request_data['export'] is False:
                data = nrdb.find(filter=Filter).limit(10).skip(10 * (page_no - 1))
                for each in json.loads(json_util.dumps(data)):
                    result.append(each)

            elif search_status is False and request_data['export']:
                data = nrdb.find(filter=Filter).limit(10).skip(10 * (page_no - 1))
                for each in json.loads(json_util.dumps(data)):
                    result.append(each)

            elif search_status and request_data['export']:
                data = nrdb.find(filter=Filter).limit(10).skip(10 * (page_no - 1))
                for each in json.loads(json_util.dumps(data)):
                    result.append(each)

            response = {"status": 'Success', "message": "Search Complete", "Search_count": len(result),
                        "All_Search_count": len(all_result),
                        "Search": result if len(result) != 0 else "Authlog not found for the "
                                                                  "following date",
                        "Total_search": all_result if request_data['export'] else []}
            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class get_image_auth(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/get_image_auth.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            IndexKey = request_data['IndexKey']
            UniqueID = request_data['UniqueID']
            image = get_auth_image(str(IndexKey), str(UniqueID))
            print(image)
            if image["status"] == "success":
                response = {"status": 'Success', "message": "Authlog Image",
                            "Auth_list": image["Authlog_image"]["AuthLogDetail"]}
            else:
                response = {"status": 'Error', "message": "Authlog Image not found", "Auth_list": {}}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class Blacklist_With_Po_Validation(MethodView):
    @cross_origin(supports_credentials=True)
    def post(self):
        try:
            vendor_details = list()
            user_data = list()
            user_list = None
            # request_data = request.get_json(force=True)
            query = vendors.query.all()
            VendorSchema = vendors_schema(many=True)
            vendor_list = VendorSchema.dump(query)
            for each_v in vendor_list:
                print("each vendor-----------------", each_v["vd_code"])
                unique_id = vendors.fetch_unique_by_vendor_code(each_v["vd_code"])
                print("unique_id", unique_id)
                for each_unique in unique_id:
                    po_number = Cr_info.Fetch_cr_info(each_unique["unique_id"])[0]["po_number"]
                    print("po_number", po_number)
                    po_expire = po_master.Fetch_po_expiry_with_po_number(po_number)
                    form_id = list(
                        set(Cr_info.Fetch_cr_info_po(po_number)))
                    for each_ in form_id:
                        user_list = cr_dd.get_user_demog_value_by_demog_id(each_)
                        if user_list:
                            pass_validity = cr_dd.get_user_pass_validity_by_demog_id(each_)
                            pcc_validity = cr_dd.get_user_pcc_validity_by_demog_id(each_)
                            for each in user_list:
                                user_id = Users.FetchUSerDetails_By_clms_id(each.get("d_value"))["id"]
                                if Users.FetchUSerDetails_By_clms_id(each.get("d_value"))["alpeta_user_id"]:
                                    group_id = Users.FetchUSerDetails_By_clms_id(each.get("d_value"))["group_id"]
                                    list_terminal = Group_terminals.GET_TerminalsDEtails_BY_GRoupID(group_id)
                                    if list_terminal:
                                        for each_terminal in list_terminal:
                                            Pass_valid_upto = pass_validity[0]
                                            Pcc_validity = pcc_validity[0]
                                            Po_expire = po_expire["expiry"]
                                            user_terminal_id = User_terminals.get_id_by_terminal_user(each_terminal,
                                                                                                      user_id)
                                            terminal_id = str(
                                                Terminals.FetchTerminals_By_ID(each_terminal)["alpeta_terminal_id"])
                                            alpeta_id = Users.FetchUSerDetails_By_clms_id(each.get("d_value"))[
                                                "alpeta_user_id"]
                                            if Pass_valid_upto >= str(
                                                    datetime.now().date()) and Pcc_validity >= str(
                                                datetime.now().date()) and Po_expire >= str(
                                                datetime.now().date()):
                                                terminal_id = str(Terminals.FetchTerminals_By_ID(each_terminal)["alpeta_terminal_id"])
                                                print("Trueeeeeeeeeee",str(user_id),terminal_id)
                                                print(Blacklist_request.Fetch_update_blacklist(str(user_id),terminal_id))
                                                if Blacklist_request.Fetch_update_blacklist(str(user_id),terminal_id):
                                                    print(Blacklist_request.Fetch_update_blacklist(str(user_id),
                                                                                                terminal_id)[
                                                        "is_block"])
                                                    if Blacklist_request.Fetch_update_blacklist(str(user_id),
                                                                                                terminal_id)[
                                                        "is_block"] == 1:
                                                        Blacklist_request.update_blacklist(str(user_id), terminal_id,
                                                                                           0, 1, 0,
                                                                                           "pending", None)
                                                        test = {"po_expire": po_expire["expiry"],
                                                                "pass_validity": pass_validity[0],
                                                                "pcc_validity": pcc_validity[0],
                                                                "user": Users.FetchUSerDetails_By_clms_id(
                                                                    each.get("d_value")),
                                                                "alpeta_id": alpeta_id,
                                                                "user_id": user_id,
                                                                "block_from": datetime.now(),
                                                                "block_to": datetime(2099, 1, 1),
                                                                "id": user_terminal_id,
                                                                "terminal_id": each_terminal
                                                                }
                                                        user_data.append(test)
                                                    else:
                                                        Blacklist_request.update_blacklist(str(user_id), terminal_id,
                                                                                           0, 1, 1,
                                                                                           "pending", None)
                                            else:
                                                if user_terminal_id and not Blacklist_request.Fetch_update_blacklist(
                                                        str(user_id), terminal_id):
                                                    Blacklist_request.AddBlacklist(alpeta_id, user_terminal_id,
                                                            terminal_id,user_id, 0, 1, 1, "pending", None)
                                                else:
                                                    print("here2")
                                                    Blacklist_request.update_blacklist(str(user_id), terminal_id, 0,
                                                                                       1, 1, "pending",
                                                                                       None)

            response = {
                "status": "success",
                "message": "Labour access validation checked successfully",
                "data": user_data
            }
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200




class blacklist_request(MethodView):
    @cross_origin(supports_credentials=True)
    def post(self):
        try:
            search_query = f"SELECT * FROM blacklist_request WHERE processing = 1 and execution_status like 'pending'"
            data = db.session.execute(search_query)
            CrFormGroupSchema = Blacklist_request_schema(many=True)
            output = CrFormGroupSchema.dump(data)
            for each in output:
                print(type(each["block_to"]),type(each["block_from"]))
                url = "https://grse.dev13.ivantechnology.in/blacklist"
                url_2 = "https://grse.dev13.ivantechnology.in/revert_blacklist"
                payload = {"alpeta_id": each["alpeta_id"], "block_from": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                           "block_to": datetime(2099, 1, 1).strftime("%Y-%m-%d %H:%M:%S"), "terminal_id": each["terminal_id"],
                           "user_id": each["user_id"],"id": each["user_terminal_id"]}
                headers = {}
                print(payload,"<---------------------------->",each["is_block"])
                if each["is_block"] == 0:
                    response_ = requests.request("POST", url_2, headers=headers, json=payload)
                    print("1----------------",response_,response_.json())
                    if response_.json()["status"] == "success":
                        response = {"status": 'Success', "message": "checking labour validity and unblockeded"}
                        Blacklist_request.update_blacklist(str(each["user_id"]),str(each["terminal_id"]), 1, 0, 0,
                                                           "pending", datetime.now())
                        print(response)
                    else:
                        response = {"status": 'Error', "message": "Unable to run labour validity"}
                        print(response)
                elif each["is_block"] == 1:
                    response_ = requests.request("POST", url, headers=headers, json=payload)
                    print("2----------------",response_,response_.json())
                    if response_.json()["status"] == "success":
                        response = {"status": 'Success', "message": "checking labour validity and blocked"}
                        Blacklist_request.update_blacklist(str(each["user_id"]),str(each["terminal_id"]), 1, 0, 1,
                                                           "pending", datetime.now())
                        print(response)
                    else:
                        response = {"status": 'Error', "message": "Unable to run labour validity"}
                        print(response)

            response = {"status": 'Success', "message": "All labour exicuted", "blacklist": output}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class view_blacklist(MethodView):
    @cross_origin(supports_credentials=True)
    def post(self):
        try:
            result = {}
            search_query = f"SELECT * FROM blacklist_request WHERE processing = 1 and execution_status like 'pending'"
            data = db.session.execute(search_query)
            CrFormGroupSchema = Blacklist_request_schema(many=True)
            output = CrFormGroupSchema.dump(data)
            search_query_1 = f"SELECT * FROM blacklist_request WHERE executed = 1 and execution_status like 'pending'"
            data_1 = db.session.execute(search_query_1)
            CrFormGroupSchema_1 = Blacklist_request_schema(many=True)
            output_1 = CrFormGroupSchema_1.dump(data_1)
            result["processing"] = []
            result["executed"] = []
            for each in output:
                result["processing"].append(each)
            for each_1 in output_1:
                result["executed"].append(each_1)
            response = {"status": 'Success', "message": "Blacklist and revert Blacklist view", "result": result}
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

def mssql_connector(table_name, date_range):
    import pymssql
    # need to be changed
    server = "10.181.111.61"  # "192.168.1.116"
    user = "sa"  #
    password = "Admin@123"  # "Ivan@123"
    # conn = pymssql.connect(server, user, password, "UCDB")
    # server = "192.168.1.116"
    # user = "sa"
    # password = "Ivan@123"
    conn = pymssql.connect(server, user, password, "UCDB")
    try:
        attendance = list()
        cursor = conn.cursor(as_dict=True)
        cursor.execute(f"SELECT * FROM auth_logs_{table_name} WHERE server_record_time BETWEEN"
                       f"'{date_range} 00:00:00' AND '{date_range} 23:59:59' ORDER BY server_record_time")
        # count = 0
        for row in cursor:
            attendance.append(row)
        response = {"status": 'Success', "message": "MsSql Authlog found for the following date", "data": attendance,
                    "count": len(attendance)}
        import pprint
        pprint.pprint(response)
        return response
    except Exception as e:
        response = {"status": 'Error', "message": f'{str(e)}'}
        return response
    finally:
        conn.close()


class Get_All_Auth_Log_Mssql(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/AllAuthlogMssql.yaml', methods=['POST'])
    def post(self):
        try:
            print("hello ----------")
            request_data = request.get_json(force=True)
            date = request_data['Date']
            format = '%Y-%m-%d'
            date_range = datetime.strptime(date, format).strftime("%Y-%m-%d")
            table_name = datetime.strptime(date, format).strftime("%Y%m")
            db = database_connect_mongo()
            db = db["all_attendance"]
            db.create_index('IndexKey', unique=True)
            if mssql_connector(table_name, date_range)["status"] == "Success":
                for each in mssql_connector(table_name, date_range)["data"]:
                    server_time = each['server_record_time']
                    server_time = datetime.strptime(server_time.strftime("%Y-%m-%d %H:%M:%S"), '%Y-%m-%d %H:%M:%S')
                    event_time = datetime.strptime(each['event_time'].strftime("%Y-%m-%d %H:%M:%S"),
                                                   '%Y-%m-%d %H:%M:%S')
                    event_date = datetime.strptime((each['event_time'].strftime("%Y-%m-%d %H:%M:%S")).split(" ")[0],
                                                   '%Y-%m-%d')
                    # image = get_auth_image(str(each["IndexKey"]), str(each["UniqueID"]))
                    if Terminals.FetchTerminals_By_AlpetaID(each["terminal_id"]):
                        terminal_info = str(Terminals.FetchTerminals_By_AlpetaID(each["terminal_id"])["terminal_type"])
                        format_raw = {
                            "IndexKey": each["index_key"],
                            "TerminalID": int(each["terminal_id"]),
                            "UserID": each["user_id"],
                            "GroupCode": int(each["group_code"]),
                            "UserName": each["user_name"],
                            "UniqueID": each["unique_id"],
                            "EventTime": event_time.strftime("%Y-%m-%d %H:%M:%S"),
                            "ServerRecordTime": server_time.strftime("%Y-%m-%d %H:%M:%S"),
                            "AuthType": int(each["auth_type"]),
                            "AuthResult": int(each["auth_result"]),
                            "Func": int(each["func"]),
                            "FuncType": int(each["func_type"]),
                            "Card": each["card"],
                            "UserType": int(each["user_type"]),
                            "IsPicture": int(each["is_picture"]),
                            "Property": each["property"],
                            "Latitude": each["latitude"],
                            "Longitude": each["longitude"],
                            "GroupName": each["group_name"],
                            "PositionName": each["position_name"],
                            "TerminalName": each["terminal_name"],
                            "Mysql": "yes"
                        }
                        if each["user_id"] and each["unique_id"]:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert_one({'PERNR': each['unique_id'], 'TIMR6': 'X', "CHOIC": "2011",
                                               "LDATE": event_date.strftime("%d.%m.%Y"),
                                               "LTIME": (each['event_time'].strftime("%Y-%m-%d %H:%M:%S")).split(" ")[
                                                   1],
                                               "SATZA": "",
                                               "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["terminal_id"])[
                                                   "short_code"],
                                               "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                               # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                               "Reference": terminal_type(terminal_info,
                                                                          (each['event_time'].strftime(
                                                                              "%Y-%m-%d %H:%M:%S")).split(" ")[1]),
                                               "SAP_sync_status": "",
                                               "SAP_sync_date_time": "",
                                               "Auth_result": auth_result.get(str(each["auth_result"]), "Unknown"),
                                               "Auth_type": auth_type.get(str(each["auth_type"]), "Unknown"),
                                               "IndexKey": each["index_key"],
                                               "Raw": format_raw})
                            except (DuplicateKeyError, BulkWriteError) as err:
                                continue

                        else:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert_one({'PERNR': each['unique_id'], 'TIMR6': 'X', "CHOIC": "2011",
                                               "LDATE": event_date.strftime("%d.%m.%Y"),
                                               "LTIME": (each['event_time'].strftime("%Y-%m-%d %H:%M:%S")).split(" ")[
                                                   1],
                                               "SATZA": "",
                                               "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["terminal_id"])[
                                                   "short_code"],
                                               "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                               # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                               "Reference": terminal_type(terminal_info,
                                                                          (each['event_time'].strftime(
                                                                              "%Y-%m-%d %H:%M:%S")).split(" ")[1]),
                                               "SAP_sync_status": "",
                                               "SAP_sync_date_time": "",
                                               "Auth_result": auth_result.get(str(each["auth_result"]), "Unknown"),
                                               "Auth_type": auth_type.get(str(each["auth_type"]), "Unknown"),
                                               "IndexKey": each["index_key"],
                                               "Raw": format_raw})
                            except (DuplicateKeyError, BulkWriteError):
                                continue
                        # auth_list.append(each)
                    else:
                        print("pass")
                        pass
                respone = {"status": 'Success', "message": "MsSql Authlog Saved to MongoDB",
                           "count": mssql_connector(table_name, date_range)["count"], "filename": table_name}
                return make_response(jsonify(respone)), 200

            else:
                respone = {"status": 'Error', "message": "MsSql Authlog not found for the following date",
                           "Authlog": "Authlog was not Saved to Database"}
                print(respone)
                return make_response(jsonify(respone)), 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class Get_Auth_log_date_now(MethodView):
    @cross_origin(supports_credentials=True)
    #@swag_from('apidocs/Authlog.yaml', methods=['GET'])
    def post(self):
        try:
            CurrentDatetime = datetime.now()
            # yesterday = CurrentDatetime - timedelta(days=7)
            # Date = yesterday.strftime("%Y-%m-%d")
            Datenew = CurrentDatetime.strftime("%Y-%m-%d")
            end_date_time = Datenew + "23:59:59"
            start_date_time = Datenew + "00:00:00"
            Get_auth = get_auth(str(start_date_time), str(end_date_time))
            auth_list = list()
            db = database_connect_mongo()
            db = db["all_attendance"]
            db.create_index('IndexKey', unique=True)
            if Get_auth['Authlog']['AuthLogList']:
                for each in Get_auth['Authlog']['AuthLogList']:
                    server_time = each['ServerRecordTime']
                    server_time = datetime.strptime(server_time, '%Y-%m-%d %H:%M:%S')
                    event_date = datetime.strptime(each['EventTime'].split(" ")[0], '%Y-%m-%d')
                    # image = get_auth_image(str(each["IndexKey"]), str(each["UniqueID"]))
                    if Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"]):
                        terminal_info = str(Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])["terminal_type"])
                        if each["UserID"] and each["UniqueID"]:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                           "LDATE": event_date.strftime("%d.%m.%Y"),
                                           "LTIME": each['EventTime'].split(" ")[1],
                                           "SATZA": "",
                                           "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])[
                                               "short_code"],
                                           "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                           # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                           "Reference": terminal_type(terminal_info,
                                                                      each['EventTime'].split(" ")[1]),
                                           "SAP_sync_status": "",
                                           "SAP_sync_date_time": "",
                                           "Auth_result": auth_result.get(str(each["AuthResult"]), "Unknown"),
                                           "Auth_type": auth_type.get(str(each["AuthType"]), "Unknown"),
                                           "IndexKey": each["IndexKey"],
                                           "Raw": each,
                                            "created_date":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                })
                            except (DuplicateKeyError, BulkWriteError) as err:
                                continue

                        else:
                            # print(image["Authlog_image"]["AuthLogDetail"])
                            # each["LogImage"] = image["Authlog_image"]["AuthLogDetail"]["LogImage"]
                            try:
                                db.insert({'PERNR': each['UniqueID'], 'TIMR6': 'X', "CHOIC": "2011",
                                           "LDATE": event_date.strftime("%d.%m.%Y"),
                                           "LTIME": each['EventTime'].split(" ")[1],
                                           "SATZA": "",
                                           "TERMINAL_id": Terminals.FetchTerminals_By_AlpetaID(each["TerminalID"])[
                                               "short_code"],
                                           "SERVER_TIME": server_time.strftime("%d.%m.%Y %H:%M:%S"),
                                           # "LogImage": image["Authlog_image"]["AuthLogDetail"]["LogImage"],
                                           "Reference": terminal_type(terminal_info,
                                                                      each['EventTime'].split(" ")[1]),
                                           "SAP_sync_status": "",
                                           "SAP_sync_date_time": "",
                                           "Auth_result": auth_result.get(str(each["AuthResult"]), "Unknown"),
                                           "Auth_type": auth_type.get(str(each["AuthType"]), "Unknown"),
                                           "IndexKey": each["IndexKey"],
                                           "Raw": each,
                                            "created_date":datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                                })
                            except (DuplicateKeyError, BulkWriteError):
                                continue
                        auth_list.append(each)
                    else:
                        print("pass")
                        pass
                respone = {"status": 'Success', "message": "Authlog Saved to Database"}
                return make_response(jsonify(respone)), 200

            else:
                respone = {"status": 'Error', "message": "Authlog not found for the following date",
                           "Authlog": "Authlog was not Saved to Database"}
                print(respone)
                return make_response(jsonify(respone)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200
            
            
# # # Creating View Function/Resources
CreateBlacklist = CreateBlacklist.as_view("CreateBlacklist")
RevertBlacklist = RevertBlacklist.as_view("RevertBlacklist")
Get_Auth_log = Get_Auth_log.as_view("Authlog")
Get_All_Auth_log_pg = Get_All_Auth_log_pg.as_view("AuthlogPG")
Get_All_Auth_log = Get_All_Auth_log.as_view("Get_All_Auth_log")
Get_Attendance = Get_Attendance.as_view("Get_Attendance")
Get_All_Attendance = Get_All_Attendance.as_view("Get_All_Attendance")
Search_Attendance = Search_Attendance.as_view("Search_Attendance")
Get_Image = get_image_auth.as_view("Get_Image_Auth")
Blacklist_With_Po_Validation = Blacklist_With_Po_Validation.as_view("Blacklist_With_Po_Validation")
blacklist_request = blacklist_request.as_view("blacklist_request")
view_blacklist = view_blacklist.as_view("view_blacklist")
Get_All_Auth_Log_Mssql = Get_All_Auth_Log_Mssql.as_view("Get_All_Auth_Log_Mssql")
Get_Auth_log_date_now = Get_Auth_log_date_now.as_view("Get_Auth_log_date_now")
# # # adding routes to the Views we just created
Blacklist_view.add_url_rule('/blacklist', view_func=CreateBlacklist, methods=['POST'])
Blacklist_view.add_url_rule('/revert_blacklist', view_func=RevertBlacklist, methods=['POST'])
Blacklist_view.add_url_rule('/auth_log/<Date>', view_func=Get_Auth_log, methods=['GET'])
Blacklist_view.add_url_rule('/auth_log_pg', view_func=Get_All_Auth_log_pg, methods=['GET'])
Blacklist_view.add_url_rule('/all_auth_log', view_func=Get_All_Auth_log, methods=['GET'])
Blacklist_view.add_url_rule('/attendance', view_func=Get_Attendance, methods=['GET'])
Blacklist_view.add_url_rule('/attendance_all', view_func=Get_All_Attendance, methods=['GET'])
Blacklist_view.add_url_rule('/search_attendance/<page>', view_func=Search_Attendance, methods=['POST'])
Blacklist_view.add_url_rule('/auth_image', view_func=Get_Image, methods=['POST'])
Blacklist_view.add_url_rule('/labour_onboard_validation', view_func=Blacklist_With_Po_Validation, methods=['POST'])
Blacklist_view.add_url_rule('/blacklist_request', view_func=blacklist_request, methods=['POST'])
Blacklist_view.add_url_rule('/blacklist_view', view_func=view_blacklist, methods=['POST'])
Blacklist_view.add_url_rule('/auth_log_today', view_func=Get_Auth_log_date_now, methods=['POST'])
Blacklist_view.add_url_rule('/all_auth_log_mssql', view_func=Get_All_Auth_Log_Mssql, methods=['POST'])
