import { useState } from "react";
import "./filters.css";
import type { TransactionType } from "../../../../transactions/api/getBucketTransactions";
import type { TransactionOrder } from "../../../../transactions/api/getBucketTransactions";
import { ArrowDownIcon } from "../../../../../components/icons";


interface FiltersProps {
  type?: TransactionType;
  order?: TransactionOrder;
  title: string | undefined;
  onTypeChange: (nextType?: TransactionType) => void;
  onOrderChange: (nextOrder?: TransactionOrder) => void;
  onTitleSearch: (nextTitle: string | undefined) => void;
  onClear: () => void;
}

export const Filters = ({
  type,
  order,
  title,
  onTypeChange,
  onOrderChange,
  onTitleSearch,
  onClear,
}: FiltersProps) => {
  const [titleDraft, setTitleDraft] = useState(title ?? "");

  const submitTitleSearch = () => {
    const nextTitle = titleDraft.trim();
    onTitleSearch(nextTitle === "" ? undefined : nextTitle);
  };

  const clearFilters = () => {
    setTitleDraft("");
    onClear();
  };

  return (
    <div className="bucket-detail-filters">
      <fieldset className="bucket-detail-filter-group">
        <legend className="ui-eyebrow bucket-detail-filter-label">Type</legend>
        <div className="bucket-detail-type-buttons">
          <button
            type="button"
            className="bucket-detail-filter-chip ui-focus-ring"
            data-state={type === undefined ? "active" : "inactive"}
            onClick={() => onTypeChange(undefined)}
          >
            All
          </button>
          <button
            type="button"
            className="bucket-detail-filter-chip ui-focus-ring"
            data-state={type === "credit" ? "active" : "inactive"}
            onClick={() => onTypeChange("credit")}
          >
            Credit
          </button>
          <button
            type="button"
            className="bucket-detail-filter-chip ui-focus-ring"
            data-state={type === "debit" ? "active" : "inactive"}
            onClick={() => onTypeChange("debit")}
          >
            Debit
          </button>
        </div>
      </fieldset>
      <label className="bucket-detail-filter-group">
        <span className="ui-eyebrow bucket-detail-filter-label">Order</span>
        <div className="bucket-detail-filter-select-wrap">
          <select
            className="bucket-detail-filter-select ui-focus-ring"
            value={order ?? "-createdAt"}
            onChange={(event) => onOrderChange(event.target.value as Exclude<TransactionOrder, undefined>)}
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
          </select>
          <ArrowDownIcon
            width={12}
            height={12}
            aria-hidden
          />
        </div>
      </label>
      <label className="bucket-detail-filter-group">
        <span className="ui-eyebrow bucket-detail-filter-label">Search title</span>
        <div className="bucket-detail-title-search">
          <input
            type="text"
            className="bucket-detail-filter-input ui-focus-ring"
            placeholder="Search by title"
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitTitleSearch();
              }
            }}
          />
          <button
            type="button"
            className="ui-btn ui-btn-surface ui-focus-ring"
            onClick={submitTitleSearch}
          >
            Search
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-ghost ui-focus-ring"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </label>
    </div>
  );
};