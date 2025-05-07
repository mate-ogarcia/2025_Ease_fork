#!/usr/bin/env python3

import requests
import time
import os
import json
from requests.auth import HTTPBasicAuth

def wait_for_couchbase():
    """Wait for Couchbase to be available"""
    max_retries = 30
    retry = 0
    while retry < max_retries:
        try:
            response = requests.get("http://couchbase:8091")
            if response.status_code == 200:
                print("Couchbase is available!")
                return True
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to Couchbase: {e}")
        print(f"Waiting for Couchbase... ({retry}/{max_retries})")
        time.sleep(10)
        retry += 1
    return False

def main():
    if not wait_for_couchbase():
        print("Failed to connect to Couchbase")
        exit(1)
        
    # Attendre que le cluster soit complètement initialisé
    time.sleep(10)
        
    # Lancer l'importation des buckets
    print("Starting bucket import...")
    os.system("python /app/importBuckets.py")
    
if __name__ == "__main__":
    main() 