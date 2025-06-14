import { model, Schema } from "fairydm";

// 1. Define the Contact Interface
export interface Contact {
  userId: string; // The owner of the contact list
  contactId: string; // The user who is in the contact list
  isFavorite: boolean;
  createdAt: string;
}

// 2. Define the Contact Schema
export const contactSchema = new Schema<Contact>({
  userId: { type: String, required: true },
  contactId: { type: String, required: true },
  isFavorite: { type: Boolean, default: false },
  createdAt: { type: String, default: new Date().toISOString() },
});

// 3. Create and export the Contact model
export const ContactModel = model<Contact>("Contact", contactSchema);
