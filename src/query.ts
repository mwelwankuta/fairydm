import { FieldPath } from "firebase-admin/firestore";
import { ModelClass } from "./model";

const OPERATOR_MAP: { [key: string]: FirebaseFirestore.WhereFilterOp } = {
  $eq: "==",
  $gt: ">",
  $gte: ">=",
  $lt: "<",
  $lte: "<=",
  $ne: "!=",
  $in: "in",
  $nin: "not-in",
  $array_contains: "array-contains",
  $array_contains_any: "array-contains-any",
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
  let firestoreQuery: FirebaseFirestore.Query = modelClass.db.collection(
    modelClass.collectionName
  );

  const processQuery = (q: any, parentPath = "") => {
    for (const key in q) {
      const value = q[key];
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const fieldToQuery =
        currentPath === "_id" ? FieldPath.documentId() : currentPath;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const operators = Object.keys(value);
        const isOperatorObject = operators.some((op) => OPERATOR_MAP[op]);
        if (isOperatorObject) {
          for (const op of operators) {
            if (OPERATOR_MAP[op]) {
              firestoreQuery = firestoreQuery.where(
                fieldToQuery,
                OPERATOR_MAP[op],
                value[op]
              );
            }
          }
        } else {
          // Nested object for subfield queries
          processQuery(value, currentPath);
        }
      } else {
        // Direct equality
        firestoreQuery = firestoreQuery.where(fieldToQuery, "==", value);
      }
    }
  };

  processQuery(query);
  return firestoreQuery;
}
