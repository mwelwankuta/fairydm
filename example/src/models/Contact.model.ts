import { model, Schema } from 'fairydm';

// 1. Define the Contact Interface
export interface Contact {
  userId: string; // The owner of the contact list
  contactId: string; // The user who is in the contact list
  isFavorite: boolean;
  createdAt: Date;
}

// 2. Define the Contact Schema
const contactSchemaDefinition = {
  userId: { type: String, required: true },
  contactId: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
};

export const contactSchema = new Schema(contactSchemaDefinition);

// 3. Create and export the Contact model
export const ContactModel = model<Contact>('Contact', contactSchema);
