
# ** GRSE BACKEND API **

## Project Dependencies
1. Python 3.6.7*
2. Postgresql 
3. Flask 

[Project Hosted on Server](https://grse.dev13.ivantechnology.in/)

## Required Features


## Endpoints
|  Method  |  Endpoint  |  Task  |
|  --- |  --- |  ---  |
|  `POST`  |  `/admin/login`  |  `Login As ADMIN`  |
|  `GET`  |  `/admin/logout`  |  `Logout`  |
|  `GET`  |  `/admin/next_user_id`  |  `Next Registerable UserID`  |
|  `GET`  |  `/admin/get_terminals`  |  `Get Terminals List`  |
|  `GET`  |  `/admin/terminal_details/<terminal_id>`  |  `Get Details Of The Terminal`  |

## How to run flask application
1. Create a folder <GRSE> on your computer
   Clone repository to your computer into created folder

    ```
    git clone https://gitlab.com/devlopment.ivan/grse-py-backend.git
    ```
2. Navigate into created folder

    ```
    cd  grse-py-backend
    ```
3. Create and activate  virtual environment.

    ```
        $  pip install virtualenv
   
        $ virtualenv  venv

        $ source venv/bin/activate
    ```

    More on setting up Virtual environment: [how to set up virtual environment](http://docs.python-guide.org/en/latest/dev/virtualenvs/)

4. Install the packages in requirement.txt

    ``` pip3 install -r requirement.txt ```

5. Set up postgresql database and copy connection string for example.

    ``` DATABASE_URL='postgres://<db_user_name>:<password>@localhost/<database_name>' ```

    and

    ``` DATABASE_URL='postgres://<db_user_name>:<password>@localhost/<test_database_name>' ```

    How to setup postgresql: [how to setup postgresql mac](https://gist.github.com/sgnl/609557ebacd3378f3b72)

6. To start the api, using terminal, run the following commands

    ```export FLASK_APP='main_app.py'```

    ```export APP_SETTINGS='development'```

    ```export USER_SECRET_KEY='its nolonger a secret'```
     
    ```export ADMIN_SECRET_KEY='secret'```


    ```export DATABASE_URL='postgres://<db_user_name>:<password>@localhost/<database_name>'```

    ```export TEST_DB_URL='postgres://<db_user_name>:<password>@localhost/<test_database_name>```

    ```flask run ```

7. Using postman, the url to run the api locally is ```http://127.0.0.1:3000/```.

8. On the web, visit the url ```https://grse.dev13.ivantechnology.in/apidocs/```

9. Using postman with web url ```https://grse.dev13.ivantechnology.in/```


#### Author
- Soumendu Mukherjee
