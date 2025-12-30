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

// Build a WHERE clause from filters object
export function buildWhereClause(filters) {
  const conditions = [];
  const values = [];

  for (const [field, config] of Object.entries(filters)) {
    if (
      config.value === undefined ||
      config.value === null ||
      config.value === ""
    ) {
      continue; // Skip empty/null values
    }

    const operator = config.operator || "=";
    const column = config.column || field;

    switch (operator) {
      case "LIKE":
        conditions.push(`${column} LIKE ?`);
        values.push(`%${config.value}%`);
        break;

      case "=":
      case ">":
      case "<":
      case ">=":
      case "<=":
      case "!=":
        conditions.push(`${column} ${operator} ?`);
        values.push(config.value);
        break;

      case "IN":
        if (Array.isArray(config.value) && config.value.length > 0) {
          const placeholders = config.value.map(() => "?").join(", ");
          conditions.push(`${column} IN (${placeholders})`);
          values.push(...config.value);
        }
        break;

      case "BETWEEN":
        if (config.value.min !== undefined && config.value.max !== undefined) {
          conditions.push(`${column} BETWEEN ? AND ?`);
          values.push(config.value.min, config.value.max);
        }
        break;

      case "IS NULL":
        conditions.push(`${column} IS NULL`);
        break;

      case "IS NOT NULL":
        conditions.push(`${column} IS NOT NULL`);
        break;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, values };
}

// Generalized select query function with filters and ordering
export async function selectWithFilters({
  table,
  select = "*",
  filters = {},
  orderBy = "created_at DESC",
  joins = "",
}) {
  const { whereClause, values } = buildWhereClause(filters);

  const query = `
    SELECT ${select}
    FROM ${table}
    ${joins}
    ${whereClause}
    ORDER BY ${orderBy}
  `;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${table}
    ${joins}
    ${whereClause}
  `;

  return { query, values, countQuery };
}

// Check if a record exists in a table by a specific field and value
export async function recordExists(db, table, field, value) {
  const [results] = await db.execute(
    `SELECT COUNT(*) AS count FROM ${table} WHERE ${field} = ?`,
    [value]
  );
  return results[0].count > 0;
}
