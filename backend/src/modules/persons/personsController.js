import * as Person from "./personsModel.js";
import * as api from "#utils/apiResponse";
import { logAct } from "#utils/logActivity";
import { sanitizeString, sanitizeInteger, sanitizeEnum } from "#utils/sanitize";
import {
  isValidInteger,
  isValidEnum,
  isNonEmptyString,
  validatePaginationParams,
  validatePerson,
} from "#utils/validate";

// Get Person by id
export async function getPersonById(req, res) {
  try {
    // Sanitize and validate person ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid person ID.");
    }

    // Fetch
    const person = await Person.getPersonById(id);
    if (!person) return api.sendError(res, 404, "Person not found");
    return api.sendSuccess(res, person, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getPersonById");
  }
}

// Search Persons
export async function searchPersons(req, res) {
  try {
    // Sanitize
    const params = req.query;
    const filters = {
      firstName: sanitizeString(params.firstName),
      middleName: sanitizeString(params.middleName),
      lastName: sanitizeString(params.lastName),
      dob: sanitizeString(params.dob),
      sex: sanitizeEnum(params.sex, ["M", "F", "X"]),
      licenseNum: sanitizeString(params.licenseNum),
      licenseState: sanitizeString(params.licenseState),
      address: sanitizeString(params.address),
      city: sanitizeString(params.city),
      state: sanitizeString(params.state),
      zipCode: sanitizeString(params.zipCode),
    };
    const page = sanitizeInteger(params.page) || 1;
    const pageSize = sanitizeInteger(params.pageSize) || 10;

    // Validate
    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Search
    const result = await Person.searchPersons(filters, page, pageSize);
    return api.sendSuccess(res, result, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "searchPersons");
  }
}

// Create new Person
export async function createPerson(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const personData = {
      first_name: sanitizeString(body.first_name),
      middle_name: sanitizeString(body.middle_name),
      last_name: sanitizeString(body.last_name),
      dob: sanitizeString(body.dob),
      sex: sanitizeEnum(body.sex, ["M", "F", "X"]),
      height_in: sanitizeInteger(body.height_in),
      weight_lbs: sanitizeInteger(body.weight_lbs),
      eye_color: sanitizeString(body.eye_color),
      hair_color: sanitizeString(body.hair_color),
      address: sanitizeString(body.address),
      city: sanitizeString(body.city),
      state: sanitizeString(body.state),
      zip_code: sanitizeString(body.zip_code),
      phone_number: sanitizeString(body.phone_number),
      license_number: sanitizeString(body.license_number),
      license_state: sanitizeString(body.license_state),
      notes: sanitizeString(body.notes),
      photo_url: sanitizeString(body.photo_url),
    };

    // Validate
    const { valid, errors } = validatePerson(personData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create
    const newPerson = await Person.createPerson(personData);
    if (!newPerson)
      return api.sendError(res, 500, "Failed to create person record.");
    api.sendSuccess(res, newPerson, 201);

    // Log
    logAct({
      user_id: false,
      entity_type: "person",
      action: "create",
      entity_id: newPerson.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "createPerson");
  }
}

// Update Person
export async function updatePerson(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const personData = {
      first_name: sanitizeString(body.first_name),
      middle_name: sanitizeString(body.middle_name),
      last_name: sanitizeString(body.last_name),
      dob: sanitizeString(body.dob),
      sex: sanitizeEnum(body.sex, ["M", "F", "X"]),
      height_in: sanitizeInteger(body.height_in),
      weight_lbs: sanitizeInteger(body.weight_lbs),
      eye_color: sanitizeString(body.eye_color),
      hair_color: sanitizeString(body.hair_color),
      address: sanitizeString(body.address),
      city: sanitizeString(body.city),
      state: sanitizeString(body.state),
      zip_code: sanitizeString(body.zip_code),
      phone_number: sanitizeString(body.phone_number),
      license_number: sanitizeString(body.license_number),
      license_state: sanitizeString(body.license_state),
      notes: sanitizeString(body.notes),
      photo_url: sanitizeString(body.photo_url),
    };

    // Validate
    const { valid, errors } = validatePerson(personData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update
    const updateSuccess = await Person.updatePerson(id, personData);
    if (!updateSuccess) {
      return api.sendError(res, 404, "Person not found or no changes made.");
    }
    api.sendSuccess(res, { message: "Person updated successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "person",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updatePerson");
  }
}

// Delete Person
export async function deletePerson(req, res) {
  try {
    // Sanitize and validate person ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid person ID.");
    }

    // Delete
    const deleteSuccess = await Person.deletePerson(id);
    if (!deleteSuccess) {
      return api.sendError(res, 404, "Person not found.");
    }
    api.sendSuccess(res, { message: "Person deleted successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "person",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deletePerson");
  }
}

/// Charges ///

// Get Charges for Person with pagination
export async function getChargesByPersonId(req, res) {
  try {
    // Sanitize
    const personId = sanitizeInteger(req.params.personId);
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.pageSize) || 10;

    // Validate
    if (!isValidInteger(personId)) {
      return api.sendError(res, 400, "Invalid person ID.");
    }

    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Invalid pagination parameters.", errors);
    }

    // Fetch
    const charges = await Person.getChargesByPersonId(personId, page, pageSize);
    return api.sendSuccess(res, charges, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getChargesByPersonId");
  }
}

// Get charge by id
export async function getChargeById(req, res) {
  try {
    // Sanitize and validate charge ID
    const id = sanitizeInteger(req.params.chargeId);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid charge ID.");
    }

    // Fetch
    const charge = await Person.getChargeById(id);
    if (!charge) return api.sendError(res, 404, "Charge not found");
    return api.sendSuccess(res, charge, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getChargeById");
  }
}

/// Fines ///

// Get Fines for Person with pagination
export async function getFinesByPersonId(req, res) {
  try {
    // Sanitize
    const personId = sanitizeInteger(req.params.personId);
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.pageSize) || 10;

    // Validate
    if (!isValidInteger(personId)) {
      return api.sendError(res, 400, "Invalid person ID.");
    }
    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Invalid pagination parameters.", errors);
    }

    // Fetch
    const fines = await Person.getFinesByPersonId(personId, page, pageSize);
    return api.sendSuccess(res, fines, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getFinesByPersonId");
  }
}

// Get fine by id
export async function getFineById(req, res) {
  try {
    // Sanitize and validate fine ID
    const id = sanitizeInteger(req.params.fineId);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid fine ID.");
    }

    // Fetch
    const fine = await Person.getFineById(id);
    if (!fine) return api.sendError(res, 404, "Fine not found");
    return api.sendSuccess(res, fine, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getFineById");
  }
}
