import csv
import os
from datetime import datetime, timedelta
import pysftp
import requests
host = "10.18.1.31"  # change
username = "sap_sync" # change
password = "sap_sync" # change
cnopts = pysftp.CnOpts()
cnopts.hostkeys = None
port = 22


try:
    current_timestamp = datetime.now()
    yesterday = current_timestamp - timedelta(days=1)
    # dev
    simp_path = '/var/www/html/grse1/grse1/static' # change 
    # local
    #simp_path = '/home/ivan/Desktop/GRSE'
    url = "http://10.181.111.60/attendance_all" # change
    payload = {}
    headers = {}
    response_ = requests.request("GET", url, headers=headers, json=payload)
    abs_path = os.path.abspath(simp_path)
    localpath = abs_path+"/frs_" + str(yesterday.strftime("%Y-%m-%d")) + ".csv"
    path =  "/usr/sap/ECCtrans/sap_sync/frs_"+ str(yesterday.strftime("%Y-%m-%d")) + ".csv" # change 
    with open(abs_path + "/frs_" + str(yesterday.strftime("%Y-%m-%d")) + ".csv", 'w',
            newline='') as csvfile:
        fieldnames = ['PERNR', 'TIMR6', 'CHOIC', 'LDATE', 'LTIME', 'SATZA', 'TERMINAL_id',
                      'SERVER_TIME']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        if response_.json()["status"] == "Success":
            for each in response_.json()["Auth_list"]:
                writer.writerow(each)

        else:
            response = {"status": 'error',
                        "message": 'Attendance not found for ' + str(yesterday.strftime("%Y-%m-%d"))}
            print(response)

    with pysftp.Connection(host, username=username, password=password, port=port,cnopts=cnopts) as sftp:
        sftp.put(localpath, path)
    response = {"status": 'Success',
                "message": 'Attendance exported send through FTP for ' + str(yesterday.strftime("%Y-%m-%d"))}
    print(response)
except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)
