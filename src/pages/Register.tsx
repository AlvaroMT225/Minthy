import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { registerUser } from "../services/firebase";
import "./Register.css";

const Register: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      // ✅ registerUser ahora retorna el UUID del usuario creado
      const userUUID = await registerUser(username, password);
      console.log("✅ Usuario registrado correctamente:", username, "UUID:", userUUID);
      history.push("/login");
    } catch (err: any) {
      console.error("❌ Error al registrar usuario:", err);
      setError(err.message || "Error al crear el usuario. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="register-content">
        <div className="register-wrapper">
          <div className="register-card">
            {/* Header */}
            <div className="register-header">
              <div className="register-logo-circle">
                <img src="/iconosinF.png" alt="Minthy Logo" />
              </div>
              <h1 className="register-title">Crear Cuenta</h1>
              <p className="register-subtitle">Regístrate en Minthy</p>
            </div>

            {/* Formulario */}
            <div className="register-form">
              <div className="register-input-group">
                <label className="register-input-label">Usuario</label>
                <IonInput
                  value={username}
                  onIonChange={(e) => setUsername(e.detail.value!)}
                  placeholder="Ingresa tu usuario"
                  className="register-custom-input"
                  clearInput={true}
                />
              </div>

              <div className="register-input-group">
                <label className="register-input-label">Contraseña</label>
                <IonInput
                  type="password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                  placeholder="Ingresa tu contraseña"
                  className="register-custom-input"
                  clearInput={true}
                />
              </div>

              {error && (
                <div className="register-error-message">
                  <IonText color="danger">
                    <p>{error}</p>
                  </IonText>
                </div>
              )}

              <IonButton
                expand="block"
                className="register-button"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </IonButton>

              <div className="register-login-link">
                <p>
                  ¿Ya tienes cuenta?{" "}
                  <a href="/login">Inicia sesión aquí</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
