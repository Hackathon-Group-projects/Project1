from pymongo import MongoClient
import os

client = MongoClient('mongodb+srv://kashvi9112007_db_user:MPdyPPoRC9OhSm9n@cluster01.1i1zkos.mongodb.net/?appName=Cluster01')
db = client['test']
print(f"Total Scans: {db.scans.count_documents({})}")
print(f"Scans with userId: {db.scans.count_documents({'userId': {'$ne': None}})}")
first_scan = db.scans.find_one()
print(f"First scan userId type: {type(first_scan.get('userId'))} value: {first_scan.get('userId')}")
