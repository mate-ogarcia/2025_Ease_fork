import { Injectable, OnModuleInit } from '@nestjs/common';
import * as couchbase from 'couchbase';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private cluster: couchbase.Cluster;
  private bucket: couchbase.Bucket;

  async onModuleInit() {
    if (!this.cluster) {
      await this.connectToDatabase();
    }
  }

  private async connectToDatabase() {
    try {
      this.cluster = await couchbase.connect('couchbase://192.168.56.1', {
        username: 'Mateo',
        password: 'mateoPass',
      });
      this.bucket = this.cluster.bucket('ProductsBDD');
      console.log('✅ Connexion réussie à Couchbase !');
    } catch (error) {
      console.error('❌ Erreur de connexion à Couchbase :', error);
    }
  }

  getBucket() {
    if (!this.bucket) {
      throw new Error(
        'Bucket non initialisé. Vérifiez la connexion Couchbase.',
      );
    }
    return this.bucket;
  }

  getCollection() {
    return this.bucket.defaultCollection();
  }
}
