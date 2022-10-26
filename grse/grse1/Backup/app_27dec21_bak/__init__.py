import jwt
from datetime import timedelta
from flask_cors import CORS, cross_origin
from flasgger import Swagger, swag_from
from flask_sqlalchemy import SQLAlchemy
from Settings.config import app_config
from flask import Flask, request, jsonify, make_response, redirect, session
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from sqlalchemy import or_
from sqlalchemy import desc

db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(app_config[config_name])
    app.config['SWAGGER'] = {
        'swagger': '2.0',
        'title': 'GRSE',
        'description': "☆ ☯  𝕿𝖍𝖎𝖘 𝖎𝖘 𝖆 𝕽𝕰𝕾𝕿𝖋𝖚𝖑 Ａℙ𝐢 𝖇𝖚𝖎𝖑𝖙 𝖎𝖓 𝖕𝖞𝖙𝖍𝖔𝖓 𝖚𝖘𝖎𝖓𝖌 𝖙𝖍𝖊 𝕱𝖑𝖆𝖘𝖐 𝕱𝖗𝖆𝖒𝖊𝖜𝖔𝖗𝖐  ♤ ◉‿◉.\
        \n︻デ═一   ---      ---       ---         ---            ---              ---                ---               ---\n𝕬𝖚𝖙𝖍𝖔𝖗 : 𝕾𝖔𝖚𝖒𝖊𝖓𝖉𝖚 𝕸𝖚𝖐𝖍𝖊𝖗𝖏𝖊𝖊 (◣_◢) \n ︻デ═一   ---      ---       ---         ---            ---              ---                ---               ---"
                       "\n 𝕮𝖔𝖒𝖕𝖆𝖓𝖞  : ɪᴠᴀɴ ɪɴꜰᴏᴛᴇᴄʜ\n︻デ═一   ---      ---       ---         ---            ---              ---                ---               ---\n𝖊𝖒𝖆𝖎𝖑 : 𝖙𝖍𝖊𝖒𝖆𝖗𝖎𝖓𝖆𝖉𝖊.𝖎𝖓𝖉@𝖌𝖒𝖆𝖎𝖑.𝖈𝖔𝖒",
        'contact': {
            'Developer': '𝕾𝖔𝖚𝖒𝖊𝖓𝖉𝖚 𝕸𝖚𝖐𝖍𝖊𝖗𝖏𝖊𝖊',
            'Email': 'themarinade.ind@@gmail.com',
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
    from app.group.views import Group_View
    from app.user_terminals.views import User_terminals_view
    from app.terminals.views import Terminals_view
    from app.group_terminals.views import Group_Terminals_View

    app.register_blueprint(units_view)
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

    return app
