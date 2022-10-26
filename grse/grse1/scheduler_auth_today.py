import requests
try:
    #dev
    #API where only current date's data will be pulled from Alpeta and push to MongoDB.
    #url = "https://grse.dev13.ivantechnology.in/auth_log_today" # change
    # local
    url = "http://10.181.111.60/auth_log_today"  # change
    payload = {}
    headers = {}
    response_ = requests.request("POST", url, headers=headers, json=payload)
    response = {"status": 'Success',
                "message": response_.json()}
    print(response)
except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)