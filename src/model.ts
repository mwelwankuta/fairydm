import { Schema } from './schema';
import { getFirestore } from './connection';
import { applyQuery } from './query';
import { FilterQuery, UpdateQuery } from './types';

export type ModelClass<T extends object> = {
  new (data: T, id?: string): Model<T>; // Constructor signature
  create(data: Partial<T>): Promise<Model<T>>;
  findOne(query: FilterQuery<T>): Promise<Model<T> | null>;
  find(query: FilterQuery<T>): Promise<Model<T>[]>;
  findByIdAndDelete(id: string): Promise<{ acknowledged: boolean; deletedCount: number }>;
  deleteMany(query: FilterQuery<T>): Promise<{ acknowledged: boolean; deletedCount: number }>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }>;
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }>;
} & typeof Model;

export class Model<T extends object> {
  // These are set on the dynamically created class that extends this one
  static collectionName: string;
  static schema: Schema;
  private static _db: FirebaseFirestore.Firestore;

  static get db(): FirebaseFirestore.Firestore {
    if (!this._db) {
      this._db = getFirestore();
    }
    return this._db;
  }

  public data: T;
  public id?: string;

  constructor(data: T, id?: string) {
    this.data = data;
    if (id) {
      this.id = id;
    }
  }

  async save(): Promise<this> {
    const constructor = this.constructor as typeof Model;
    const collection = constructor.db.collection(constructor.collectionName);

    // If the document has an ID, it exists, so we update it.
    // Otherwise, we create a new one.
    if (this.id) {
      await collection.doc(this.id).set(this.data);
    } else {
      const docRef = await collection.add(this.data);
      this.id = docRef.id;
    }
    return this;
  }

  static async create<T extends object>(this: ModelClass<T>, data: Partial<T>): Promise<Model<T>> {
    const { valid, errors, validatedData } = this.schema.validate(data);

    if (!valid) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const modelInstance = new this(validatedData);
    await modelInstance.save();
    return modelInstance;
  }

  static async findOne<T extends object>(this: ModelClass<T>, query: FilterQuery<T>): Promise<Model<T> | null> {
    const firestoreQuery = applyQuery(this, query);
    const snapshot = await firestoreQuery.limit(1).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data() as T;

    return new this(data, doc.id);
  }

  static async find<T extends object>(this: ModelClass<T>, query: FilterQuery<T>): Promise<Model<T>[]> {
    const firestoreQuery = applyQuery(this, query);
    const snapshot = await firestoreQuery.get();

    return snapshot.docs.map(doc => new this(doc.data() as T, doc.id));
  }

  static async findByIdAndDelete<T extends object>(this: ModelClass<T>, id: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
    try {
      await this.db.collection(this.collectionName).doc(id).delete();
      return { acknowledged: true, deletedCount: 1 };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { acknowledged: false, deletedCount: 0 };
    }
  }

  static async deleteMany<T extends object>(this: ModelClass<T>, query: FilterQuery<T>): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const firestoreQuery = applyQuery(this, query);
    const snapshot = await firestoreQuery.get();

    if (snapshot.empty) {
      return { acknowledged: true, deletedCount: 0 };
    }

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    try {
      await batch.commit();
      return { acknowledged: true, deletedCount: snapshot.size };
    } catch (error) {
      console.error('Error deleting documents in batch:', error);
      return { acknowledged: false, deletedCount: 0 };
    }
  }

  static async updateOne<T extends object>(this: ModelClass<T>, filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }> {
    const firestoreQuery = applyQuery(this, filter).limit(1);
    const snapshot = await firestoreQuery.get();

    if (snapshot.empty) {
      return { acknowledged: true, modifiedCount: 0, matchedCount: 0 };
    }

    const doc = snapshot.docs[0];
    try {
      await doc.ref.update(update as any);
      return { acknowledged: true, modifiedCount: 1, matchedCount: 1 };
    } catch (error) {
      console.error('Error updating document:', error);
      return { acknowledged: false, modifiedCount: 0, matchedCount: 1 };
    }
  }

  static async updateMany<T extends object>(this: ModelClass<T>, filter: FilterQuery<T>, update: UpdateQuery<T> | Partial<T>): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }> {
    const firestoreQuery = applyQuery(this, filter);
    const snapshot = await firestoreQuery.get();

    if (snapshot.empty) {
      return { acknowledged: true, modifiedCount: 0, matchedCount: 0 };
    }

    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, update as any);
    });

    try {
      await batch.commit();
      return { acknowledged: true, modifiedCount: snapshot.size, matchedCount: snapshot.size };
    } catch (error) {
      console.error('Error updating documents in batch:', error);
      return { acknowledged: false, modifiedCount: 0, matchedCount: snapshot.size };
    }
  }
}