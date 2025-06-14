import * as admin from "firebase-admin";

let firestore: admin.firestore.Firestore;

export const connect = async (options: {
  credential?: string;
  projectId: string;
}) => {
  if (admin.apps.length > 0) {
    return;
  }

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: options.projectId,
    });
    console.log('Connecting to Firestore emulator...');
  } else {
    if (!options.credential) {
      throw new Error('Credential path must be provided for production connections.');
    }
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
