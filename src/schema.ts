export type SchemaDefinition = {
  [path: string]: {
    type: any;
    required?: boolean;
    default?: any;
  };
};

export class Schema {
  public definition: SchemaDefinition;

  constructor(definition: SchemaDefinition) {
    this.definition = definition;
  }

  public validate(data: any): { valid: boolean; errors: string[]; validatedData: any } {
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
      if (field.required && (validatedData[key] === undefined || validatedData[key] === null)) {
        errors.push(`${key} is required.`);
        continue;
      }

      // Basic type checking
      if (validatedData[key] !== undefined && field.type && validatedData[key].constructor !== field.type) {
        errors.push(`Invalid type for ${key}. Expected ${field.type.name}, got ${validatedData[key].constructor.name}.`);
      }
    }

    return { valid: errors.length === 0, errors, validatedData };
  }
} 