import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// This will throw an error if the environment variable is not set.
// Make sure to set FIREBASE_SERVICE_ACCOUNT_KEY in your environment.
// It should be the stringified JSON of your service account key.
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore();
