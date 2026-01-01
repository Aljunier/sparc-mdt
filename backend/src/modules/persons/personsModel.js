import { dbPool as db } from "#config/database";
import { paginate } from "#utils/pagination";
import {
  buildInsertQuery,
  buildUpdateQuery,
  selectWithFilters,
} from "#utils/sqlHelpers";

// Get person by id
export async function getPersonById(id) {
  const [results] = await db.execute(
    `SELECT *
     FROM persons WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Person search with pagination
export async function searchPersons(
  {
    firstName,
    middleName,
    lastName,
    dob,
    sex,
    licenseNum,
    licenseState,
    address,
    city,
    state,
    zipCode,
  },
  page = 1,
  pageSize = 10
) {
  const filters = {
    first_name: { value: firstName, operator: "LIKE" },
    middle_name: { value: middleName, operator: "LIKE" },
    last_name: { value: lastName, operator: "LIKE" },
    dob: { value: dob, operator: "=" },
    sex: { value: sex, operator: "=" },
    license_number: { value: licenseNum, operator: "LIKE" },
    license_state: { value: licenseState, operator: "=" },
    address: { value: address, operator: "LIKE" },
    city: { value: city, operator: "LIKE" },
    state: { value: state, operator: "=" },
    zip_code: { value: zipCode, operator: "LIKE" },
  };

  const { query, values, countQuery } = await selectWithFilters({
    table: "persons",
    filters,
    orderBy: "id DESC",
  });

  return paginate(query, page, pageSize, values, countQuery);
}

// Create new person record
// Expected fields: { first_name, middle_name, last_name, dob, sex, height_in, weight_lbs, eye_color, hair_color, address, city, state, zip_code, phone_number, license_number, license_state, notes, photo_url }
export async function createPerson(fields) {
  const { query, values } = buildInsertQuery("persons", fields);
  const [result] = await db.execute(query, values);
  return getPersonById(result.insertId);
}

// Update existing person record
// Expected fields: { first_name, middle_name, last_name, dob, sex, height_in, weight_lbs, eye_color, hair_color, address, city, state, zip_code, phone_number, license_number, license_state, notes, photo_url }
export async function updatePerson(id, fields) {
  const { query, values } = buildUpdateQuery("persons", fields, [], "id");
  const [result] = await db.execute(query, [...values, id]);
  return result.affectedRows > 0;
}

// Delete person record
export async function deletePerson(id) {
  const [result] = await db.execute(`DELETE FROM persons WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

/// Charges ///

// Get charge by ID
export async function getChargeById(id) {
  const [results] = await db.execute(
    `SELECT *
     FROM charges WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Get charges from a person id with pagination
export async function getChargesByPersonId(personId, page = 1, pageSize = 10) {
  return await paginate(
    `SELECT
      id,
      report_id,
      warrant_id,
      issued_by,
      statute_id,
      status,
      conviction_date
    FROM charges WHERE person_id = ? ORDER BY id DESC`,
    page,
    pageSize,
    [personId]
  );
}

/// Fines ///

// Get fine by id
export async function getFineById(id) {
  const [results] = await db.execute(
    `SELECT *
     FROM fines WHERE id = ?`,
    [id]
  );
  return results[0];
}

// Get fines from a person id with pagination
export async function getFinesByPersonId(personId, page = 1, pageSize = 10) {
  return await paginate(
    `SELECT
      issued_by,
      type,
      amount,
      status,
      due_by,
      paid_at
     FROM fines WHERE person_id = ? ORDER BY id DESC`,
    page,
    pageSize,
    [personId]
  );
}
