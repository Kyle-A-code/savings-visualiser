import type { ReactNode } from "react";
import "./card.css";

interface CardPrimitiveProps {
  children: ReactNode;
  className?: string;
}

const CardPrimitive = ({ children, className }: CardPrimitiveProps) => {
  const cardClassName = className
    ? `card-primitive ${className}`
    : "card-primitive";

  return <article className={cardClassName}>{children}</article>;
};

export default CardPrimitive;
