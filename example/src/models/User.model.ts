/*
 * The User model requires the `bcryptjs` library to hash passwords.
 * Please install it and its types:
 * npm install bcryptjs
 * npm install --save-dev @types/bcryptjs
 */
import { model, Schema } from 'fairydm';

// 1. Define the User Interface
export interface User {
  name: string;
  email: string;
  password?: string; // Password is not always present, e.g., when sending user data to client
}

// 2. Define the User Schema
const userSchemaDefinition = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Assuming email should be unique
  password: { type: String, required: true },
};

export const userSchema = new Schema(userSchemaDefinition);

// 3. Create and export the User model
export const UserModel = model<User>('User', userSchema); 