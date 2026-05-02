import type { ReactNode } from "react";
import "./card.css";

interface CardPrimitiveProps {
  children: ReactNode;
  className?: string;
}

const CardPrimitive = ({ children, className }: CardPrimitiveProps) => {
  const cardClassName = className
    ? `card-primitive ui-panel ${className}`
    : "card-primitive ui-panel";

  return <article className={cardClassName}>{children}</article>;
};

export default CardPrimitive;
