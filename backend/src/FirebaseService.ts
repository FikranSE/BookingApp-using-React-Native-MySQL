import {initializeApp} from "firebase/app";
import {getDatabase, ref, set, get, child} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCR3z3Tzrqxyar1P9NKdrXqZ5VsTi-j0ck",
    authDomain: "myta-b5338.firebaseapp.com",
    databaseURL: "https://myta-b5338-default-rtdb.firebaseio.com",
    projectId: "myta-b5338",
    storageBucket: "myta-b5338.firebasestorage.app",
    messagingSenderId: "1064995755557",
    appId: "1:1064995755557:web:425c06f2b685f0ce1c51cc"
};

export const _ = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);

export const saveToken = async (userId: string, token: string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
    const payload = { ...values, token };
    set(ref(db, `userTokens/${userId}/`), payload)
};

export const getToken = async (userId: string) => {
    const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
    return values ?? {};
};