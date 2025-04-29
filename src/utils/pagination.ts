import { PaginationOptions } from "../types/pagination.js";

export function getPagination({ limit, page }: PaginationOptions) {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
}
