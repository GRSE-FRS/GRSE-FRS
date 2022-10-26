import jwt
from datetime import timedelta
from flask_cors import CORS, cross_origin
from flasgger import Swagger, swag_from
from flask_sqlalchemy import SQLAlchemy
from Settings.config import app_config
from flask import Flask, request, jsonify, make_response, redirect, session
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(app_config[config_name])
    app.config['SWAGGER'] = {
        'swagger': '2.0',
        'title': 'GRSE',
        'description': "This is a RESTful API built in python using the Flask Framework ◉‿◉.\
        \nAuthor : Ivan Infotech Pvt Ltd.  ╾━╤デ╦︻(˙ ͜ʟ˙ ),\n Company ︻デ═一 : IVAN Infotech,\nemail : info@ivaninfotech.com",
        'contact': {
            'Developer': 'Ivan Infotech Pvt Ltd.',
            'Email': 'info@ivaninfotech.com',
            'Company': 'IVAN Infotech',
        },

        'schemes': [
            'http'
        ],

        'license': {
            'name': 'private'
        },
        'tags': [
            {
                'name': 'Users',
                'description': 'The basic unit of authentication'
            },
            {
                'name': 'Shifts',
                'description': ''
            },
            {
                'name': 'Subarea',
                'description': ''
            },
            {
                'name': 'Units',
                'description': ''
            },

            {
                'name': 'Admin',
                'description': 'Overall user that moderates the API'
            },

            {
                'name': 'Department',
                'description': ''
            },
            {
                'name': 'Designations',
                'description': ''
            },
        ],

        'specs_route': '/apidocs/'
    }

    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    swagger = Swagger(app)

    @app.route('/')
    def index():
        return redirect('/apidocs/')

    from app.auth.admin_auth.views import admin_auth
    from app.units.views import units_view
    from app.department.views import Department_View
    from app.designations.views import Designations_View
    from app.shifts.views import Shifts_View
    from app.subarea.views import Subarea_View
    from app.user.views import users_view


    app.register_blueprint(units_view)
    app.register_blueprint(Department_View)
    app.register_blueprint(Shifts_View)
    app.register_blueprint(Subarea_View)
    app.register_blueprint(Designations_View)
    app.register_blueprint(users_view)
    app.register_blueprint(admin_auth)

    return app
