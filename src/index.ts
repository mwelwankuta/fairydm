import { connect, disconnect } from './connection';
import { Model, ModelClass } from './model';
import { Schema } from './schema';

const models: { [name: string]: ModelClass<any> } = {};

const model = <T extends object>(name: string, schema: Schema): ModelClass<T> => {
  if (models[name]) {
    return models[name];
  }

  class DynamicModel extends Model<T> {}

  Object.defineProperty(DynamicModel, 'name', { value: name });

  // Cast to the base Model to access static properties
  const ModelAsClass = DynamicModel as typeof Model;
  ModelAsClass.collectionName = name.toLowerCase() + 's'; // Pluralize for collection name
  ModelAsClass.schema = schema;

  models[name] = DynamicModel as ModelClass<any>;

  return models[name];
};

export { connect, disconnect, model, Schema };
