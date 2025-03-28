import os
from couchbase.cluster import Cluster
from couchbase.options import ClusterOptions
from couchbase.auth import PasswordAuthenticator
import json

def export_bucket(bucket_name):
    # Define the path to the couchbase-data/data directory
    # Modify the path if necessary based on your environment
    export_dir = os.path.join('couchbase-data', 'data')
    os.makedirs(export_dir, exist_ok=True)
    
    # Connect to the Couchbase cluster
    cluster = Cluster('couchbase://localhost',
                      ClusterOptions(PasswordAuthenticator('user1', 'password')))
   
    # Access the specified bucket
    bucket = cluster.bucket(bucket_name)
    collection = bucket.default_collection()
   
    # Retrieve all documents from the bucket
    results = []
    query = f"SELECT * FROM `{bucket_name}`"
    result = cluster.query(query)
   
    # Iterate over the query result and append data to results
    for row in result:
        results.append(row[bucket_name])
   
    # Full path for the export file within the couchbase-data/data folder
    export_path = os.path.join(export_dir, f'{bucket_name}_export.json')
    
    # Export data as JSON
    with open(export_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
   
    print(f"Exported {len(results)} documents to {export_path}")

# Export all specified buckets
export_bucket('UsersBDD')
export_bucket('ProductsBDD')
export_bucket('CategoryBDD')
export_bucket('BrandsBDD')
