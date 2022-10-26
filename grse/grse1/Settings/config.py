import sqlite3
import os

base_url = 'http://10.181.111.61:9004/v1'

Alpeta_Login_Id = "Master"
Alpeta_Login_Password = "0000"
Alpeta_Login_UserType = 2
download_url = "http://10.181.111.60"

class Config():
    USER_SECRET_KEY = 'its nolonger a secret'
    ADMIN_SECRET_KEY = 'secret'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = ''

class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True
    SECRET_KEY = 'secret'
    USER_SECRET_KEY = 'qwerty@123456798'
    ADMIN_SECRET_KEY = 'secret'
    # SQLALCHEMY_DATABASE_URI='sqlite:///site2.db'
    # mysql://root:Ivan@123@localhost/app_db
    # SQLALCHEMY_DATABASE_URI = 'postgresql://grse1:grse1@localhost/grse1'
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:12345@localhost/grse'
    
class TestingConfig(Config):
    """Configurations for Testing, with a separate test database."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    USER_SECRET_KEY = 'i wont tell if you dont'
    ADMIN_SECRET_KEY = 'secret'
    SQLALCHEMY_DATABASE_URI = ''

class StagingConfig(Config):
    DEBUG = True
    DEVELOPMENT = True
    USER_SECRET_KEY = 'its nolonger a secret'
    ADMIN_SECRET_KEY = 'secret'
    SQLALCHEMY_DATABASE_URI = ''
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    USER_SECRET_KEY = 'its nolonger a secret'
    ADMIN_SECRET_KEY = 'secret'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app_config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'staging': StagingConfig,
    'production': ProductionConfig,
}
