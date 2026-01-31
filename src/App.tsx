import React from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";

/* ✅ Importar las páginas principales */
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardHost from "./pages/DashboardHost";

/* ✅ Inicializar Ionic React */
setupIonicReact();

/* ✅ Estilos esenciales de Ionic React */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* ✅ Variables de tema (colores, etc.) */
import "./theme/variables.css";

/* ✅ Estilos globales personalizados */
import "./styles/globals.css";

const App: React.FC = () => {
  console.log("✅ App.tsx cargado correctamente con estilos Ionic");

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" render={() => <Redirect to="/login" />} />
          <Route path="/login" component={Login} exact />
          <Route path="/register" component={Register} exact />
          <Route path="/dashboard" component={DashboardHost} exact />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
