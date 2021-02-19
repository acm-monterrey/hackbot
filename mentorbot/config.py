"""
config.py by Jaime Hisao Yesaki
Module that simplifies connections to the database.
Created February 15, 2021
Version 1.0
"""

import pymongo

def connect_to_mongo():
    connection = pymongo.MongoClient("mongodb://services.hisao.org:27017/")
    return connection