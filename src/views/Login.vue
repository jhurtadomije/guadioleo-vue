<template>
  <div id="login-screen" class="login">
    <img src="/imagenes/Guadioleo.png" alt="Logo" class="logo-login" />
    <h2>Inicia sesión</h2>

    <div class="form-group">
      <label for="usuario">Correo electrónico</label>
      <input type="email" id="usuario" v-model="usuario" autocomplete="username" />
    </div>

    <div class="form-group">
      <label for="clave">Contraseña</label>
      <input type="password" id="clave" v-model="clave" autocomplete="current-password" />
    </div>

    <button class="boton primario" @click="login">Entrar</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'

const router = useRouter()

const usuario = ref('')
const clave = ref('')
const error = ref('')

const login = async () => {
  error.value = ''
  try {
    const cred = await signInWithEmailAndPassword(auth, usuario.value, clave.value)
    console.log("Usuario logueado:", cred.user.uid)

    // 🔹 Buscar en Firestore el documento del usuario
    const userDoc = await getDoc(doc(db, "usuarios", cred.user.uid))
    if (!userDoc.exists()) {
      error.value = "No tienes permisos para acceder"
      return
    }

    const userData = userDoc.data()
    console.log("Datos usuario:", userData)

    // ✅ Guardamos el rol en localStorage (para usarlo en Home)
    localStorage.setItem("rol", userData.rol)
    localStorage.setItem("uid", cred.user.uid)
    localStorage.setItem("email", cred.user.email)

    // ✅ Redirigir al Home
    router.push("/home")

  } catch (e) {
  console.error("Error en login:", e.message)
  if (e.code === 'auth/user-not-found') {
    error.value = "El usuario no existe"
  } else if (e.code === 'auth/wrong-password') {
    error.value = "Contraseña incorrecta"
  } else {
    error.value = "Error al iniciar sesión"
  }
}
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: clamp(1rem, 4vw, 2rem);
  background: var(--color-bg, #f9f9f9);
}

.logo-login {
  width: clamp(8rem, 40vw, 12rem); /* escala de móvil a desktop */
  height: auto;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: clamp(1.4rem, 4vw, 2rem);
  margin-bottom: 1.5rem;
  color: var(--color-olive-dark);
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
  width: 100%;
  max-width: 22rem; /* límite para que no se estire demasiado */
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

input {
  width: 100%;
  padding: clamp(0.5rem, 2.5vw, 0.7rem);
  border: 0.1rem solid #ccc;
  border-radius: 0.5rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-family: var(--fuente, sans-serif);
  transition: border 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: var(--color-olive-dark);
  outline: none;
  box-shadow: 0 0 0 2px rgba(85,107,47,0.2); /* highlight accesible */
}

.error {
  color: #dc2626;
  margin-top: 1rem;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  text-align: center;
  font-weight: 500;
}

/* 📱 Ajustes extra para pantallas muy pequeñas */
@media (max-width: 400px) {
  .form-group {
    max-width: 100%;
  }

  .logo-login {
    width: 60vw;
  }
}

</style>