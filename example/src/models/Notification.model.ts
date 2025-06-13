import { model, Schema } from 'fairydm';

// 1. Define the Notification Interface
export interface Notification {
  userId: string; // The user who receives the notification
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string; // Optional link to a relevant page (e.g., a friend request)
}

// 2. Define the Notification Schema
const notificationSchemaDefinition = {
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  link: { type: String },
};

export const notificationSchema = new Schema(notificationSchemaDefinition);

// 3. Create and export the Notification model
export const NotificationModel = model<Notification>('Notification', notificationSchema); 