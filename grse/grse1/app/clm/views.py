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

Clm_view = Blueprint('clm_view', __name__)


class ClmListViews(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/clm_view_list.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            employee_id = request_data['employee_id']
            cl_employer = request_data["cl_employer"]
            page = request_data["page_no"]
            search_status = request_data["search_status"]

            if employee_id and search_status:
                test_query = db.session.execute(
                    f"SELECT * FROM mvw_cl_current_profile WHERE "
                    f"mvw_cl_current_profile.employee_id ilike '%{employee_id}%'")
                mvw_cl_current_profile = mvw_cl_current_profile_schema(many=True)
                output = mvw_cl_current_profile.dump(test_query)
            elif cl_employer and search_status:
                test_query = db.session.execute(
                    f"SELECT * FROM mvw_cl_current_profile WHERE "
                    f"mvw_cl_current_profile.cl_employer ilike '%{cl_employer}%'")
                mvw_cl_current_profile = mvw_cl_current_profile_schema(many=True)
                output = mvw_cl_current_profile.dump(test_query)
            else:
                test_query = db.session.execute(
                    f"SELECT * FROM mvw_cl_current_profile")
                mvw_cl_current_profile = mvw_cl_current_profile_schema(many=True)
                output = mvw_cl_current_profile.dump(test_query)
            response = {
                "status": "success",
                "message": "Success",
                "SearchCount": len(output),
                "Users": Paginate(output, page)}
            print(response)
            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class ClmListViewsDetail(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/clm_view_list_details.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            employee_id = request_data['employee_id']
            test_query = db.session.execute(
                f"SELECT * FROM mvw_cl_detail_profile WHERE "
                f"mvw_cl_detail_profile.employee_id ilike '%{employee_id}%'")
            print(str(test_query))
            mvw_cl_current_detail = mvw_cl_current_detail_schema(many=True)
            output = mvw_cl_current_detail.dump(test_query)
            response = {
                "status": "success",
                "message": "Success",
                "SearchCount": len(output),
                "Users": output}
            print(response)
            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class CreateDemog(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/add_demog.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            code = request_data['code']
            name = request_data['name']
            type_ = request_data['type']
            value = request_data['value']
            is_required = request_data['is_required']
            type_master = ["text", "number", "date", "yesno", "datetime-local", "acknowledge-ck","select-options"]
            query = dm.query.filter(dm.code.ilike(f'%{code}%')).order_by(dm.updated_at.desc()).first()
            dmSchema = dm_schema()
            output = dmSchema.dump(query)
            if type_ in type_master:
                if output:
                    response = {
                        "status": "error",
                        "message": "Demong Master Code already exist "}
                else:
                    dm.Add_dm(code, name, is_required, type_, value, "active")
                    response = {
                        "status": "success",
                        "message": "Demong master created successfully"}
            else:
                response = {
                    "status": "error",
                    "message": "Input type is not in list"}
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc()
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateDemog(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_demog.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data['id']
            code = request_data['code']
            name = request_data['name']
            _type = request_data['type']
            _value = request_data['value']
            is_required = request_data['is_required']
            type_master = ["text", "number", "date", "yesno", "datetime-local", "acknowledge-ck","select-options"]
            if _type in type_master:
                dm.Update_dm(_id, code, name, is_required, _type, _value)
                response = {
                    "status": "success",
                    "message": "Demog master updated successfully"}
            else:
                response = {
                    "status": "error",
                    "message": "Input type is not in list"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateDemogStatus(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_demog_status.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data['id']
            status = request_data['status']
            dm.Change_Status(_id, status)
            response = {
                "status": "success",
                "message": "Demong master status change successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class GetDemogBycode(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/get_demog.yaml', methods=['GET'])
    def get(self, page_no):
        try:
            DemogMaster = dm.query.filter(dm.status != "delete").order_by(dm.name).all()
            DemogSchema = dm_schema(many=True)
            output = DemogSchema.dump(DemogMaster)
            response = {
                "status": "success",
                "message": "Demong master fetched successfully",
                "DemogList": Paginate(output, page_no) if page_no != "all" else output,
                "SearchCount": len(output)}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class CreateCrGroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/add_cr_group.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            name = request_data['name']

            check_demong_name = cr_groups.get_demog_by_name(name)
            if check_demong_name:
                response = {
                    "status": "Error",
                    "message": "Demog Group Name already exits"}
            else:
                cr_groups.Add_cr_groups(name, "active")
                response = {
                    "status": "success",
                    "message": "CR group created successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateCrGroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_cr_group.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data['id']
            name = request_data['name']
            cr_groups.Update_cr_groups(_id, name)
            response = {
                "status": "success",
                "message": "CR group updated successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateCrGroupStatus(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_cr_group_status.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data['id']
            status = request_data['status']
            cr_groups.Change_Status(_id, status)
            response = {
                "status": "success",
                "message": "CR group status changed successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class GetCrgroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/get_cr_group.yaml', methods=['GET'])
    def get(self, page_no):
        try:
            cr_group = cr_groups.query.filter(cr_groups.status != "delete").order_by(cr_groups.name).all()
            CRGroupSchema = cr_groups_schema(many=True)
            output = CRGroupSchema.dump(cr_group)
            data = list()
            for each in output:
                demong_list = cr_demog_groups.Fetch_cr_demog_group(each["id"])
                each["Demog_list"] = len(demong_list) if demong_list else 0
            response = {
                "status": "success",
                "message": "CR group fetched successfully",
                "CrgroupList": Paginate(output, page_no) if page_no != "all" else output,
                "SearchCount": len(output)}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class CreateCrDemogGroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/add_cr_demog_group.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            demog_id = request_data["demog_id"]  # list
            group_id = request_data["group_id"]
            _type = request_data.get("type", "")
            status = request_data['status']
            cr_demog_group = cr_demog_groups.query.filter_by(group_id=str(group_id)) \
                .with_entities(cr_demog_groups.id).all()
            CRDemogGroupSchema = cr_demog_groups_schema(many=True)
            output = CRDemogGroupSchema.dump(cr_demog_group)
            output = [each["id"] for each in output]
            for _each in output:
                cr_demog_groups.query.filter_by(id=int(_each)).delete()
                db.session.commit()
            for each in demog_id:
                if cr_demog_groups.check_terminal_if_exists_in_group(each, group_id):
                    cr_demog_groups.Add_cr_demog_groups(each, group_id, _type, status)
            response = {
                "status": "success",
                "message": "CR demog group updated successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class GetCRDemongDetails(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/fetch_cr_demog_group_details.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            group_id = request_data['group_id']
            group_details = cr_groups.Fetch_cr_group_by_groupid(group_id)
            demong_list = cr_demog_groups.Fetch_cr_demog_group(group_id)
            response = {
                "group_details": group_details,
                "demog_assign": demong_list,
                "status": "success",
                "message": "CR demog group details fetched successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateCrDemogGroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_cr_demog_group.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data["id"]
            demog_id = request_data["demog_id"]
            group_id = request_data["group_id"]
            cr_demog_groups.Update_cr_demog_groups(_id, demog_id, group_id)
            response = {
                "status": "success",
                "message": "CR demog group updated successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class UpdateCrDemogGroupStatus(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/update_cr_demog_group_status.yaml', methods=['POST'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            _id = request_data["id"]
            status = request_data['status']
            cr_demog_groups.Change_Status(_id, status)
            response = {
                "status": "success",
                "message": "CR demog group status updated successfully"}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200


class GetCrdemoggroup(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def get(self, page_no):
        try:
            cr_demog_group = cr_demog_groups.query.filter(cr_demog_groups.status != "delete"). \
                order_by(cr_demog_groups.updated_at.desc()).all()
            CRDemogGroupSchema = cr_demog_groups_schema(many=True)
            output = CRDemogGroupSchema.dump(cr_demog_group)
            response = {
                "status": "success",
                "message": "CR Demog group fetched successfully",
                "CrDemogGroupList": Paginate(output, page_no) if page_no != "all" else output,
                "SearchCount": len(output)}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class GetYard(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def get(self):
        try:
            response = {
                "status": "success",
                "message": "fetch yard list successfully",
                "YardList": dm.get_demog_by_code("cl_yard")}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class GetDemogCode(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            demog_code = request_data["demog_code"]
            response = {
                "status": "success",
                "message": "CR Demog group fetched successfully",
                "DemogList": dm.get_demog_by_code(demog_code),
                "SearchCount": len(dm.get_demog_by_code(demog_code))}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class GetB2OnBoardLimit(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            Vendor_code = request_data["vendor_code"]
            response = {
                "status": "success",
                "message": "Get B2 onboard labour limit successfully",
                "Labour_limit": vendors.fetch_vendor_by_vendor_code(Vendor_code),
                "Labour_onboarded": Users.FetchUSerDetails_By_vendor_id(Vendor_code)}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200
            
class GetPoUserListByVendor(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def post(self):
        try:
            onboard_list = list()
            user_list = None
            request_data = request.get_json(force=True)
            page_no = request_data.get('page_no')
            vendorcode_search = request_data["vendor_code"]
            offset = int(10) * (int(page_no) - 1)
            # vendors.fetch_unique_by_vendor_code(Vendor_code) take this vendor code fron cr_dd
            search_query = f"SELECT cr_info.yard_no,cr_info.unit,cr_info.dept,cr_info.po_number,cr_info.unique_id,cr_info.form_status, " \
                                f"max(" \
                                f"CASE " \
                                f"WHEN cr_dd.dcode::text = 'vd_max_persons_allowed'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto THEN cr_dd.d_value " \
                                f"ELSE NULL::character varying " \
                                f"END::text" \
                                f") AS Labour_limit," \
                                f"max(" \
                                f"CASE " \
                                f"WHEN cr_dd.dcode::text = 'vd_company_name'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto THEN cr_dd.d_value " \
                                f"ELSE NULL::character varying " \
                                f"END::text" \
                                f") AS name," \
                                f"max(" \
                                f"CASE " \
                                f"WHEN cr_dd.dcode::text = 'vd_vendor_code'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto  THEN cr_dd.d_value "\
                                f"ELSE NULL::character varying " \
                                f"END::text" \
                                f") AS vd_code, cr_info.created_at " \
                                f"FROM cr_info " \
                                f"RIGHT JOIN (select * from cr_dd where cr_dd.d_value ilike '%{vendorcode_search}%' and dcode = 'vd_vendor_code') cr_dd ON cr_info.unique_id = cr_dd.unique_id " \
                                f"WHERE cr_info.form_id = '1' " \
                                f"AND cr_info.form_status = 'onboard'" \
                                f"GROUP BY cr_info.yard_no," \
                                f"cr_info.unit," \
                                f"cr_info.dept," \
                                f"cr_info.po_number," \
                                f"cr_info.unique_id, cr_info.created_at ," \
                                f"cr_info.form_status LIMIT 10 OFFSET {offset}"
            data = db.session.execute(search_query)
            search_query2 = f"select count(*) from (SELECT cr_info.yard_no,cr_info.unit,cr_info.dept,cr_info.po_number,cr_info.unique_id,cr_info.form_status, " \
                            f"max(" \
                            f"CASE " \
                            f"WHEN cr_dd.dcode::text = 'vd_max_persons_allowed'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto THEN cr_dd.d_value " \
                            f"ELSE NULL::character varying " \
                            f"END::text" \
                            f") AS Labour_limit," \
                            f"max(" \
                            f"CASE " \
                            f"WHEN cr_dd.dcode::text = 'vd_company_name'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto THEN cr_dd.d_value " \
                            f"ELSE NULL::character varying " \
                            f"END::text" \
                            f") AS name," \
                            f"max(" \
                            f"CASE " \
                            f"WHEN cr_dd.dcode::text = 'vd_vendor_code'::text AND CURRENT_DATE >= cr_dd.efrom AND CURRENT_DATE <= cr_dd.eto  THEN cr_dd.d_value "\
                            f"ELSE NULL::character varying " \
                            f"END::text" \
                            f") AS vd_code " \
                            f"FROM cr_info " \
                            f"RIGHT JOIN (select * from cr_dd where cr_dd.d_value ilike '%{vendorcode_search}%' and dcode = 'vd_vendor_code') cr_dd ON cr_info.unique_id = cr_dd.unique_id " \
                            f"WHERE cr_info.form_id = '1' " \
                            f"AND cr_info.form_status = 'onboard'" \
                            f"GROUP BY cr_info.yard_no," \
                            f"cr_info.unit," \
                            f"cr_info.dept," \
                            f"cr_info.po_number," \
                            f"cr_info.unique_id," \
                            f"cr_info.form_status) as total_count "
            data2 = db.session.execute(search_query2).scalar()
            for each in data:
                print(each,"gggggggggggggggg")
                output2 = dict()
                # if po_master.Fetch_po_expiry_with_po_number(each[3])["expiry"]< str(datetime.now().date()):
                #     continue
                if data2 != 0:
                    print(data2,"here ----------",each)
                    output2["yard_no"] = each[0]
                    output2["unit"] = each[1]
                    output2["dept"] = each[2]
                    output2["po_number"] = each[3]
                    output2["unique_id"] = each[4]
                    output2["Labour_limit"] = each[6] if each[6] else cr_dd.get_demog_value_by_demog_id(each[4], "vd_max_persons_allowed")["d_value"]
                    output2["name"] = each[7] if each[7] else cr_dd.get_demog_value_by_demog_id(each[4], "vd_company_name")["d_value"]
                    output2["vd_code"] = each[8] if  each[8] else cr_dd.get_demog_value_by_demog_id(each[4], "vd_vendor_code")["d_value"]
                    output2["Labour_onboarded"] = labour_onboard_count(each[4])
                    output2["form_status"] = each[5]
                    output2["Onboarded_at"] = each[9]
                    onboard_list.append(output2)
            # unique_id = vendors.fetch_unique_by_vendor_code(Vendor_code)
            # for each_unique in unique_id:
            #     #print("Jhar ache")
            #     #print(each_unique)
            #     v_details = Cr_info.Fetch_cr_info(each_unique["unique_id"])[0]
            #     #print(Cr_info.Fetch_cr_info(each_unique["unique_id"]))
            #     #print("Errrrrrrrrrrrrrrrrrrrrrrorrrrrrrrrrrrrrrrr")
            #     form_id = list(set(Cr_info.Fetch_cr_info_po(Cr_info.Fetch_cr_info(each_unique["unique_id"])[0]["po_number"])))
            #     print(form_id)
            #     for each_ in form_id:
            #         user_list = cr_dd.get_user_demog_value_by_demog_id(each_)
            #         print("Usssssssssssssssssssssssssssserrrrrrrrrrrrrrrrrrrrrrr")
            #         print(user_list)
            #         if user_list:
            #             for each in user_list:
            #                 if each.get("d_value") != None and each.get("d_value") != '' :
            #                     user_data.append(Users.FetchUSerDetails_By_clms_id(each.get("d_value")))
                            
            #     print(user_data)
            #     v_details["user_details"] = user_data
            #     vendor_details.append(v_details)
            response = {
                "status": "success",
                "message": "vendor_details fetched successfully",
                "vendor_details": onboard_list,
                "vendor_info": vendors.fetch_unique_by_vendor_code(vendorcode_search)[0],
                "count":data2
            }
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200
            
            
class GetVendorUserListByPo(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def post(self):
        try:
            vendor_details = list()
            v_details = dict()
            user_data = list()
            user_list = None
            request_data = request.get_json(force=True)
            d_value = request_data["po_number"]
            unique_id = cr_dd.get_po_value_by_demog_value(d_value)
            for each in unique_id:
                clms_id = cr_dd.get_user_demog_value_by_demog_id(each["unique_id"])
                if clms_id[0]["d_value"]:
                    each = Users.FetchUSerDetails_By_clms_id(clms_id[0]["d_value"])
                    each["gate_pass"] = cr_dd.get_user_pass_validity_by_demog_id(each["unique_id"])[0]
                    each["pcc_validity"] = cr_dd.get_user_pcc_validity_by_demog_id(each["unique_id"])[0]
                    each["vendors_details"] = vendors.fetch_unique_by_vendor_code(each["vendor_id"])[0]
                    user_data.append(each)

            response = {
                "status": "success",
                "message": "vendor_details fetched successfully",
                "vendor_details": user_data
            }
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            import traceback
            traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200
            
def map_user_data(each):
    u_details = dict()
    if "d_value" in cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id").keys() and Cr_info.check_cr_form_if_exists_in_po(cr_dd.get_demog_value_by_demog_id(each, "cl_po")["d_value"]):
        u_details["employee_id"] = cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id")["d_value"]
        u_details["B2form"] = each
        u_details["full_name"] = cr_dd.get_demog_value_by_demog_id(each, "cl_name")["d_value"]
        u_details["employment_type"] = cr_dd.get_demog_value_by_demog_id(each, "cl_role_id")["d_value"]
        u_details["Addhar"] = cr_dd.get_demog_value_by_demog_id(each, "cl_aadhaar")["d_value"]
        query = Users.query.filter_by(employee_id=cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id")["d_value"]). \
            with_entities(Users.registration_done).first()
        UserSchema = User_schema()
        output = UserSchema.dump(query)
        u_details["Alpeta_registration"] = output["registration_done"]
        return u_details
    else: 
        pass
            
class GetUserFromUniqueid(MethodView):
    @cross_origin(supports_credentials=True)
    # @swag_from('apidocs/get_cr_demog_group.yaml', methods=['GET'])
    def post(self):
        try:
            
            user_data = list()
            user_list = None
            count = 0
            request_data = request.get_json(force=True)
            unique_id = request_data["unique_id"]
            page_no = request_data.get('page_no')
            search = request_data.get('search')
            offset = int(10) * (int(page_no) - 1)
            search_query2 = f"select unique_id from cr_dd where d_value  IN ('{unique_id}') and dcode IN ('vd_b1') order by created_at desc LIMIT 10 OFFSET {offset}"
            get_dd=db.session.execute(search_query2)
            demog = cr_dd_schema(many=True)
            output = demog.dump(get_dd)
            search_query3 = f"SELECT COUNT(*) FROM (select unique_id from cr_dd where d_value  IN ('{unique_id}') and dcode IN ('vd_b1') order by created_at desc) as cnt"
            count=db.session.execute(search_query3).scalar()
            if search:
                search_query2 = f"select unique_id from cr_dd where d_value  IN ('{unique_id}') and dcode IN ('vd_b1') order by created_at desc"
                get_dd=db.session.execute(search_query2)
                demog = cr_dd_schema(many=True)
                output = demog.dump(get_dd)
                search_query3 = f"SELECT COUNT(*) FROM (select unique_id from cr_dd where d_value  IN ('{unique_id}') and dcode IN ('vd_b1') order by created_at desc) as cnt"
                count=db.session.execute(search_query3).scalar()

            output = access_form = [a_dict["unique_id"] for a_dict in output]
            print(output)
            result = map(map_user_data, output)

            # for each in output:
            #     u_details = dict()
            #     print("*****************************")
            #     print(cr_dd.get_demog_value_by_demog_id(each, "cl_name")["d_value"])
            #     print(Cr_info.check_cr_form_if_exists_in_po(cr_dd.get_demog_value_by_demog_id(each, "cl_po")["d_value"]))
            #     if "d_value" in cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id").keys() and Cr_info.check_cr_form_if_exists_in_po(cr_dd.get_demog_value_by_demog_id(each, "cl_po")["d_value"]):
            #         u_details["employee_id"] = cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id")["d_value"]
            #         u_details["B2form"] = each
            #         u_details["full_name"] = cr_dd.get_demog_value_by_demog_id(each, "cl_name")["d_value"]
            #         u_details["employment_type"] = cr_dd.get_demog_value_by_demog_id(each, "cl_role_id")["d_value"]
            #         u_details["Addhar"] = cr_dd.get_demog_value_by_demog_id(each, "cl_aadhaar")["d_value"]
            #         query = Users.query.filter_by(employee_id=cr_dd.get_demog_value_by_demog_id(each, "cl_clms_id")["d_value"]). \
            #             with_entities(Users.registration_done).first()
            #         UserSchema = User_schema()
            #         output = UserSchema.dump(query)
            #         u_details["Alpeta_registration"] = output["registration_done"]
            #         user_data.append(u_details)
            #     else:
            #         pass
            if search:
                result = list(filter(lambda person: search.lower() in person['full_name'].lower() or search.lower() in  \
                    person['B2form'].lower() or  search.lower() in  person['Addhar'].lower() or search.lower() in  person['employee_id'].lower(), list(result)))

            response = {
                "status": "success",
                "message": "user details with respect to unique_id fetched successfully",
                "user_details": result  if search else list(result),
                "count": len(result)  if search else count
            }
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            # import traceback
            # traceback.print_exc(e)
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

class GetDemogBycodePage(MethodView):
    @cross_origin(supports_credentials=True)
    @swag_from('apidocs/get_demog.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            page = request_data["pageno"]
            offset = int(10) * (int(page) - 1)
            search = request_data["search"]
            if search:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' AND name ilike '%{search}%' "
                # All_data = db.session.execute(search_query)
                All_data = dm.query.filter(
                    dm.status != "delete" and (dm.name.ilike(f'%{search}%') | dm.code.ilike(f'%{search}%'))).order_by(
                    dm.name).all()
                DemogSchema = dm_schema(many=True)
                output = DemogSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM  WHERE status != 'delete' AND name ilike '%te%' limit 10 offset {
                # offset} " All_data_p = db.session.execute(search_query_p)
                All_data_p = dm.query.filter(
                    dm.status != "delete" and (dm.name.ilike(f'%{search}%') | dm.code.ilike(f'%{search}%'))).order_by(
                    dm.name).limit(10).offset(offset)
                DemogSchema = dm_schema(many=True)
                output_p = DemogSchema.dump(All_data_p)
            else:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = dm.query.filter(dm.status != "delete").order_by(dm.name).all()
                DemogSchema = dm_schema(many=True)
                output = DemogSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM {table} WHERE status != 'delete' limit 10 offset {offset}"
                # All_data_p = db.session.execute(search_query_p)
                All_data_p = dm.query.filter(dm.status != "delete").order_by(dm.name).limit(10).offset(offset)
                DemogSchema = dm_schema(many=True)
                output_p = DemogSchema.dump(All_data_p)

            response = {
                "status": "success",
                "message": "Demong master fetched successfully",
                "DemogList":output_p,
                "SearchCount": len(output)}
            print(response)
            return make_response(jsonify(response)), 200
        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200
            
class GetCrgroupPage(MethodView):
    @cross_origin(supports_credentials=True)
    #@swag_from('apidocs/get_cr_group.yaml', methods=['GET'])
    def post(self):
        try:
            request_data = request.get_json(force=True)
            page = request_data["pageno"]
            offset = int(10) * (int(page) - 1)
            search = request_data["search"]
            if search:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = cr_groups.query.filter(cr_groups.status != "delete",
                                                  cr_groups.name.ilike(f'%{search}%')).order_by(cr_groups.name).all()
                CRGroupSchema = cr_groups_schema(many=True)
                output = CRGroupSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM {table} WHERE status != 'delete' limit 10 offset {offset}"
                # All_data_p = db.session.execute(search_query_p)
                All_data_p = cr_groups.query.filter(cr_groups.status != "delete",
                                                    cr_groups.name.ilike(f'%{search}%')).order_by(cr_groups.name).limit(
                    10).offset(offset)
                CRGroupSchema = cr_groups_schema(many=True)
                output_p = CRGroupSchema.dump(All_data_p)
            else:
                # search_query = f"SELECT * FROM {table} WHERE status != 'delete' "
                # All_data = db.session.execute(search_query)
                All_data = cr_groups.query.filter(cr_groups.status != "delete").order_by(cr_groups.name).all()
                CRGroupSchema = cr_groups_schema(many=True)
                output = CRGroupSchema.dump(All_data)
                # search_query_p = f"SELECT * FROM {table} WHERE status != 'delete' limit 10 offset {offset}"
                # All_data_p = db.session.execute(search_query_p)
                All_data_p = cr_groups.query.filter(cr_groups.status != "delete").order_by(cr_groups.name).limit(10).offset(offset)
                CRGroupSchema = cr_groups_schema(many=True)
                output_p = CRGroupSchema.dump(All_data_p)

            for each in output_p:
                demong_list = cr_demog_groups.Fetch_cr_demog_group(each["id"])
                each["Demog_list"] = len(demong_list) if demong_list else 0

            response = {
                "status": "success",
                "message": "CR group fetched successfully",
                "CrgroupList": output_p,
                "SearchCount": len(output)}
            print(response)
            return make_response(jsonify(response)), 200

        except Exception as e:
            response = {"status": 'Error', "message": f'{str(e)}'}
            print(response)
            return make_response(jsonify(response)), 200

# # # Creating View Function/Resources
ClmListViews = ClmListViews.as_view("ClmListViews")
ClmListViews_detail = ClmListViewsDetail.as_view("ClmListViews_detail")
CreateDemog = CreateDemog.as_view("CreateDemog")
UpdateDemog = UpdateDemog.as_view("UpdateDemog")
UpdateDemogStatus = UpdateDemogStatus.as_view("UpdateDemogStatus")
GetDemog = GetDemogBycode.as_view("GetDemog")
CreateCrGroup = CreateCrGroup.as_view("CreateCrGroup")
UpdateCrGroup = UpdateCrGroup.as_view("UpdateCrGroup")
UpdateCrGroupStatus = UpdateCrGroupStatus.as_view("UpdateCrGroupStatus")
GetCrgroup = GetCrgroup.as_view("GetCrgroup")
CreateCrDemogGroup = CreateCrDemogGroup.as_view("CreateCrDemogGroup")
UpdateCrDemogGroup = UpdateCrDemogGroup.as_view("UpdateCrDemogGroup")
UpdateCrDemogGroupStatus = UpdateCrDemogGroupStatus.as_view("UpdateCrDemogGroupStatus")
GetCrdemoggroup = GetCrdemoggroup.as_view("GetCrdemoggroup")
GetCRDemongDetails = GetCRDemongDetails.as_view("GetCRDemongDetails")
GetB2OnBoardLimit = GetB2OnBoardLimit.as_view("GetB2OnBoardLimit")
GetYard = GetYard.as_view("GetYard")
GetPoUserListByVendor = GetPoUserListByVendor.as_view("GetPoUserListByVendor")
GetDemogCode = GetDemogCode.as_view("GetDemogCode")
GetVendorUserListByPo = GetVendorUserListByPo.as_view("GetVendorUserListByPo")
GetUserFromUniqueid = GetUserFromUniqueid.as_view("GetUserFromUniqueid")
GetDemogBycodePage = GetDemogBycodePage.as_view("GetDemogBycodePage")
GetCrgroupPage = GetCrgroupPage.as_view("GetCrgroupPage")
# # # adding routes to the Views we just created
Clm_view.add_url_rule('/clm_list', view_func=ClmListViews, methods=['POST'])
Clm_view.add_url_rule('/clm_list_detail', view_func=ClmListViews_detail, methods=['POST'])
Clm_view.add_url_rule('/add_demog', view_func=CreateDemog, methods=['POST'])
Clm_view.add_url_rule('/update_demog', view_func=UpdateDemog, methods=['POST'])
Clm_view.add_url_rule('/update_demog_status', view_func=UpdateDemogStatus, methods=['POST'])
Clm_view.add_url_rule('/get_demog/<page_no>', view_func=GetDemog, methods=['GET'])
Clm_view.add_url_rule('/add_crgroup', view_func=CreateCrGroup, methods=['POST'])
Clm_view.add_url_rule('/update_crgroup', view_func=UpdateCrGroup, methods=['POST'])
Clm_view.add_url_rule('/update_crgroup_status', view_func=UpdateCrGroupStatus, methods=['POST'])
Clm_view.add_url_rule('/get_crgroup/<page_no>', view_func=GetCrgroup, methods=['GET'])
Clm_view.add_url_rule('/add_cr_demog_group', view_func=CreateCrDemogGroup, methods=['POST'])
Clm_view.add_url_rule('/update_cr_demog_group', view_func=UpdateCrDemogGroup, methods=['POST'])
Clm_view.add_url_rule('/update_cr_demog_group_status', view_func=UpdateCrDemogGroupStatus, methods=['POST'])
Clm_view.add_url_rule('/get_cr_demog_group/<page_no>', view_func=GetCrdemoggroup, methods=['GET'])
Clm_view.add_url_rule('/get_cr_demog_details', view_func=GetCRDemongDetails, methods=['POST'])
Clm_view.add_url_rule('/get_yard', view_func=GetYard, methods=['GET'])
Clm_view.add_url_rule('/get_onboard_limit', view_func=GetB2OnBoardLimit, methods=['POST'])
Clm_view.add_url_rule('/get_po_user_by_vendor', view_func=GetPoUserListByVendor, methods=['POST'])
Clm_view.add_url_rule('/get_demog_by_code', view_func=GetDemogCode, methods=['POST'])
Clm_view.add_url_rule('/get_vendor_user_by_po', view_func=GetVendorUserListByPo, methods=['POST'])
Clm_view.add_url_rule('/get_user_id_uniqueid', view_func=GetUserFromUniqueid, methods=['POST'])
Clm_view.add_url_rule('/get_demog_page', view_func=GetDemogBycodePage, methods=['POST'])
Clm_view.add_url_rule('/get_crgroup_page', view_func=GetCrgroupPage, methods=['POST'])

