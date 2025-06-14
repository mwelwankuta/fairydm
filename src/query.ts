import { FieldPath } from 'firebase-admin/firestore';
import { ModelClass } from './model';

const OPERATOR_MAP: { [key: string]: FirebaseFirestore.WhereFilterOp } = {
  $eq: '==',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
  $ne: '!=',
  $in: 'in',
  $nin: 'not-in',
  $array_contains: 'array-contains',
  $array_contains_any: 'array-contains-any',
};

/**
 * Apply a query to a Firestore collection
 * @param modelClass - The model class to apply the query to
 * @param query - The query to apply
 * @returns A Firestore query
 * @example
 * const users = await UserModel.find({
 *   email: {
 *     $in: ["123", "456"],
 *   },
 * });
 */
export function applyQuery<T extends object>(
  modelClass: ModelClass<T>,
  query: any
): FirebaseFirestore.Query {
  let firestoreQuery: FirebaseFirestore.Query = modelClass.db.collection(modelClass.collectionName);

  for (const key in query) {
    const value = query[key];
    const fieldToQuery = key === '_id' ? FieldPath.documentId() : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle operators like { age: { $gt: 18 } }
      for (const operator in value) {
        if (OPERATOR_MAP[operator]) {
          firestoreQuery = firestoreQuery.where(fieldToQuery, OPERATOR_MAP[operator], value[operator]);
        }
      }
    } else {
      // Handle simple equality { name: 'Alice' }
      firestoreQuery = firestoreQuery.where(fieldToQuery, '==', value);
    }
  }

  return firestoreQuery;
} 