import jwt
from datetime import timedelta
from flask_cors import CORS, cross_origin
from flasgger import Swagger, swag_from
from flask_sqlalchemy import SQLAlchemy
from Settings.config import app_config
from flask import Flask, render_template, request, jsonify, make_response, redirect, session
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from sqlalchemy import or_
from sqlalchemy import desc
from flask_mongoengine import MongoEngine
import pdfkit


mdb = MongoEngine()
db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()



def create_app(config_name):
    app = Flask(__name__, template_folder="C:\\Users\\Datacore\\Desktop\\grse\\grse1\\templates")
    app.config.from_object(app_config[config_name])
    app.config['SWAGGER'] = {
        'swagger': '2.0',
        'title': 'GRSE',
        'description': " # GRSE Attendance and Access Control System "
                       "\n This is the registry API for GRSE. It allows you to access, manage, and update API's and\n"
                       "Domains in Swagger bypassing the web application"
                       "\nAuthor: Ivan Infotech"
                       "\nCompany: IVAN Infotech Pvt Ltd.\n"
                       ,
        'contact': {
            'Developer': 'Ivan Infotech',
            'Email': 'contact@ivaninfotech.com',
            'Company': 'IVAN Infotech Pvt Ltd.',
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
    
    @app.route('/<name>/<designation>/<id>')
    def pdf_print(name, designation, id):
        data = {
            "name":name,
            "designation": designation,
            "id" : id
        }
        html_template = render_template("user_template.html", data=data)


        res = pdfkit.from_string(html_template, False)
        response = make_response(res)

        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'inline; filename=output.pdf'

        return response

    from app.auth.admin_auth.views import admin_auth
    # from app.units.views import units_view
    from app.department.views import Department_View
    from app.designations.views import Designations_View
    from app.shifts.views import Shifts_View
    from app.subarea.views import Subarea_View
    from app.user.views import users_view
    from app.group.views import Group_View
    from app.user_terminals.views import User_terminals_view
    from app.terminals.views import Terminals_view
    from app.group_terminals.views import Group_Terminals_View
    from app.Blacklist.views import Blacklist_view
    from app.clm.views import Clm_view
    from app.crform.views import CRForm_view

    # app.register_blueprint(units_view)
    app.register_blueprint(Department_View)
    app.register_blueprint(Shifts_View)
    app.register_blueprint(Subarea_View)
    app.register_blueprint(Designations_View)
    app.register_blueprint(users_view)
    app.register_blueprint(admin_auth)
    app.register_blueprint(Group_View)
    app.register_blueprint(User_terminals_view)
    app.register_blueprint(Terminals_view)
    app.register_blueprint(Group_Terminals_View)
    app.register_blueprint(Blacklist_view)
    app.register_blueprint(Clm_view)
    app.register_blueprint(CRForm_view)

    return app
