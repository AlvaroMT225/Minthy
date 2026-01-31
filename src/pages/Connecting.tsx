import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  useIonRouter,
} from "@ionic/react";
import { searchOutline, bluetoothOutline } from "ionicons/icons";
import { connectBLEDevice, disconnectBLEDevice } from "../services/bluetooth";
import { useConnection } from "../store/useConnection";

const Connecting: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState("Esperando conexión BLE...");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // ✅ Hook del router de Ionic
  const router = useIonRouter();

  // ✅ Funciones correctas desde useConnection.ts
  const { setUid, setStatus, clearConnection } = useConnection();

  const handleSearchDevice = async () => {
    setErrorMessage("");
    setStatusMessage("🔍 Buscando dispositivo BLE...");
    setIsConnecting(true);

    try {
      const uid = await connectBLEDevice();

      if (!uid) {
        setErrorMessage("No se detectó ningún dispositivo BLE.");
        setIsConnecting(false);
        return;
      }

      // ✅ Actualizamos el estado BLE
      setUid(uid);
      setStatus("connected");
      setStatusMessage(`✅ Dispositivo conectado: ${uid}`);

      // 🚀 Navegamos automáticamente al dashboard
      setTimeout(() => {
        console.log("🧭 Navegando al dashboard...");
        router.push("/dashboard", "forward");
      }, 1000);
    } catch (error: any) {
      console.error("❌ Error al conectar BLE:", error);
      setErrorMessage("No se pudo conectar al dispositivo BLE.");
      setStatus("disconnected");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBLEDevice();
      await clearConnection();
      setStatus("disconnected");
      setStatusMessage("Esperando conexión BLE...");
      setErrorMessage("");
    } catch (error) {
      console.error("❌ Error al desconectar BLE:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Conexión Bluetooth</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding ion-text-center">
        <IonText color="medium">
          <p>
            <IonIcon icon={bluetoothOutline} /> {statusMessage}
          </p>
        </IonText>

        <IonButton
          expand="block"
          color="primary"
          onClick={handleSearchDevice}
          disabled={isConnecting}
        >
          <IonIcon icon={searchOutline} slot="start" />
          BUSCAR DISPOSITIVO
        </IonButton>

        {errorMessage && (
          <IonText color="danger">
            <p style={{ marginTop: "1rem" }}>{errorMessage}</p>
          </IonText>
        )}

        <IonButton
          expand="block"
          color="danger"
          onClick={handleDisconnect}
          style={{ marginTop: "1rem" }}
        >
          <IonIcon icon={bluetoothOutline} slot="start" />
          DESCONECTAR
        </IonButton>

        {isConnecting && (
          <div style={{ marginTop: "2rem" }}>
            <IonSpinner name="dots" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Connecting;
