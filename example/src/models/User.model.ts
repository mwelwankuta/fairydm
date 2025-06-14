/*
 * The User model requires the `bcryptjs` library to hash passwords.
 * Please install it and its types:
 * npm install bcryptjs
 * npm install --save-dev @types/bcryptjs
 */
import { model, Schema } from "fairydm";

// 1. Define the User Interface

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: Country;
}

interface Country {
  name: string;
  code: string;
}

export interface User {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password?: string;
  address: Address;
}

// 2. Define the User Schema

const countrySchema = new Schema<Country>({
  name: { type: String, required: true },
  code: { type: String, required: true },
});

const addressSchema = new Schema<Address>({
  country: { type: countrySchema, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
});

export const userSchema = new Schema<User>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true }, // Assuming email should be unique
  password: { type: String, required: true },
  address: { type: addressSchema, required: true },
});

// 3. Create and export the User model
export const UserModel = model<User>("User", userSchema);
