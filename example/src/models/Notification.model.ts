import { model, Schema } from 'fairydm';

// 1. Define the Notification Interface
export interface Notification {
  userId: string; // The user who receives the notification
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string; // Optional link to a relevant page (e.g., a friend request)
}

// 2. Define the Notification Schema
export const notificationSchema = new Schema<Notification>({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: String, default: new Date().toISOString() },
  link: { type: String },
});

// 3. Create and export the Notification model
export const NotificationModel = model<Notification>("Notification", notificationSchema);
