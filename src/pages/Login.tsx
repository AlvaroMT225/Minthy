import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { loginUser, getUserDeviceUID } from "../services/firebase";
import useSession from "../store/useSession";
import { useConnection } from "../store/useConnection";
import "./Login.css";

const Login: React.FC = () => {
  const history = useHistory();
  const { setUser } = useSession();
  const { setUid, setUserId } = useConnection();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // ✅ CRÍTICO: Limpiar deviceUID de localStorage ANTES de cargar el usuario actual
      // Esto evita que use UIDs de otros usuarios
      localStorage.removeItem("deviceUID");
      console.log("🧹 localStorage.deviceUID limpiado al iniciar sesión");

      // ✅ loginUser ahora retorna el UUID del usuario (no el username)
      const userUUID = await loginUser(username, password);
      console.log("✅ Usuario autenticado correctamente:", username, "UUID:", userUUID);

      // ✅ Guardar usuario en sesión con UUID y username
      setUser({
        uid: userUUID,           // UUID único del usuario
        email: null,
        username: username,       // Username ingresado para mostrar en UI
      });

      // ✅ Guardar userUUID en useConnection
      setUserId(userUUID);

      // 🔍 Recuperar UID del dispositivo guardado en Firestore (si existe)
      const savedUID = await getUserDeviceUID(userUUID);
      if (savedUID) {
        console.log(`✅ UID del dispositivo recuperado desde Firestore: ${savedUID}`);
        setUid(savedUID); // Cargar en useConnection + localStorage
      } else {
        console.log("ℹ️ Usuario sin UID guardado - deberá conectar dispositivo BLE primero");
      }

      history.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message || "Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="login-wrapper">
          <div className="login-card">
            {/* Header con gradiente */}
            <div className="login-header">
              <div className="logo-circle">
                <img src="/iconosinF.png" alt="Minthy Logo" />
              </div>
              <h1 className="login-title">Bienvenido</h1>
              <p className="login-subtitle">Ingresa a tu cuenta de Minthy</p>
            </div>

            {/* Formulario */}
            <div className="login-form">
              <div className="input-group">
                <label className="input-label">Usuario</label>
                <IonInput
                  value={username}
                  onIonChange={(e) => setUsername(e.detail.value!)}
                  placeholder="Ingresa tu usuario"
                  className="custom-input"
                  clearInput={true}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Contraseña</label>
                <IonInput
                  type="password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                  placeholder="Ingresa tu contraseña"
                  className="custom-input"
                  clearInput={true}
                />
              </div>

              {error && (
                <div className="error-message">
                  <IonText color="danger">
                    <p>{error}</p>
                  </IonText>
                </div>
              )}

              <IonButton
                expand="block"
                className="login-button"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </IonButton>

              <div className="register-link">
                <p>
                  ¿No tienes cuenta?{" "}
                  <a href="/register">Regístrate aquí</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
