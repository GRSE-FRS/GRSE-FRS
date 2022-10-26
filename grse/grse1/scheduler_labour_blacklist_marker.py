from datetime import datetime, timedelta
import requests

try:
    current_timestamp = datetime.now()
    url = "https://grse.dev13.ivantechnology.in/labour_onboard_validation"
    payload = {}
    headers = {}
    response_ = requests.request("GET", url, headers=headers, json=payload)
    if response_.json()["status"] == "Success":
        response = {"status": 'Success', "message": "labour validity is running"}
        print(response)
    else:
        response = {"status": 'Error', "message": "Unable to run labour validity"}
        print(response)

except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)