"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToken = exports.saveToken = exports._ = void 0;
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
const firebaseConfig = {
    apiKey: "AIzaSyCR3z3Tzrqxyar1P9NKdrXqZ5VsTi-j0ck",
    authDomain: "myta-b5338.firebaseapp.com",
    databaseURL: "https://myta-b5338-default-rtdb.firebaseio.com",
    projectId: "myta-b5338",
    storageBucket: "myta-b5338.firebasestorage.app",
    messagingSenderId: "1064995755557",
    appId: "1:1064995755557:web:425c06f2b685f0ce1c51cc"
};
exports._ = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, database_1.getDatabase)();
const dbRef = (0, database_1.ref)(db);
const saveToken = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const values = (_a = (yield (0, database_1.get)((0, database_1.child)(dbRef, `userTokens/${userId}/`))).val()) !== null && _a !== void 0 ? _a : {};
    const payload = Object.assign(Object.assign({}, values), { token });
    (0, database_1.set)((0, database_1.ref)(db, `userTokens/${userId}/`), payload);
});
exports.saveToken = saveToken;
const getToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const values = (_a = (yield (0, database_1.get)((0, database_1.child)(dbRef, `userTokens/${userId}/`))).val()) !== null && _a !== void 0 ? _a : {};
    return values !== null && values !== void 0 ? values : {};
});
exports.getToken = getToken;
