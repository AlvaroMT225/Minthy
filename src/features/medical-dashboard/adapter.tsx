import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * Este adaptador permite montar un dashboard externo (React o Next)
 * dentro del contenedor del host Ionic (DashboardHost.tsx).
 *
 * Si tu dashboard exporta un componente principal `DashboardApp`,
 * aquí se renderiza dentro de un div específico.
 */

// Tipado del adaptador
interface MountOptions {
  onReady?: () => void;
}

// Referencia global al root de ReactDOM para desmontar correctamente
let dashboardRoot: ReactDOM.Root | null = null;

export async function mountDashboardInHost(container: HTMLElement, options?: MountOptions): Promise<void> {
  // Simula import dinámico del dashboard real
  try {
    const DashboardModule = await import('./DashboardApp'); // el archivo principal de tu dashboard
    const DashboardApp = DashboardModule.default;

    dashboardRoot = ReactDOM.createRoot(container);
    dashboardRoot.render(<DashboardApp />);

    // Avisamos al host que el dashboard está listo
    options?.onReady?.();
  } catch (err) {
    console.error('Error montando dashboard:', err);
  }
}

export function unmountDashboardFromHost(container: HTMLElement): void {
  if (dashboardRoot) {
    dashboardRoot.unmount();
    dashboardRoot = null;
  }
}
