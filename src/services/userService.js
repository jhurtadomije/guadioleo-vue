import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * 🔹 Crear un nuevo usuario en Firebase Auth + Firestore
 * @param {string} email
 * @param {string} password
 * @param {string} rol (ej: "admin", "operario", "invitado")
 */
export async function registerUser(email, password, rol = "operario") {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Guardamos en Firestore datos adicionales
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    rol,
    createdAt: new Date().toISOString()
  });

  return cred.user;
}

/**
 * 🔹 Login de usuario
 */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  // Obtenemos los datos adicionales desde Firestore
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));
  if (userDoc.exists()) {
    return { uid: cred.user.uid, ...userDoc.data() };
  } else {
    throw new Error("Usuario no encontrado en Firestore");
  }
}

/**
 * 🔹 Logout
 */
export function logoutUser() {
  return signOut(auth);
}

/**
 * 🔹 Obtener datos de un usuario concreto
 */
export async function getUserData(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}
