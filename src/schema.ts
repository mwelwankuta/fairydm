// A field can be a constructor, a schema, or an array of one of those.
type SchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | Schema<any> // for nested schemas
  | [StringConstructor]
  | [NumberConstructor]
  | [BooleanConstructor]
  | [DateConstructor]
  | [Schema<any>]; // for array of subdocuments

// A field definition can be just the type, or an object with more options.
type SchemaField<T> = {
  type: SchemaType;
  required?: boolean;
  default?: T; // the original default value type , i.e T
};

export type SchemaDefinition<T extends object> = {
  [path in keyof T]?: SchemaField<T[path]> | SchemaType;
};

function validateRecursive(
  data: any,
  schemaDef: SchemaDefinition<any>
): { errors: string[]; validatedData: any } {
  const errors: string[] = [];
  const validatedData: any = { ...data };
  for (const key of Object.keys(schemaDef)) {
    const fieldDef = schemaDef[key];
    if (!fieldDef) continue;

    const field = "type" in fieldDef ? fieldDef : { type: fieldDef };
    let value = validatedData[key];

    // 1. Default value
    if (field.default !== undefined && value === undefined) {
      validatedData[key] = field.default;
      value = validatedData[key];
    }

    // 2. Required check
    if (field.required && (value === undefined || value === null)) {
      errors.push(`'${key}' is required.`);
      continue;
    }

    // Skip non-required fields that aren't present
    if (value === undefined || value === null) {
      continue;
    }

    // 3. Validation
    const fieldType = field.type;

    if (fieldType instanceof Schema) {
      // Nested schema
      const result = fieldType.validate(value);
      if (!result.valid) {
        errors.push(...result.errors.map((e) => `${key}.${e}`));
      }
      validatedData[key] = result.validatedData;
    } else if (Array.isArray(fieldType)) {
      // Array of schemas or primitives
      if (!Array.isArray(value)) {
        errors.push(
          `Invalid type for '${key}'. Expected Array, got ${value.constructor.name}.`
        );
        continue;
      }

      const arrayContentType = fieldType[0];
      const validatedArray: any[] = [];
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (arrayContentType instanceof Schema) {
          const result = arrayContentType.validate(item);
          if (!result.valid) {
            errors.push(...result.errors.map((e) => `${key}[${i}].${e}`));
          }
          validatedArray.push(result.validatedData);
        } else {
          // primitive
          if (item.constructor !== arrayContentType) {
            errors.push(
              `Invalid type for '${key}[${i}]'. Expected ${
                (arrayContentType as any).name
              }, got ${item.constructor.name}.`
            );
          }
          validatedArray.push(item);
        }
      }
      validatedData[key] = validatedArray;
    } else {
      // Primitive
      if (value.constructor !== fieldType) {
        errors.push(
          `Invalid type for '${key}'. Expected ${
            (fieldType as any).name
          }, got ${value.constructor.name}.`
        );
        continue;
      }
    }
  }
  return { errors, validatedData };
}

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
    const { errors, validatedData } = validateRecursive(data, this.definition);
    return { valid: errors.length === 0, errors, validatedData };
  }
}
