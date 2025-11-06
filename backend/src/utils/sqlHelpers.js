export function buildInsertQuery(table, fields, allowedNulls = []) {
  const filteredFields = Object.entries(fields).filter(([key, value]) => {
    // Skip undefined values
    if (value === undefined) return false;
    // Skip null values unless allowed
    // Unallowed null values can be used to set default DB values
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
    // Skip undefined values
    if (value === undefined) return false;
    // Skip null values unless allowed
    // Unallowed null values can be used to ignore updating that field
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
