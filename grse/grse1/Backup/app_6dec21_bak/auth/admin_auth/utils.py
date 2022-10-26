from app import *
from functools import wraps
from flask import current_app


def user_Required(U):
    @wraps(U)
    def wrapper(*args, **kwargs):
        token = request.headers.get('token')
        try:
            # print(token)
            token_decode = jwt.decode(token,current_app.config['USER_SECRET_KEY'],algorithms=['HS256'])
            # print(token_decode)
            # print(session)

            if session['email'] == token_decode['email']:
                # print("user Verified")
                return U(*args, **kwargs)
            else:
                return jsonify({"AUTH ERROR": "USER AUTHORISATION REQUIRED"}),401
        except:
            return jsonify({"AUTH ERROR": "USER AUTHORISATION REQUIRED"}),401

    return wrapper


