import json
from app import db
from app import ma
from flask import Blueprint, Flask, jsonify, make_response, request
from sqlalchemy.orm.attributes import QueryableAttribute
import datetime
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field, SQLAlchemyAutoSchema

current_timestamp = datetime.datetime.now()

def row2dict(row):
    d = {}
    for column in row.__table__.columns:
        d[column.name] = str(getattr(row, column.name))
    return d

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(20), nullable=False)
    costcntr = db.Column(db.String(20),nullable=True)
    vendor_id = db.Column(db.Integer,nullable=True)
    employment_type = db.Column(db.String(20))
    alpeta_user_id = db.Column(db.Integer)
    designation_id = db.Column(db.Integer)
    role_id = db.Column(db.Integer)
    shift_id = db.Column(db.Integer)
    full_name = db.Column(db.String(128))
    dob = db.Column(db.DateTime)
    gender = db.Column(db.String(10))
    nationality = db.Column(db.String(10))
    marital_status = db.Column(db.String(10))
    address = db.Column(db.String(255))
    email = db.Column(db.String(128))
    phone = db.Column(db.String(50))
    esi_no = db.Column(db.String(50))
    pf_no = db.Column(db.String(50))
    employment_start_date = db.Column(db.DateTime,nullable=True)
    employment_end_date = db.Column(db.DateTime,nullable=True)
    employment_separation_date = db.Column(db.DateTime,nullable=True)
    password = db.Column(db.String(128))
    alpeta_password = db.Column(db.Integer)
    profile_picture = db.Column(db.String(255))
    status = db.Column(db.String(10))
    last_updated_by = db.Column(db.String(20), nullable=True)
    last_update_date = db.Column(db.DateTime, nullable=True)
    is_deleted = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, employee_id, costcntr, vendor_id,employment_type, alpeta_user_id, designation_id, role_id, shift_id,
                 full_name, dob, gender, nationality, marital_status, address, email, phone ,esi_no ,pf_no
                 ,employment_start_date ,employment_end_date ,employment_separation_date, password ,alpeta_password ,profile_picture ,status ,
                 last_updated_by, last_update_date ,is_deleted ,created_at ,updated_at):
        self.employee_id = employee_id
        self.costcntr = costcntr
        self.vendor_id = vendor_id
        self.employment_type=employment_type
        self.alpeta_user_id = alpeta_user_id
        self.designation_id = designation_id
        self.role_id = role_id
        self.shift_id = shift_id
        self.full_name = full_name
        self.dob =dob
        self.gender = gender
        self.nationality = nationality
        self.marital_status = marital_status
        self.address = address
        self.email = email
        self.phone = phone
        self.esi_no = esi_no
        self.pf_no = pf_no
        self.employment_start_date = employment_start_date
        self.employment_end_date = employment_end_date
        self.employment_separation_date = employment_separation_date
        self.password = password
        self.alpeta_password = alpeta_password
        self.profile_picture = profile_picture
        self.status = status
        self.last_updated_by = last_updated_by
        self.last_update_date = last_update_date
        self.is_deleted = is_deleted
        self.created_at = created_at
        self.updated_at = updated_at

    def addUser(employee_id, costcntr,vendor_id, alpeta_user_id,employment_type, designation_id,
                role_id, shift_id, full_name, dob, gender, nationality,marital_status,
                address, email, phone ,esi_no ,pf_no,password ,alpeta_password ,profile_picture):
        addedUser = Users(employee_id=employee_id,
                          costcntr=costcntr,
                          vendor_id=None,
                          employment_type = employment_type,
                          alpeta_user_id=int(alpeta_user_id),
                          designation_id=int(designation_id),
                          role_id=int(role_id),
                          shift_id=int(shift_id),
                          full_name=full_name,
                          dob=dob,
                          gender=gender,
                          nationality=nationality,
                          marital_status=marital_status,
                          address=address,
                          email=email,
                          phone=phone,
                          esi_no=esi_no,
                          pf_no=pf_no,
                          employment_start_date=None,
                          employment_end_date=None,
                          employment_separation_date = None,
                          password=password,
                          alpeta_password=int(alpeta_password),
                          profile_picture=profile_picture,
                          status='active',
                          last_updated_by=None,
                          last_update_date=None,
                          is_deleted=0,
                          created_at=current_timestamp,
                          updated_at=current_timestamp)

        db.session.add(addedUser)
        db.session.commit()
        return addedUser

    def UpadteUser(id,employee_id, costcntr, vendor_id, employment_type,alpeta_user_id, designation_id, role_id, shift_id,full_name, dob, gender, nationality,marital_status, address, email, phone ,esi_no ,pf_no
                 ,employment_start_date ,employment_end_date ,employment_separation_date,password ,alpeta_password ,
                profile_picture):

        Users.query.filter(Users.id == id).update({Users.employee_id: employee_id,
                                                   Users.costcntr: costcntr,
                                                   Users.vendor_id: vendor_id,
                                                   Users.employment_type:employment_type,
                                                   Users.alpeta_user_id: alpeta_user_id,
                                                   Users.designation_id: designation_id,
                                                   Users.role_id: role_id,
                                                   Users.shift_id: shift_id,
                                                   Users.full_name: full_name,
                                                   Users.dob: dob,
                                                   Users.gender: gender,
                                                   Users.nationality: nationality,
                                                   Users.marital_status: marital_status,
                                                   Users.address: address,
                                                   Users.email: email,
                                                   Users.phone: phone ,
                                                   Users.esi_no: esi_no,
                                                   Users.pf_no: pf_no,
                                                   Users.employment_start_date: employment_start_date,
                                                   Users.employment_end_date: employment_end_date,
                                                   Users.employment_separation_date: employment_separation_date,
                                                   Users.password: password,
                                                   Users.alpeta_password: alpeta_password,
                                                   Users.profile_picture: profile_picture})
        db.session.flush()
        db.session.commit()


    def Fetch_user(_email):
        query = Users.query.filter_by(email=_email).first()
        return query

    def FetchUSerDetails_By_ID(_id):
        query = Users.query.filter_by(id=_id).first()
        UserSchema = User_schema()
        # UserSchema = User_schema(many=True)
        output = UserSchema.dump(query)
        return output

    def Delete(_id):
        Users.query.filter_by(id=_id).delete()
        db.session.commit()

        def __repr__(self):
            userObject = {
                "id": self.id,
                "employee_id": self.employee_id,
                "costcntr": self.costcntr,
                "full_name": self.full_name,
                }

            return json.dumps(userObject)

class User_schema(SQLAlchemyAutoSchema):
        class Meta:
            model = Users

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subarea_id = db.Column(db.Integer)
    costcntr = db.Column(db.String(28))
    shop_name = db.Column(db.String(28))
    dept_group = db.Column(db.String(20))
    hod_man = db.Column(db.String(20))
    hod_functional_area = db.Column(db.String(20))
    clms_nodal_user = db.Column(db.String(20))
    clms_nodal_ajs = db.Column(db.String(20))
    clms_nodal_secu = db.Column(db.String(20))
    clms_nodal_hr = db.Column(db.String(20))
    clms_nodal_safety = db.Column(db.String(20))
    clms_nodal_medical = db.Column(db.String(20))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,subarea_id,costcntr,shop_name,dept_group,hod_man,hod_functional_area,
                 clms_nodal_user,clms_nodal_ajs,clms_nodal_secu,clms_nodal_hr,clms_nodal_safety,clms_nodal_medical,
                 status,created_at,updated_at):

        self.subarea_id = subarea_id
        self.costcntr = costcntr
        self.shop_name = shop_name
        self.dept_group = dept_group
        self.hod_man = hod_man
        self.hod_functional_area = hod_functional_area
        self.clms_nodal_user = clms_nodal_user
        self.clms_nodal_ajs = clms_nodal_ajs
        self.clms_nodal_secu = clms_nodal_secu
        self.clms_nodal_hr = clms_nodal_hr
        self.clms_nodal_safety = clms_nodal_safety
        self.clms_nodal_medical = clms_nodal_medical
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchDEpartmentDetails_By_ID(id):
        query = Department.query.filter_by(id=id).first()
        DeptSchema = Department_schema()
        # DeptSchema = Department_schema(many=True)
        output = DeptSchema.dump(query)
        return output

    def FetchDEpartmentDetails_By_Cost_center(costcntr):
        query = Department.query.filter_by(costcntr=costcntr).first()
        DeptSchema = Department_schema()
        output = DeptSchema.dump(query)
        return output

    def Add_Department(subarea_id,costcntr,shop_name,dept_group,hod_man,hod_functional_area,
                 clms_nodal_user,clms_nodal_ajs,clms_nodal_secu,clms_nodal_hr,clms_nodal_safety,clms_nodal_medical,
                 status):
        Query = Department(subarea_id=int(subarea_id),
                           costcntr=costcntr,
                           shop_name=shop_name,
                           dept_group=dept_group,
                           hod_man=hod_man,
                           hod_functional_area=hod_functional_area,
                           clms_nodal_user=clms_nodal_user,
                           clms_nodal_ajs=clms_nodal_ajs,
                           clms_nodal_secu=clms_nodal_secu,
                           clms_nodal_hr=clms_nodal_hr,
                           clms_nodal_safety=clms_nodal_safety,
                           clms_nodal_medical=clms_nodal_medical,
                           status=status,
                           created_at=current_timestamp,
                           updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def DepartmentsBySUBareaID(subarea_id):
        query = Department.query.filter_by(subarea_id=subarea_id).all()
        return query

    def Update_Department(id,subarea_id,costcntr,shop_name,dept_group,hod_man,hod_functional_area,
                 clms_nodal_user,clms_nodal_ajs,clms_nodal_secu,clms_nodal_hr,clms_nodal_safety,clms_nodal_medical):
        Department.query.filter(Department.id == id).update({Department.subarea_id: subarea_id,
                                                              Department.costcntr: costcntr,
                                                              Department.shop_name: shop_name,
                                                              Department.dept_group: dept_group,
                                                              Department.hod_man: hod_man,
                                                              Department.hod_functional_area: hod_functional_area,
                                                              Department.clms_nodal_user: clms_nodal_user,
                                                              Department.clms_nodal_ajs: clms_nodal_ajs,
                                                              Department.clms_nodal_secu: clms_nodal_secu,
                                                              Department.clms_nodal_hr: clms_nodal_hr,
                                                              Department.clms_nodal_safety: clms_nodal_safety,
                                                              Department.clms_nodal_medical: clms_nodal_medical,
                                                              Department.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Change_Status(_id, _status):
        Department.query.filter(Department.id == _id).update({Department.status: _status,
                                                              Department.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Department.query.filter_by(id=_id).delete()
        db.session.commit()

class Department_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Department

class Shifts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    code = db.Column(db.String(20))
    shift_start_time = db.Column(db.DateTime)
    shift_end_time = db.Column(db.DateTime)
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,name,code,shift_start_time,shift_end_time,status,created_at,updated_at):
        self.name = name
        self.code = code
        self.shift_start_time = shift_start_time
        self.shift_end_time = shift_end_time
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at


    def FetchShiftsDetails_By_ID(id):
        query = Shifts.query.filter_by(id=id).first()
        ShiftSchema = Shifts_schema()
        # ShiftSchema = Shifts_schema(many=True)
        output = ShiftSchema.dump(query)
        return output

    def Add_shifts(_name,_code,_shift_start_time,_shift_end_time,_status):
        Query = Shifts(name=_name,code=_code,shift_start_time=_shift_start_time,
                       shift_end_time=_shift_end_time,status=_status,created_at=current_timestamp,updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_Shifts(_id,_name,_code,_shift_start_time,_shift_end_time):
        Shifts.query.filter(Shifts.id==_id).update({Shifts.name: _name,
                                                        Shifts.code: _code,
                                                        Shifts.shift_start_time: _shift_start_time,
                                                        Shifts.shift_end_time: _shift_end_time,
                                                        Shifts.updated_at:current_timestamp})
        db.session.flush()
        db.session.commit()

        # user = User.query.filter_by(id=_id).first()
        # response = {"first_name": user.first_name, "last_name": user.last_name}

    def Change_Status(_id, _status):
        Shifts.query.filter(Shifts.id == _id).update({Shifts.status: _status,Shifts.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Shifts.query.filter_by(id=_id).delete()
        db.session.commit()

class Shifts_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Shifts

class Designations(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20))
    name = db.Column(db.String(50))
    status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,code,name,status,created_at,updated_at):
        self.code = code
        self.name = name
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchDesignationDetails_By_ID(id):
        query = Designations.query.filter_by(id=id).first()
        DesignationSchema = Designations_schema()
        output = DesignationSchema.dump(query)
        return output

    def Add_Designations(_name,_code,_status):
        Query = Designations(name=_name,
                             code=_code,
                             status=_status,
                             created_at=current_timestamp,
                             updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_Designation(_id,_name,_code):
        Designations.query.filter(Designations.id==_id).update({Designations.name: _name,
                                                        Designations.code: _code,
                                                        Designations.updated_at:current_timestamp})
        db.session.flush()
        db.session.commit()

        # user = User.query.filter_by(id=_id).first()
        # response = {"first_name": user.first_name, "last_name": user.last_name}

    def Change_Status(_id, _status):
        Designations.query.filter(Designations.id == _id).update({Designations.status: _status,Designations.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Designations.query.filter_by(id=_id).delete()
        db.session.commit()

class Designations_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Designations

class User_cards(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    cardnum = db.Column(db.String(50))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,user_id,cardnum,created_at,updated_at):
        self.user_id = user_id
        self.cardnum = cardnum
        self.created_at = created_at
        self.updated_at = updated_at


    def FetchUserCardsDetails_By_ID(user_id):
        query = User_cards.query.filter_by(user_id=user_id).first()
        UsercardsSchema = User_cards_schema()
        output = UsercardsSchema.dump(query)
        return output
    def addCards(user_id,cardnum):
        add = User_cards(user_id=user_id,cardnum=cardnum,created_at=current_timestamp,updated_at=current_timestamp)
        db.session.add(add)
        db.session.commit()
    def Delete(_id):
        User_cards.query.filter_by(user_id=_id).delete()
        db.session.commit()

class User_cards_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = User_cards

class User_terminals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    terminal_id = db.Column(db.Integer)
    is_block = db.Column(db.Integer)
    block_from = db.Column(db.DateTime)
    block_to = db.Column(db.DateTime)
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self, user_id, terminal_id,is_block,block_from,block_to,status, created_at, updated_at):
        self.user_id = user_id
        self.terminal_id = terminal_id
        self.is_block = is_block
        self.block_from = block_from
        self.block_to = block_to
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def Get_Terminals_by_userID(UserID):
        query = User_terminals.query.with_entities(User_terminals.terminal_id).filter(User_terminals.user_id==UserID).all()
        Groupterminalsschema = User_terminals_schema(many=True)
        output = Groupterminalsschema.dump(query)
        return [i["terminal_id"] for i in output]

    def Get_USers_by_TerminalID(TerminalID):
        query = User_terminals.query.with_entities(User_terminals.user_id).filter(User_terminals.terminal_id==TerminalID).all()
        Groupterminalsschema = User_terminals_schema(many=True)
        output = Groupterminalsschema.dump(query)
        return [i["user_id"] for i in output]

    def Add_User_Terminals(user_id, terminal_id,status ):
        Query = User_terminals(user_id=user_id,
                               terminal_id=terminal_id,
                               is_block=0,
                               block_from=None,
                               block_to=None,
                               status=status,
                               created_at=current_timestamp,
                               updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_User_terminals(id,user_id, terminal_id,is_block,block_from,block_to,):
        User_terminals.query.filter(User_terminals.id == id).update({User_terminals.user_id: user_id,
                                                    User_terminals.terminal_id: terminal_id,
                                                    User_terminals.is_block: is_block,
                                                    User_terminals.block_from: block_from,
                                                    User_terminals.block_to: block_to,
                                                    User_terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Change_Status(_id, _status):
        User_terminals.query.filter(User_terminals.id == _id).update({User_terminals.status: _status, User_terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        User_terminals.query.filter_by(id=_id).delete()
        db.session.commit()


class User_terminals_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = User_terminals

class Terminals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    alpeta_terminal_id = db.Column(db.Integer)
    short_code = db.Column(db.String(10))
    terminal_type = db.Column(db.String(10))
    description = db.Column(db.String(128))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self, name,alpeta_terminal_id, short_code,terminal_type,description,status, created_at, updated_at):
        self.name = name
        self.alpeta_terminal_id = alpeta_terminal_id
        self.short_code = short_code
        self.terminal_type = terminal_type
        self.description = description
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchTerminals_By_ID(id):
        query = Terminals.query.filter_by(id=id).first()
        termnlSchema = Terminals_schema()
        output = termnlSchema.dump(query)
        return output

    def Add_terminals(name,alpeta_terminal_id, short_code,terminal_type,description,status):
        Query = Terminals(name=name,
                          alpeta_terminal_id=alpeta_terminal_id,
                          short_code=short_code,
                          terminal_type=terminal_type,
                          description=description,
                          status=status,
                          created_at=current_timestamp,
                          updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_Terminals(_id,name,alpeta_terminal_id, short_code,terminal_type,description,):
        Terminals.query.filter(Terminals.id == _id).update({Terminals.name: name,
                                                    Terminals.alpeta_terminal_id: alpeta_terminal_id,
                                                    Terminals.short_code: short_code,
                                                    Terminals.terminal_type: terminal_type,
                                                    Terminals.description: description,
                                                    Terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Change_Status(_id, _status):
        Terminals.query.filter(Terminals.id == _id).update({Terminals.status: _status, Terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Terminals.query.filter_by(id=_id).delete()
        db.session.commit()

class Terminals_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Terminals

class User_fingerprints(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    alpeta_user_id = db.Column(db.Integer)
    fingerid = db.Column(db.Integer)
    totalsize = db.Column(db.Integer)
    template1 = db.Column(db.String)
    template2 = db.Column(db.String)
    convimage1 = db.Column(db.String)
    convimage2 = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self, user_id, alpeta_user_id, fingerid,totalsize,template1,template2,
                 convimage1,convimage2,created_at,updated_at):
        self.user_id = user_id
        self.alpeta_user_id = alpeta_user_id
        self.fingerid = fingerid
        self.totalsize = totalsize
        self.template1 = template1
        self.template2 = template2
        self.convimage1 = convimage1
        self.convimage2 = convimage2
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchUserFingerPrintDetails_By_ID(user_id):
        query = User_fingerprints.query.filter_by(user_id=user_id).all()
        UserFprintsSchema = User_fingerprints_schema()
        UserFprintsSchema = User_fingerprints_schema(many=True)
        output = UserFprintsSchema.dump(query)
        return output

    def add_fingerprint(user_id, alpeta_user_id, fingerid,totalsize,template1,template2,convimage1,convimage2):
        addFingerPrint = User_fingerprints(user_id=user_id, alpeta_user_id=alpeta_user_id, fingerid=fingerid,
                                           totalsize =totalsize,template1 = template1,template2 = template2,
                 convimage1=convimage1,convimage2=convimage2,created_at=current_timestamp,updated_at=current_timestamp)

        db.session.add(addFingerPrint)
        db.session.commit()
        id = addFingerPrint.id
        return id

    def Delete(_id):
        User_fingerprints.query.filter_by(user_id=_id).delete()
        db.session.commit()

class User_fingerprints_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = User_fingerprints

class Auth_log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    terminal_id = db.Column(db.Integer)
    index_key = db.Column(db.Integer)
    event_time = db.Column(db.DateTime)
    auth_type = db.Column(db.Integer)
    auth_result = db.Column(db.Integer)
    func = db.Column(db.Integer)
    func_type = db.Column(db.Integer)
    terminal_name = db.Column(db.String(50))
    log_image = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,user_id,terminal_id,index_key,event_time,auth_type,
                 auth_result,func,func_type,terminal_name,log_image,created_at,updated_at):
        self.user_id = user_id
        self.terminal_id = terminal_id
        self.index_key = index_key
        self.event_time = event_time
        self.auth_type = auth_type
        self.auth_result = auth_result
        self.func = func
        self.func_type = func_type
        self.terminal_name = terminal_name
        self.log_image = log_image
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchUserAuthLogDetails_By_ID(user_id):
        query = Auth_log.query.filter_by(user_id=user_id).first()
        AuthLog = Auth_log_schema()
        output = AuthLog.dump(query)
        return output

class Auth_log_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Auth_log

class Units(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subarea_id = db.Column(db.Integer)
    code = db.Column(db.String(20))
    name = db.Column(db.String(50))
    description = db.Column(db.String(128))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,subarea_id,code,name,description,status,created_at,updated_at):
        self.subarea_id = subarea_id
        self.code = code
        self.name = name
        self.description = description
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def Units_by_SubAreaID(_subarea_id):
        query = Units.query.filter_by(subarea_id=_subarea_id).first()
        return query

    def Add_Units(_subarea_id,_code,_name,_description,_status):
        Query = Units(subarea_id=_subarea_id,code=_code,name=_name,
                      description=_description,status=_status,
                      created_at=current_timestamp,updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_Units(_id,_subarea_id,_code,_name,_description):
        Units.query.filter(Units.id==_id).update({Units.subarea_id: _subarea_id,
                                                        Units.code: _code,
                                                        Units.name: _name,
                                                        Units.description: _description,
                                                        Units.updated_at:current_timestamp})
        db.session.flush()
        db.session.commit()


    def Change_Status(_id, _status):
        Units.query.filter(Units.id == _id).update({Units.status: _status,Units.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Units.query.filter_by(id=_id).delete()
        db.session.commit()

class Units_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Units

class Subarea(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20))
    name = db.Column(db.String(50))
    description = db.Column(db.String(128))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,code,name,description,status,created_at,updated_at):
        self.code = code
        self.name = name
        self.description = description
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchSubareaDetails_By_ID(user_id):
        query = Subarea.query.filter_by(user_id=user_id).first()
        subarea = Subarea_schema()
        output = subarea.dump(query)
        return output


    def Add_Subarea(_code,_name,_description,_status):
        Query = Subarea(code=_code,name=_name,
                      description=_description,status=_status,
                      created_at=current_timestamp,updated_at=current_timestamp)

        db.session.add(Query)
        db.session.commit()

    def Update_Subarea(_id,_code,_name,_description):
        Subarea.query.filter(Subarea.id==_id).update({Subarea.code: _code,
                                                        Subarea.name: _name,
                                                        Subarea.description:_description,
                                                        Subarea.updated_at:current_timestamp})
        db.session.flush()
        db.session.commit()


        # user = User.query.filter_by(id=_id).first()
        # response = {"first_name": user.first_name, "last_name": user.last_name}

    def Change_Status(_id, _status):
        Subarea.query.filter(Subarea.id == _id).update({Subarea.status: _status,Subarea.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Subarea.query.filter_by(id=_id).delete()
        db.session.commit()

class Subarea_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Subarea

class User_facedatas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    templatesize = db.Column(db.Integer)
    templatedata = db.Column(db.String)
    templatetype = db.Column(db.Integer)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,user_id,templatesize,templatedata,templatetype,created_at,updated_at):
        self.user_id = user_id
        self.templatesize = templatesize
        self.templatedata = templatedata
        self.templatetype = templatetype
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchUserfacedatas_By_ID(user_id):
        query = User_facedatas.query.filter_by(user_id=user_id).first()
        UserFacedatasSchema = User_facedatas_schema()
        output = UserFacedatasSchema.dump(query)
        return output

    def AddFaceData(user_id,templatesize,templatedata,templatetype):
        Add = User_facedatas(user_id=user_id,
                             templatesize=templatesize,
                             templatedata=templatedata,
                             templatetype=templatetype,
                             created_at=current_timestamp,
                             updated_at=current_timestamp)
        db.session.add(Add)
        db.session.commit()

    def Delete(_id):
        User_facedatas.query.filter_by(id=_id).delete()
        db.session.commit()

class User_facedatas_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = User_facedatas

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    punch_type = db.Column(db.String(10))
    punch_time = db.Column(db.DateTime)
    terminal_id = db.Column(db.Integer)
    sap_sync = db.Column(db.Boolean)
    sap_sync_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self, user_id, punch_type, punch_time, terminal_id, sap_sync, sap_sync_time, created_at, updated_at):
        self.user_id = user_id
        self.punch_type = punch_type
        self.punch_time = punch_time
        self.terminal_id = terminal_id
        self.sap_sync = sap_sync
        self.sap_sync_time = sap_sync_time
        self.created_at = created_at
        self.updated_at = updated_at

class Attendance_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Attendance

class role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))
    slug = db.Column(db.String(20))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,name,slug,status,created_at,updated_at):
        self.name = name
        self.slug = slug
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

class role_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = role

class Finger_masters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    alpeta_value = db.Column(db.Integer)
    name = db.Column(db.String(20))

    def __init__(self,alpeta_value,name):
        self.alpeta_value = alpeta_value
        self.name = name

class Finger_masters_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Finger_masters

class Vendors(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))
    is_deleted = db.Column(db.Boolean)
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,name,is_deleted,status,created_at,updated_at):
        self.name = name
        self.is_deleted = is_deleted
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

class Vendors_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Vendors

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(128))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,name,description,status,created_at,updated_at):
        self.name = name
        self.description = description
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def FetchGroupDetails_By_ID(id):
        query = Group.query.filter_by(id=id).first()
        GroupSchema = Group_schema()
        output = GroupSchema.dump(query)
        return output

    def Add_Group(_name,_description,_status):
        Query = Group(name=_name,
                      description=_description,
                      status=_status,
                      created_at=current_timestamp,
                      updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_Group(_id, _name,_description):
        Group.query.filter(Group.id == _id).update({Group.name: _name,
                                                    Group.description: _description,
                                                    Group.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Change_Status(_id, _status):
        Group.query.filter(Group.id == _id).update({Group.status: _status,
                                                    Group.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id):
        Group.query.filter_by(id=_id).delete()
        db.session.commit()

class Group_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group

class Group_terminals(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer)
    terminal_id = db.Column(db.Integer)
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def __init__(self,group_id,terminal_id,status,created_at,updated_at):
        self.group_id = group_id
        self.terminal_id = terminal_id
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def GET_TerminalsDEtails_BY_GRoupID(GroupID):
        query = Group_terminals.query.with_entities(Group_terminals.terminal_id).filter(Group_terminals.group_id==GroupID).all()
        Groupterminalsschema = Group_terminals_schema(many=True)
        output = Groupterminalsschema.dump(query)
        # return output
        return [i["terminal_id"] for i in output]

    def GET_GroupID_BY_terminalID(TermianlID):
        query = Group_terminals.query.with_entities(Group_terminals.group_id).filter(Group_terminals.terminal_id==TermianlID).all()
        Groupterminalsschema = Group_terminals_schema(many=True)
        output = Groupterminalsschema.dump(query)
        return [i["group_id"] for i in output]

    def Add_TerminalToGroup(group_id,terminal_id,status):
        Query = Group_terminals(group_id=group_id,
                      terminal_id=terminal_id,
                      status=status,
                      created_at=current_timestamp,
                      updated_at=current_timestamp)
        db.session.add(Query)
        db.session.commit()

    def Update_TerminalToGroup(group_id, terminal_id):
        Group_terminals.query.filter(Group_terminals.group_id == group_id).update({Group_terminals.terminal_id: terminal_id,
                                                    Group_terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Change_Status(_id, _status):
        Group_terminals.query.filter(Group_terminals.id == _id).update({Group_terminals.status: _status,
                                                                        Group_terminals.updated_at: current_timestamp})
        db.session.flush()
        db.session.commit()

    def Delete(_id,terminal_id):
        Group_terminals.query.filter_by(group_id=_id,terminal_id=terminal_id).delete()
        db.session.commit()

class Group_terminals_schema(SQLAlchemyAutoSchema):
    class Meta:
        model = Group_terminals