import * as Vehicle from "./vehiclesModel.js";
import * as api from "#utils/apiResponse";
import { logAct } from "#utils/logActivity";
import { sanitizeString, sanitizeInteger, sanitizeEnum } from "#utils/sanitize";
import {
  isValidInteger,
  isValidEnum,
  isNonEmptyString,
  validatePaginationParams,
} from "#utils/validate";

// Get Vehicle by ID
export async function getVehicleById(req, res) {
  try {
    // Sanitize and validate vehicle ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid vehicle ID.");
    }

    // Fetch
    const vehicle = await Vehicle.getVehicleById(id);
    if (!vehicle) return api.sendError(res, 404, "Vehicle not found");
    return api.sendSuccess(res, vehicle, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getVehicleById");
  }
}

// Search vehicles
export async function searchVehicles(req, res) {
  try {
    // Sanitize
    const filters = {
      plateNum: sanitizeString(req.query.plateNum),
      plateState: sanitizeString(req.query.plateState),
      vin: sanitizeString(req.query.vin),
      make: sanitizeString(req.query.make),
      model: sanitizeString(req.query.model),
      year: sanitizeInteger(req.query.year),
      color: sanitizeString(req.query.color),
      type: sanitizeEnum(req.query.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ]),
    };
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.pageSize) || 10;

    // Validate
    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    if (filters.plateState && !isNonEmptyString(filters.plateState, 2, 2)) {
      return api.sendError(res, 400, "Plate state must be 2 characters.");
    }

    if (filters.vin && !isNonEmptyString(filters.vin, 17)) {
      return api.sendError(res, 400, "VIN must be 17 characters maximum.");
    }

    if (filters.year && !isValidInteger(filters.year, false)) {
      return api.sendError(res, 400, "Year must be a valid integer.");
    }

    if (
      filters.type &&
      !isValidEnum(filters.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ])
    ) {
      return api.sendError(
        res,
        400,
        "Type must be one of: sedan, suv, truck, motorcycle, trailer, boat, other."
      );
    }

    // Search
    const result = await Vehicle.searchVehicles(filters, page, pageSize);
    return api.sendSuccess(res, result, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "searchVehicles");
  }
}

// Create Vehicle
export async function createVehicle(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      plate_number: sanitizeString(body.plate_number),
      plate_state: sanitizeString(body.plate_state),
      vin: sanitizeString(body.vin),
      make: sanitizeString(body.make),
      model: sanitizeString(body.model),
      year: sanitizeInteger(body.year),
      color: sanitizeString(body.color),
      type: sanitizeEnum(body.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ]),
      registered_to: sanitizeInteger(body.registered_to),
    };

    // Validate
    const errors = [];
    if (
      sanitizedData.plate_state &&
      !isNonEmptyString(sanitizedData.plate_state, 2, 2)
    ) {
      errors.push("Plate state is required and must be 2 characters.");
    }

    if (sanitizedData.vin && !isNonEmptyString(sanitizedData.vin, 17)) {
      errors.push("VIN must be 17 characters maximum.");
    }

    if (sanitizedData.year && !isValidInteger(sanitizedData.year, false)) {
      errors.push("Year must be a valid integer.");
    }

    if (
      sanitizedData.type &&
      !isValidEnum(sanitizedData.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ])
    ) {
      errors.push(
        "Type must be one of: sedan, suv, truck, motorcycle, trailer, boat, other."
      );
    }

    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create
    const newVehicle = await Vehicle.createVehicle(sanitizedData);
    api.sendSuccess(res, newVehicle, 201);

    // Log
    logAct({
      user_id: false,
      entity_type: "vehicle",
      action: "create",
      entity_id: newVehicle.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "createVehicle");
  }
}

// Update Vehicle
export async function updateVehicle(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const sanitizedData = {
      plate_number: sanitizeString(body.plate_number),
      plate_state: sanitizeString(body.plate_state),
      vin: sanitizeString(body.vin),
      make: sanitizeString(body.make),
      model: sanitizeString(body.model),
      year: sanitizeInteger(body.year),
      color: sanitizeString(body.color),
      type: sanitizeEnum(body.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ]),
      registered_to: sanitizeInteger(body.registered_to),
    };

    // Validate
    const errors = [];
    if (
      sanitizedData.plate_state &&
      !isNonEmptyString(sanitizedData.plate_state, 2, 2)
    ) {
      errors.push("Plate state is required and must be 2 characters.");
    }

    if (sanitizedData.vin && !isNonEmptyString(sanitizedData.vin, 17)) {
      errors.push("VIN must be 17 characters maximum.");
    }

    if (sanitizedData.year && !isValidInteger(sanitizedData.year, false)) {
      errors.push("Year must be a valid integer.");
    }

    if (
      sanitizedData.type &&
      !isValidEnum(sanitizedData.type, [
        "sedan",
        "suv",
        "truck",
        "motorcycle",
        "trailer",
        "boat",
        "other",
      ])
    ) {
      errors.push(
        "Type must be one of: sedan, suv, truck, motorcycle, trailer, boat, other."
      );
    }

    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update
    const updateSuccess = await Vehicle.updateVehicle(id, sanitizedData);
    if (!updateSuccess) {
      return api.sendError(res, 404, "Vehicle not found.");
    }
    api.sendSuccess(res, await Vehicle.getVehicleById(id), 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "vehicle",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateVehicle");
  }
}

// Delete Vehicle
export async function deleteVehicle(req, res) {
  try {
    // Sanitize and validate vehicle ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid vehicle ID.");
    }

    // Delete
    const deleteSuccess = await Vehicle.deleteVehicle(id);
    if (!deleteSuccess) return api.sendError(res, 404, "Vehicle not found.");
    api.sendSuccess(res, { message: "Vehicle deleted successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "vehicle",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deleteVehicle");
  }
}
