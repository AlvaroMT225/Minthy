import React from "react";

interface NextImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function NextImage({
  src,
  alt,
  width,
  height,
  ...props
}: NextImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={props.loading ?? "lazy"}
      style={{
        objectFit: "cover",
        borderRadius: 8,
        display: "block",
        maxWidth: "100%",
        height: "auto",
      }}
      {...props}
    />
  );
}

