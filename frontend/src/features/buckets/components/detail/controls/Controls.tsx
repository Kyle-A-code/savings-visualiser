import { ArrowLeftIcon, ArrowRightIcon } from "../../../../../components/icons";
import "./controls.css";

interface ControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  currentPage: number;
  totalPages: number;
}

const Controls = ({ onPrevious, onNext, currentPage, totalPages }: ControlsProps) => {
  return (
    <div className="bucket-detail-controls">
      <button aria-label="Previous page" className="bucket-detail-controls-button" onClick={onPrevious} disabled={currentPage === 1}>
        <ArrowLeftIcon />
      </button>
      <span className="bucket-detail-controls-page">{currentPage} / {totalPages}</span>
      <button aria-label="Next page" className="bucket-detail-controls-button" onClick={onNext} disabled={currentPage === totalPages}>
        <ArrowRightIcon />
      </button>
    </div>
  );
};

export default Controls;