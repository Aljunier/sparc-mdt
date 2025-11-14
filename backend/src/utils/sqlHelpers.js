// allowedNulls is an array of field names that are allowed to be null
// when building the query. If a field is null and not in this array, it will
// be excluded from the query, meaning it won't be updated or inserted.

export function buildInsertQuery(table, fields, allowedNulls = []) {
  const filteredFields = Object.entries(fields).filter(([key, value]) => {
    // Do not include undefined values
    if (value === undefined) return false;
    // Do not include null values unless allowed
    if (value === null && !allowedNulls.includes(key)) return false;
    return true;
  });

  const columns = filteredFields.map(([key]) => key);
  const values = filteredFields.map(([_, value]) => value);

  const placeholders = columns.map(() => "?").join(", ");
  const query = `INSERT INTO ${table} (${columns.join(
    ", "
  )}) VALUES (${placeholders})`;

  return { query, values };
}

export function buildUpdateQuery(
  table,
  fields,
  allowedNulls = [],
  idField = "id"
) {
  const filteredFields = Object.entries(fields).filter(([key, value]) => {
    // Do not include undefined values
    if (value === undefined) return false;
    // Do not include null values unless allowed
    if (value === null && !allowedNulls.includes(key)) return false;
    return true;
  });

  const setClauses = filteredFields.map(([key]) => `${key} = ?`);
  const values = filteredFields.map(([_, value]) => value);

  const query = `UPDATE ${table} SET ${setClauses.join(
    ", "
  )} WHERE ${idField} = ?`;
  return { query, values };
}

// Check if a record exists in a table by a specific field and value
export async function recordExists(db, table, field, value) {
  const [results] = await db.execute(
    `SELECT COUNT(*) AS count FROM ${table} WHERE ${field} = ?`,
    [value]
  );
  return results[0].count > 0;
}
