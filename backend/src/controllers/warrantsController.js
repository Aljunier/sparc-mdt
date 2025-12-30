import * as Warrant from "../models/Warrant.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeEnum,
  sanitizeDate,
} from "../utils/sanitize.js";
import {
  validateWarrant,
  isValidInteger,
  isValidEnum,
  validatePaginationParams,
} from "../utils/validate.js";
import * as api from "../utils/apiResponse.js";
import { logAct } from "../utils/logActivity.js";

// Get all uncancelled warrants with limited details
export async function getWarrantSummary(req, res) {
  try {
    // Sanitize
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.limit) || 10;

    // Validate
    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Invalid pagination parameters", errors);
    }

    // Fetch
    const warrants = await Warrant.getWarrantSummary(page, pageSize);
    return api.sendSuccess(res, warrants.data, 200, {
      pagination: warrants.pagination,
    });
  } catch (error) {
    api.handleDatabaseError(error, res, "getWarrantSummary");
  }
}

// Get all details from a specific warrant from its id
export async function getWarrant(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid warrant id");
    }

    // Fetch
    const warrant = await Warrant.getWarrant(id);
    if (!warrant) return api.sendError(res, 404, "Warrant not found");
    api.sendSuccess(res, warrant);
  } catch (error) {
    api.handleDatabaseError(error, res, "getWarrant");
  }
}

// Create new warrant
export async function createWarrant(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      issued_by: sanitizeInteger(body.issued_by),
      person_id: sanitizeInteger(body.person_id),
      report_id: body.report_id ? sanitizeInteger(body.report_id) : null,
      type: sanitizeEnum(body.type, ["arrest", "search", "bench", "other"]),
      description: sanitizeString(body.description),
      status: body.status
        ? sanitizeEnum(body.status, ["active", "served", "revoked", "expired"])
        : null,
      // Current date + 7 days if not provided
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate
    const { valid, errors } = validateWarrant(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors occurred", errors);
    }

    // Create
    const result = await Warrant.createWarrant(sanitizedData);
    api.sendSuccess(res, result, 201);

    // Log
    logAct({
      user_id: sanitizedData.issued_by,
      entity_type: "warrant",
      action: "create",
      entity_id: result.id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "createWarrant");
  }
}

// Update warrant
export async function updateWarrant(req, res) {
  try {
    const body = req.body;

    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid warrant id");
    }

    // Sanitize
    const sanitizedData = {
      issued_by: sanitizeInteger(body.issued_by),
      person_id: sanitizeInteger(body.person_id),
      report_id: body.report_id ? sanitizeInteger(body.report_id) : null,
      type: sanitizeEnum(
        body.type,
        ["arrest", "search", "bench", "other"],
        null
      ),
      description: sanitizeString(body.description),
      status: sanitizeEnum(
        body.status,
        ["active", "served", "revoked", "expired"],
        null
      ),
      // Current date + 7 days if not provided
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate
    const { valid, errors } = validateWarrant(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors occurred", errors);
    }

    // Update
    const updatedWarrant = await Warrant.updateWarrant(id, sanitizedData);
    if (!updatedWarrant) return api.sendError(res, 404, "Warrant not found");
    api.sendSuccess(res, updatedWarrant);

    // Log
    logAct({
      user_id: sanitizedData.issued_by,
      entity_type: "warrant",
      action: "update",
      entity_id: updatedWarrant.id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "updateWarrant");
  }
}

// Delete warrant
export async function deleteWarrant(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid warrant id");
    }

    // Delete
    const deletedWarrant = await Warrant.deleteWarrant(id);
    if (!deletedWarrant) return api.sendError(res, 404, "Warrant not found");
    api.sendSuccess(res, { message: "Warrant deleted successfully" });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "warrant",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "deleteWarrant");
  }
}
