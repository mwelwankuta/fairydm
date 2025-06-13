# fairydm

A simple, Mongoose-like ODM (Object Document Mapper) for Google Firestore, designed to bring structure and type safety to your Firestore data models in TypeScript projects.

[![npm version](https://badge.fury.io/js/fairydm.svg)](https://badge.fury.io/js/fairydm) 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`fairydm` provides a familiar, Mongoose-inspired API for defining schemas, creating models, and performing CRUD operations, all while leveraging the power of TypeScript for a better developer experience.

## Core Features

- **Schema Definition**: Structure your data with clear and simple schema definitions.
- **Type-Safe Models**: Full TypeScript support with inferred types from your model interfaces.
- **Mongoose-like API**: A familiar and intuitive API for developers coming from a Mongoose background.
- **Promise-based**: All asynchronous operations return Promises for easy integration with modern async/await syntax.
- **Secure Connection**: Connect to your live Firestore database using service account credentials.

## Installation

```bash
npm install fairydm firebase-admin
```

## Quick Start

Here's a quick guide to get you started with `fairydm`.

### 1. Connect to Firestore

To connect to your Firestore database, you will need a service account key from your Google Cloud/Firebase project.

**Generating a Service Account Key:**

1.  Go to your project settings in the [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to the **Service accounts** tab.
3.  Click on **Generate new private key**. A JSON file containing your service account credentials will be downloaded.
4.  Save this file securely in your project (e.g., in a `config` directory) and **ensure it is added to your `.gitignore`** to prevent it from being committed to version control.

Now, use the service account key to connect `fairydm` to your Firestore instance.

```typescript
import { connect, disconnect } from 'fairydm';
import admin from 'firebase-admin';
import serviceAccount from './config/serviceAccountKey.json'; // Adjust path as needed

async function initialize() {
  await connect({
    credential: serviceAccount,
    projectId: "testing-fairydm"
  });
  console.log('Connected to Firestore!');

  // Your application logic here...

  // Disconnect when done
  await disconnect();
}

initialize();
```

### 2. Define a Schema and Model

Define an interface for your data and then create a `Schema` and a `Model`.

```typescript
import { model, Schema } from 'fairydm';

// Define a TypeScript interface for your document
interface IUser {
  name: string;
  email: string;
  age?: number;
  role: 'admin' | 'user';
}

// Create a schema that corresponds to the interface
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number },
  role: { type: String, default: 'user' },
});

// Create the model
const User = model<IUser>('User', userSchema);
```
The `model<T>()` function is generic, and the type `T` you pass to it will be used to provide type safety and autocompletion for all model methods.

### 3. Create Documents

You can create new documents using the `.create()` static method or by instantiating the model and calling `.save()`.

```typescript
// Using .create()
const user1 = await User.create({
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
});
console.log('Created user:', user1.data);


// Using new and .save()
const user2 = new User({
  name: 'Bob',
  email: 'bob@example.com',
});
await user2.save(); // Bob's role will default to 'user'
console.log('Saved user:', user2.data);
```

### 4. Find Documents

`fairydm` provides `find` and `findOne` methods with type-safe query objects.

```typescript
// Find a single document
const alice = await User.findOne({ email: 'alice@example.com' });
if (alice) {
  console.log('Found Alice:', alice.data.name);
}

// Find multiple documents
const allUsers = await User.find({ role: 'user' });
console.log(`Found ${allUsers.length} users.`);
```

### 5. Update Documents

Update documents using `updateOne` or `updateMany`. You can also update a document instance directly and then call `.save()`.

```typescript
// Update a single document's age
await User.updateOne({ email: 'alice@example.com' }, { $set: { age: 31 } });

// Update an instance and save
if (alice) {
  alice.data.role = 'admin';
  await alice.save();
  console.log('Promoted Alice to admin.');
}
```

### 6. Delete Documents

Delete documents using `deleteMany` or `findByIdAndDelete`.

```typescript
// Delete Bob by his email
await User.deleteMany({ email: 'bob@example.com' });

// Delete Alice by her ID
if (alice && alice.id) {
  await User.findByIdAndDelete(alice.id);
}
```

## Standalone Example Application

This repository includes a standalone example of a social media API located in the `/example` directory. It demonstrates how to structure a more complex application with multiple models, routes, and authentication.

To run the example:
1.  Navigate to the example directory: `cd example`
2.  Create a `serviceAccountKey.json` file inside `example/src/config/`. Follow the instructions in the "Connect to Firestore" section to generate your key.
3.  Install the dependencies: `npm install`
4.  Start the application: `npm start`

## API Reference

### Model Static Methods

- `model<T>(name, schema)`: Creates a new model.
- `connect(options)`: Connects to Firestore.
- `disconnect()`: Disconnects from Firestore.
- `create(data)`: Creates and saves a new document.
- `find(query)`: Finds multiple documents matching the query.
- `findOne(query)`: Finds a single document matching the query.
- `updateOne(filter, update)`: Updates a single document.
- `updateMany(filter, update)`: Updates multiple documents.
- `deleteMany(query)`: Deletes documents matching the query.
- `findByIdAndDelete(id)`: Deletes a single document by its ID.

### Model Instance Methods

- `save()`: Saves or updates the document instance.

## Future Work & Todos

`fairydm` is an evolving project. Here are some of the features and improvements planned for the future:

-   **Migration System**: Integration with a migration tool or a built-in system to manage schema changes over time.
-   **Advanced Query Operators**: Support for more complex Firestore queries, such as `array-contains`, `in`, and `array-contains-any`.
-   **Enhanced Schema Validation**: More built-in validation rules for schema fields.
-   **Transaction Support**: Helpers for running complex operations within a Firestore transaction.

## License

This project is licensed under the MIT License.
