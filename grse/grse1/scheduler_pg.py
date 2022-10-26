import csv
import os
from datetime import datetime, timedelta
import pysftp
import requests
try:
    #dev
    url = "http://10.181.111.60/auth_log_pg" # change
    # local
    #url = "http://127.0.0.1:3000/auth_log_pg"  # change
    payload = {}
    headers = {}
    response_ = requests.request("GET", url, headers=headers, json=payload)
    response = {"status": 'Success',
                "message": response_.json()}
    print(response)
except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)
