import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import { logOutOutline, refreshOutline } from "ionicons/icons";

import DashboardApp from "../features/medical-dashboard/DashboardApp";
import { useConnection } from "../store/useConnection";
import useSession from "../store/useSession";
import "./DashboardHost.css";

const DashboardHost: React.FC = () => {
  const router = useIonRouter();
  const session = useSession() as any;
  const connection = useConnection() as any;

  const username: string | null =
    session?.username ||
    session?.user?.username ||
    localStorage.getItem("username") ||
    null;

  const uid: string | null =
    connection?.uid || localStorage.getItem("deviceUID") || null;

  const handleLogout = async () => {
    try {
      // ❌ NO llamar clearConnection() - queremos mantener el UID
      // Solo cambiar el estado a disconnected
      if (connection?.setStatus) {
        connection.setStatus("disconnected");
      }

      // 🚫 Limpiar bandera de desconexión manual
      localStorage.removeItem("userDisconnected");

      // 🔴 Cerrar sesión en Firebase (ahora NO elimina deviceUID)
      if (session?.logout) {
        await session.logout();
      }

      // 🔄 Navegar al login
      router.push("/login", "root");

      console.log("✅ Sesión cerrada correctamente");
      console.log("ℹ️ El UID y contador de días se mantienen para la próxima sesión");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      // Intentar navegar al login de todas formas
      router.push("/login", "root");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{
          backgroundColor: '#FAF9F6',
          '--background': '#FAF9F6',
          padding: '8px 0',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <IonTitle>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'flex-start'
            }}>
              <img
                src="/iconosinF.png"
                alt="Minthy Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
              <span style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#003B73',
                letterSpacing: '-0.5px'
              }}>
                Minthy
              </span>
            </div>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleRefresh}>
              <IonIcon icon={refreshOutline} style={{ color: '#64748B' }} />
            </IonButton>
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} style={{ color: '#64748B' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content ion-padding">
        {/* Dashboard visual (CODE4 adaptado) */}
        <DashboardApp username={username} uid={uid} onLogout={handleLogout} />
      </IonContent>
    </IonPage>
  );
};

export default DashboardHost;
