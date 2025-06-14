// A partial representation of the document for querying.
export type FilterQuery<T> = Partial<T & { _id: string }> & {
  [P in keyof T]?: T[P] | { [key: string]: any };
};

// Represents the update document.
export type UpdateQuery<T> = {
  $set?: Partial<T>;
  $unset?: { [P in keyof T]?: '' };
  [key: string]: any;
}; 