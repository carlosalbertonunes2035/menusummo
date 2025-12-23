
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnose(email) {
    console.log(`Diagnosing user: ${email}`);

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("No user document found in 'users' collection for this email.");
    } else {
        snapshot.forEach(doc => {
            console.log("User Document found:");
            console.log(JSON.stringify(doc.data(), null, 2));
        });
    }

    const systemUsersRef = collection(db, "system_users");
    const q2 = query(systemUsersRef, where("email", "==", email));
    const snapshot2 = await getDocs(q2);

    if (snapshot2.empty) {
        console.log("No user found in 'system_users' collection.");
    } else {
        snapshot2.forEach(doc => {
            console.log("System User found:");
            console.log(JSON.stringify(doc.data(), null, 2));
        });
    }
}

diagnose("carlosalbertonunes2035@gmail.com").then(() => process.exit(0));
