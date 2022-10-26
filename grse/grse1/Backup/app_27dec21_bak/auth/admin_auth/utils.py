from app import *
from functools import wraps
from flask import current_app
from app_cashing import Cache

def user_Required(U):
    @wraps(U)
    def wrapper(*args, **kwargs):
        token = request.headers.get('token')
        try:
            decoded_token = jwt.decode(token,current_app.config['USER_SECRET_KEY'],algorithms=['HS256'])
            email = decoded_token['email']
            if email in Cache.cache.keys() and Cache.get(email)==token:
                print("user Verified")
                return U(*args, **kwargs)
            else:
                return jsonify({"AUTH ERROR": "USER AUTHORISATION REQUIRED"}),401
        except:
            return jsonify({"AUTH ERROR": "USER AUTHORISATION REQUIRED"}),401

    return wrapper


