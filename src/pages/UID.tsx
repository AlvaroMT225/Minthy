// src/pages/UID.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButton,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import useConnection from "../store/useConnection";
import useSession from "../store/useSession";

/**
 * Pantalla UID del tablero electrónico.
 * ✅ Compatible con: React 19 + Ionic 7 + Firebase 10.x + Zustand 5.x
 * Muestra el UID del dispositivo emparejado desde Firestore o store local.
 */

const UID: React.FC = () => {
  const history = useHistory();
  const { uid, setUid } = useConnection();
  const { user } = useSession(); // ✅ Obtener usuario desde el store de sesión
  const [loading, setLoading] = useState(true);
  const [uidValue, setUidValue] = useState<string | null>(null);

  useEffect(() => {
    const fetchUID = async () => {
      try {
        setLoading(true);

        // 1️⃣ Verificar si ya hay UID en el store global (useConnection)
        if (uid) {
          setUidValue(uid);
          setLoading(false);
          return;
        }

        // 2️⃣ Si no hay UID en memoria, intentar leer desde Firestore
        if (!user || !user.uid) {
          console.warn("⚠️ No hay usuario en sesión, redirigiendo al login...");
          history.push("/login");
          return;
        }

        const userRef = doc(db, "usuarios", user.uid); // ✅ Usar UUID del usuario
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          console.warn("⚠️ Usuario no encontrado en Firestore.");
          setUidValue(null);
        } else {
          const data = snap.data();
          const storedUID = data?.tablero?.uid || null;

          if (storedUID) {
            setUid(storedUID); // 🔄 sincronizar con Zustand
            setUidValue(storedUID);
          } else {
            console.log("ℹ️ El usuario aún no tiene UID vinculado.");
            setUidValue(null);
          }
        }
      } catch (error) {
        console.error("❌ Error al obtener UID desde Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUID();
  }, [uid, setUid, user, history]);

  const goToDashboard = () => {
    history.push("/dashboard");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>UID del Tablero</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        {loading ? (
          <div className="ion-margin-top">
            <IonSpinner name="crescent" />
            <IonText color="medium">
              <p>Cargando información del UID...</p>
            </IonText>
          </div>
        ) : uidValue ? (
          <>
            <IonText color="dark">
              <h2 className="ion-margin-top">🔹 Identificador único</h2>
              <h1 style={{ color: "#1a73e8", marginTop: "10px" }}>
                {uidValue}
              </h1>
              <p className="ion-margin-top ion-text-center">
                Este UID identifica tu tablero electrónico.
              </p>
            </IonText>

            <IonButton
              expand="block"
              color="success"
              className="ion-margin-top"
              onClick={goToDashboard}
            >
              IR AL DASHBOARD
            </IonButton>
          </>
        ) : (
          <>
            <IonText color="medium">
              <h2 className="ion-margin-top">No se encontró ningún UID</h2>
              <p>
                Aún no has emparejado un tablero electrónico.
                <br />
                Por favor, conecta un dispositivo para generar tu UID.
              </p>
            </IonText>

            <IonButton
              expand="block"
              color="primary"
              className="ion-margin-top"
              onClick={() => history.push("/connecting")}
            >
              EMPAREJAR DISPOSITIVO
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UID;
