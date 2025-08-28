// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBbQGoOj5UeH_3gpeRT972k_p-Yc4EBSw",
  authDomain: "guadioleo.firebaseapp.com",
  projectId: "guadioleo",
  storageBucket: "guadioleo.firebasestorage.app",
  messagingSenderId: "571207706748",
  appId: "1:571207706748:web:6709ff620b5a1e316fc1f9"
};

// Inicializar la app
const app = initializeApp(firebaseConfig);

// Servicios que exportamos para usar en toda la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
