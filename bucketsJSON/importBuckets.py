import os
import json
import time
import sys
import uuid  # Added uuid import
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions
from couchbase.auth import PasswordAuthenticator
from couchbase.management.buckets import CreateBucketSettings
from couchbase.exceptions import BucketAlreadyExistsException, DocumentExistsException

# Force UTF-8 encoding for console output
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Couchbase Configuration
COUCHBASE_HOST = "couchbase://couchbase"
COUCHBASE_USER = "user1"
COUCHBASE_PASSWORD = "password"

# Folder containing JSON files
EXPORT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exportedBucketsData")

# Connect to Couchbase cluster
cluster = Cluster(COUCHBASE_HOST, ClusterOptions(PasswordAuthenticator(COUCHBASE_USER, COUCHBASE_PASSWORD)))

# List of additional buckets to create if they don't exist
ADDITIONAL_BUCKETS = ["FavoritesBDD", "SearchHistoryBDD", "CommentsBDD"]

# Function to read JSON files and return data
def load_json_data():
    bucket_data = {}
    for file_name in os.listdir(EXPORT_DIR):
        if file_name.endswith("_export.json"):
            bucket_name = file_name.replace("_export.json", "")
            file_path = os.path.join(EXPORT_DIR, file_name)
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    bucket_data[bucket_name] = json.load(file)
                print(f"[INFO] Data loaded from {file_name}")
            except Exception as e:
                print(f"[ERROR] Error reading {file_name}: {e}")
    return bucket_data

# Function to create a bucket if it doesn't exist
def create_bucket(cluster, bucket_name):
    bucket_manager = cluster.buckets()
    try:
        existing_buckets = [bucket.name for bucket in bucket_manager.get_all_buckets()]
        if bucket_name not in existing_buckets:
            bucket_manager.create_bucket(
                CreateBucketSettings(
                    name=bucket_name,
                    ram_quota_mb=100,
                    flush_enabled=True
                )
            )
            print(f"[SUCCESS] Bucket '{bucket_name}' created successfully.")
            time.sleep(5)  # Wait for the bucket to be available
        else:
            print(f"[WARNING] Bucket '{bucket_name}' already exists.")
    except BucketAlreadyExistsException:
        print(f"[WARNING] Bucket '{bucket_name}' already exists.")
    except Exception as e:
        print(f"[ERROR] Error creating bucket '{bucket_name}': {e}")

# Function to insert documents into a bucket
def insert_documents(cluster, bucket_name, documents):
    try:
        bucket = cluster.bucket(bucket_name)
        collection = bucket.scope("_default").collection("_default")  # Default collection
        time.sleep(2)  # Wait for the bucket to be ready

        for doc in documents:
            # For UsersBDD, ALWAYS use email as ID
            if bucket_name == "UsersBDD":
                if "email" in doc:
                    doc_id = doc["email"]
                    print(f"[INFO] Using email as ID for user: {doc_id}")
                else:
                    # If no email, generate a UUID (rare case)
                    doc_id = str(uuid.uuid4())
                    print(f"[WARNING] User without email, generated ID: {doc_id}")
            else:
                # For other buckets, look for id, uuid, _id or generate
                doc_id = str(doc.get("id", doc.get("uuid", doc.get("_id", None))))
                if not doc_id or doc_id == "None":
                    doc_id = str(uuid.uuid4())
                    print(f"[INFO] Generated a new ID for document in {bucket_name}: {doc_id}")
            
            try:
                collection.upsert(doc_id, doc)
                print(f"[SUCCESS] Document inserted in {bucket_name} with ID: {doc_id}")
            except DocumentExistsException:
                print(f"[WARNING] Document with ID {doc_id} already exists.")
            except Exception as e:
                print(f"[ERROR] Error during insertion in {bucket_name}: {e}")

    except Exception as e:
        print(f"[ERROR] Unable to access bucket '{bucket_name}': {e}")

# Load JSON files
buckets_data = load_json_data()

# Create buckets and insert documents
for bucket_name, documents in buckets_data.items():
    create_bucket(cluster, bucket_name)  # Creates the bucket if it doesn't exist
    insert_documents(cluster, bucket_name, documents)  # Inserts documents

# Create additional buckets
for bucket_name in ADDITIONAL_BUCKETS:
    create_bucket(cluster, bucket_name)
    print(f"[INFO] Additional bucket '{bucket_name}' created or verified.")

print("[FINISHED] Import completed!")
