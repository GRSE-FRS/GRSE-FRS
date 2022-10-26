from app import mdb
import datetime

current_timestamp = datetime.datetime.now()


class Users_log(mdb.Document):
    id = mdb.StringField(primary_key=True)
    user_id = mdb.StringField()
    alpeta_user_id = mdb.StringField()
    log_desc = mdb.StringField()
    type = mdb.StringField()
    created_at = mdb.StringField()
    status = mdb.StringField()

    def to_json(self):
        return {"id": self.id,
                "user_id": self.user_id,
                "alpeta_user_id": self.alpeta_user_id,
                "log_desc": self.log_desc,
                "type": self.type,
                "created_at": self.created_at,
                "status": self.status}

    def add_user_log(user_id, alpeta_user_id, log_desc, type, status):
        Users_log(user_id=user_id,
                  alpeta_user_id=alpeta_user_id,
                  log_desc=log_desc,
                  type=type,
                  created_at=current_timestamp,
                  status=status).save()

import pymongo

url_mongo = "127.0.0.1"
port_mongo = 27017
db_name_mongo = "grse"
#db_name_mongo = "grsepoc"
#db_name_mongo = "attendance"
#collection = "attendance"


def connect_mongo_db(url, port):
    return pymongo.MongoClient(url, port)


def connect_database(db_name, db_connect):
    database = db_connect[db_name]
    return database


def database_connect_mongo():
    conn = connect_mongo_db(url_mongo, port_mongo)

    db_con = connect_database(db_name_mongo, conn)
    status = db_con.command("dbstats")
    print(status)
    return db_con
# class Attendance(mdb.Document):
#     id = mdb.StringField(primary_key=True)
#     alpeta_user_id = mdb.StringField()
#     Date = mdb.DateTimeField()
#     type = mdb.StringField()
#     created_at = mdb.DateTime()
#     updated_at = mdb.DateTime()
#     status = mdb.StringField()
#
#     def to_json(self):
#         return {"id": self.id,
#                 "user_id": self.user_id,
#                 "alpeta_user_id": self.alpeta_user_id,
#                 "log_desc": self.log_desc,
#                 "type": self.type,
#                 "created_at": self.created_at,
#                 "status": self.status}
#
#     def add_user_log(user_id, alpeta_user_id, log_desc, type, status):
#         Users_log(user_id=user_id,
#                   alpeta_user_id=alpeta_user_id,
#                   log_desc=log_desc,
#                   type=type,
#                   created_at=current_timestamp,
#                   status=status).save()
