export interface Pagination<T> {
  items: T[];
  totalRecords: number;
  limit: number;
  offset: number;
  currentPage: number;
}