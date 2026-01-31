import React from "react";
import { Link as RouterLink } from "react-router-dom";

interface NextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Este componente reemplaza el Link de Next.js y usa el Link de react-router-dom.
 * Compatible con Ionic React (usa <IonReactRouter> internamente).
 */
export default function NextLink({ href, children, className, ...props }: NextLinkProps) {
  // Si el href comienza con http, renderizamos un enlace normal externo.
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  // Para rutas internas, usamos react-router Link.
  return (
    <RouterLink to={href} className={className} {...props}>
      {children}
    </RouterLink>
  );
}
