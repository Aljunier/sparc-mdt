import { dbPool as db } from "../config/database.js";

/* Usage:

import { pageinate } from "../utils/pagination.js";
const { data, pagination } = await paginate(
  "SELECT * FROM roles WHERE is_active = ?",
  2, // page number
  10, // page size
  [1], // query parameters
  "SELECT COUNT(*) as total FROM roles WHERE is_active = ?" // OPTIONAL: count query
);

*/
export async function paginate(
  query,
  page = 1,
  pageSize = 10,
  params = [],
  countQuery = null
) {
  const offset = (page - 1) * pageSize;
  const paginatedQuery = `${query} LIMIT ${pageSize} OFFSET ${offset}`;

  const [data] = await db.execute(paginatedQuery, params);

  // Get total count
  let total = 0;
  if (countQuery) {
    const [countResult] = await db.execute(countQuery, params);
    total = countResult[0]?.total || 0;
  } else {
    // Automatic count if no countQuery provided
    const countSql = `SELECT COUNT(*) as total FROM (${query}) AS temp`;
    const [countResult] = await db.execute(countSql, params);
    total = countResult[0]?.total || 0;
  }

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
