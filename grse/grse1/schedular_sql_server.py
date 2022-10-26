from datetime import datetime, timedelta
import requests

try:
    CurrentDatetime = datetime.now()
    yesterday = CurrentDatetime - timedelta(days=1)
    #url = "https://grse.dev13.ivantechnology.in/all_auth_log_mssql"
    url = "http://10.181.111.60/all_auth_log_mssql"  # change
    #url = "http://127.0.0.1:3000/all_auth_log_mssql"
    payload = {"Date": yesterday.strftime("%Y-%m-%d")}
    headers = {}
    response_ = requests.request("POST", url, headers=headers, json=payload)
    if response_.json()["status"] == "Success":
        response = response_.json()
        the_dir = '/var/www/html/grse1/grse1/mis'
        filename = response.get("filename")
        f = open(f"{the_dir}/mssql_sync_log_{filename}.txt", "a")
        f.write("{0} -- {1}\n".format(datetime.now().strftime("%Y-%m-%d %H:%M"), response.get("message")))
        f.close()
        print(response)
    else:
        response = response_.json()
        print(response)

except Exception as e:
    response = {"status": 'error', "message": f'{str(e)}'}
    print(response)
