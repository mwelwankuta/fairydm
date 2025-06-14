type RelativeIndexable<T> = 
  // map types [string, number, boolean, object, array, null, undefined] to their corresponding constructors
  T extends string ? StringConstructor :
  T extends number ? NumberConstructor :
  T extends boolean ? BooleanConstructor :
  T extends object ? ObjectConstructor :
  T extends Array<infer U> ? ArrayConstructor :
  never;

// the type can be StringConstructor, NumberConstructor, BooleanConstructor, etc.
export type SchemaDefinition<T extends object> = {
  [path in keyof T]: {
    type: RelativeIndexable<T[path]>;
    required?: boolean;
    default?: T[path];
  };
};

export class Schema<T extends object> {
  public definition: SchemaDefinition<T>;

  constructor(definition: SchemaDefinition<T>) {
    this.definition = definition;
  }

  public validate(data: any): {
    valid: boolean;
    errors: string[];
    validatedData: any;
  } {
    const errors: string[] = [];
    const validatedData: any = { ...data };

    for (const key in this.definition) {
      const field = this.definition[key];
      const value = validatedData[key];

      // Set default value
      if (field.default !== undefined && value === undefined) {
        validatedData[key] = field.default;
      }

      // Check for required fields
      if (
        field.required &&
        (validatedData[key] === undefined || validatedData[key] === null)
      ) {
        errors.push(`${key} is required.`);
        continue;
      }

      // Basic type checking
      if (
        validatedData[key] !== undefined &&
        field.type &&
        validatedData[key].constructor !== field.type
      ) {
        errors.push(
          `Invalid type for ${key}. Expected ${field.type}, got ${validatedData[key].constructor.name}.`
        );
      }
    }

    return { valid: errors.length === 0, errors, validatedData };
  }
}
