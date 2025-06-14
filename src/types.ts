// Defines the shape of query operators like $in, $gt, etc.
type QuerySelector<T> = {
  $eq?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
  $array_contains?: T extends (infer E)[] ? E : never;
  $array_contains_any?: T extends (infer E)[] ? E[] : never;
};

// A recursive type for building queries. It allows for direct value comparison,
// query selector objects, or nested query objects for sub-documents.
export type FilterQuery<T> = Partial<{
  [P in keyof T]: T[P] extends object
    ? FilterQuery<T[P]> | QuerySelector<T[P]>
    : T[P] | QuerySelector<T[P]>;
}> & { _id?: string | QuerySelector<string> };

// Represents the update document.
export type UpdateQuery<T> = {
  $set?: Partial<T>;
  $unset?: { [P in keyof T]?: '' };
  [key: string]: any;
}; 