import { model, Schema } from "fairydm";

// 1. Define the Group Interface
export interface Group {
  name: string;
  description?: string;
  members: string[]; // Array of User IDs
  createdBy: string; // User ID of the creator
  createdAt: string;
}

// 2. Define the Group Schema
export const groupSchema = new Schema<Group>({
  name: { type: String, required: true },
  description: { type: String },
  members: { type: Array, required: true, of: String },
  createdBy: { type: String, required: true },
  createdAt: { type: String, default: new Date().toISOString() },
});

// 3. Create and export the Group model
export const GroupModel = model<Group>("Group", groupSchema);
