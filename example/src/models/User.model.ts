/*
 * The User model requires the `bcryptjs` library to hash passwords.
 * Please install it and its types:
 * npm install bcryptjs
 * npm install --save-dev @types/bcryptjs
 */
import { model, Schema } from "fairydm";

// 1. Define the User Interface
export interface User {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

// 2. Define the User Schema

export const userSchema = new Schema<User>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true }, // Assuming email should be unique
  password: { type: String, required: true },
});

// 3. Create and export the User model
export const UserModel = model<User>("User", userSchema);
