from datetime import datetime, timedelta
import requests

try:
    current_timestamp = datetime.now()
    url = "http://10.181.111.60/all_auth_log"
    payload = {}
    headers = {}
    response_ = requests.request("GET", url, headers=headers, json=payload)
    if response_.json()["status"] == "Success":
        response = {"status": 'Success', "message": "All_Auth is running"}
        print(response)
    else:
        response = {"status": 'Error', "message": "Unable to run All_Auth"}
        print(response)

except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)
