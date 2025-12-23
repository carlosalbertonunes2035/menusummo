
import { initializeApp } from "@firebase/app";
import { getFirestore, collection, query, where, getDocs } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAZEkU_k2JDApCniO5MG7JsIeEwSBSnzAY",
    authDomain: "menu-summo.firebaseapp.com",
    projectId: "menu-summo",
    storageBucket: "menu-summo.firebasestorage.app",
    messagingSenderId: "567736207064",
    appId: "1:567736207064:web:1f0c16a1be299bbb87f9ad"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnose(email: string) {
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
