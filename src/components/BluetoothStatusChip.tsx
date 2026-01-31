import React from "react";
import { IonChip, IonLabel, IonIcon } from "@ionic/react";
import { bluetoothOutline, checkmarkCircle, closeCircle } from "ionicons/icons";
import useConnection from "../store/useConnection";

const BluetoothStatusChip: React.FC = () => {
  const { status } = useConnection();

  const renderStatus = () => {
    switch (status) {
      case "connected":
        return (
          <IonChip color="success">
            <IonIcon icon={checkmarkCircle} />
            <IonLabel>Conectado</IonLabel>
          </IonChip>
        );
      case "connecting":
        return (
          <IonChip color="warning">
            <IonIcon icon={bluetoothOutline} />
            <IonLabel>Conectando...</IonLabel>
          </IonChip>
        );
      case "disconnected":
      default:
        return (
          <IonChip color="medium">
            <IonIcon icon={closeCircle} />
            <IonLabel>Desconectado</IonLabel>
          </IonChip>
        );
    }
  };

  return renderStatus();
};

export default BluetoothStatusChip;
