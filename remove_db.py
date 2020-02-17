from pymongo import MongoClient
import time

def remove_db():
    client = MongoClient('mongodb://localhost/recommodation')
    db = client.recommodation
    for user in db.users.find():
        if user['intentions'] == [] or user['memories'] == [] or user['preferredName'] == '': # or not 'takeout1Id' in user.keys():
            db.users.remove(user)

remove_db()
