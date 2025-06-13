import * as admin from "firebase-admin";

let firestore: admin.firestore.Firestore;

export const connect = async (options: {
  credential: string;
  projectId: string;
}) => {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(options.credential),
      projectId: options.projectId,
    });
  }
  firestore = admin.firestore();
  console.log("Connected to Firestore.");
};

export const disconnect = async () => {
  await Promise.all(
    admin.apps.map((app: admin.app.App | null) => app?.delete())
  );
  console.log("Disconnected from Firestore.");
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!firestore) {
    throw new Error("Not connected to Firestore. Please call connect() first.");
  }
  return firestore;
};
