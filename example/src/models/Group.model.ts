import { model, Schema } from 'fairydm';

// 1. Define the Group Interface
export interface Group {
  name: string;
  description?: string;
  members: string[]; // Array of User IDs
  createdBy: string; // User ID of the creator
  createdAt: Date;
}

// 2. Define the Group Schema
const groupSchemaDefinition = {
  name: { type: String, required: true },
  description: { type: String },
  members: { type: Array, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
};

export const groupSchema = new Schema(groupSchemaDefinition);

// 3. Create and export the Group model
export const GroupModel = model<Group>('Group', groupSchema); 