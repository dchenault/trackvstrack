import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp(); // ✅ Uses App Hosting's built-in credentials
}

export const adminDb = getFirestore();