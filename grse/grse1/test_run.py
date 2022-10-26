from datetime import datetime, timedelta
import requests
import pymongo

url_mongo = "127.0.0.1"
port_mongo = 27017
db_name_mongo = "grse"
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


try:
    db = database_connect_mongo()
    db = db["all_attendance"]
    current_timestamp = datetime.now()
    db.insert({"PERNR":"","TIMR6":"X","CHOIC":"2011","LDATE":"11.02.2022","LTIME":"14:37:55","SATZA":"","TERMINAL_id":"GRS2","SERVER_TIME":"11.02.2022 14:37:54","LogImage":""})
    response = {"status": 'error', "message": 'Mongodb working fine'}
    print(response)
except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)
