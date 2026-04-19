import "./divider.css";

interface DividerProps {
  className?: string;
}

const Divider = ({ className }: DividerProps) => (
  <hr
    className={className ? `divider ${className}` : "divider"}
    role="separator"
    aria-orientation="horizontal"
  />
);

export default Divider;
