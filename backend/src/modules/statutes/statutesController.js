import * as Statute from "./statutesModel.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeEnum,
} from "#utils/sanitize";
import {
  isValidInteger,
  isValidEnum,
  isNonEmptyString,
  validatePaginationParams,
} from "#utils/validate";
import * as api from "#utils/apiResponse";
import { logAct } from "#utils/logActivity";

// Get Statute by ID
export async function getStatuteById(req, res) {
  try {
    // Sanitize and validate statute ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid statute ID.");
    }

    // Fetch
    const statute = await Statute.getStatuteById(id);
    if (!statute) return api.sendError(res, 404, "Statute not found");
    return api.sendSuccess(res, statute, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "getStatuteById");
  }
}

// Search statutes
export async function searchStatutes(req, res) {
  try {
    // Sanitize
    const filters = {
      code: sanitizeString(req.query.code),
      title: sanitizeString(req.query.title),
      severity: sanitizeEnum(req.query.severity, ["infraction", "misdemeanor", "felony"]),
    };
    const page = sanitizeInteger(req.query.page) || 1;
    const pageSize = sanitizeInteger(req.query.pageSize) || 10;

    // Validate
    const { valid, errors } = validatePaginationParams(page, pageSize);
    if (!valid) {
      return api.sendError(res, 400, "Invalid pagination parameters.", errors);
    }

    if (filters.severity && !isValidEnum(filters.severity, ["infraction", "misdemeanor", "felony"])) {
      return api.sendError(res, 400, "Invalid severity filter.");
    }

    // Search
    const result = await Statute.searchStatutes(filters, page, pageSize);
    return api.sendSuccess(res, result, 200);
  } catch (error) {
    return api.handleDatabaseError(error, res, "searchStatutes");
  }
}

// Create new statute
export async function createStatute(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      code: sanitizeString(body.code),
      title: sanitizeString(body.title),
      description: sanitizeString(body.description),
      severity: sanitizeEnum(body.severity, ["infraction", "misdemeanor", "felony"]),
      fine: sanitizeInteger(body.fine),
    };

    // Validate
    const errors = [];
    if (!isNonEmptyString(sanitizedData.code)) {
      errors.push("Statute code is required.");
    }

    if (!isNonEmptyString(sanitizedData.title)) {
      errors.push("Statute title is required.");
    }

    if (!isNonEmptyString(sanitizedData.description)) {
      errors.push("Statute description is required.");
    }

    if (!isValidEnum(sanitizedData.severity, ["infraction", "misdemeanor", "felony"])) {
      errors.push("Severity must be one of: infraction, misdemeanor, felony.");
    }

    if (sanitizedData.fine !== null && !isValidInteger(sanitizedData.fine)) {
      errors.push("Fine must be a valid integer.");
    }

    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create
    const newStatuteId = await Statute.createStatute(sanitizedData);
    api.sendSuccess(res, await Statute.getStatuteById(newStatuteId), 201);

    // Log
    logAct({
      user_id: false,
      entity_type: "statute",
      action: "create",
      entity_id: newStatuteId,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "createStatute");
  }
}

// Update Statute
export async function updateStatute(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const sanitizedData = {
      code: sanitizeString(body.code),
      title: sanitizeString(body.title),
      description: sanitizeString(body.description),
      severity: sanitizeEnum(body.severity, ["infraction", "misdemeanor", "felony"]),
      fine: sanitizeInteger(body.fine),
    };

    // Validate
    const errors = [];
    if (sanitizedData.code && !isNonEmptyString(sanitizedData.code)) {
      errors.push("Statute code cannot be empty.");
    }

    if (sanitizedData.title && !isNonEmptyString(sanitizedData.title)) {
      errors.push("Statute title cannot be empty.");
    }

    if (sanitizedData.description && !isNonEmptyString(sanitizedData.description)) {
      errors.push("Statute description cannot be empty.");
    }

    if (
      sanitizedData.severity &&
      !isValidEnum(sanitizedData.severity, ["infraction", "misdemeanor", "felony"])
    ) {
      errors.push("Severity must be one of: infraction, misdemeanor, felony.");
    }

    if (sanitizedData.fine !== null && !isValidInteger(sanitizedData.fine)) {
      errors.push("Fine must be a valid integer.");
    }

    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update
    const updated = await Statute.updateStatute(id, sanitizedData);
    if (!updated) {
      return api.sendError(res, 404, "Statute not found.");
    }
    api.sendSuccess(res, await Statute.getStatuteById(id), 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "statute",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateStatute");
  }
}

// Toggle Statute Active Status
export async function toggleStatuteStatus(req, res) {
  try {
    // Sanitize and validate statute ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid statute ID.");
    }

    // Toggle
    const updatedStatute = await Statute.toggleStatuteStatus(id);
    if (!updatedStatute) {
      return api.sendError(res, 404, "Statute not found.");
    }
    api.sendSuccess(res, updatedStatute, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "statute",
      action: "toggle_status",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "toggleStatuteStatus");
  }
}

// Delete Statute
export async function deleteStatute(req, res) {
  try {
    // Sanitize and validate statute ID
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid statute ID.");
    }

    // Delete
    const deleteSuccess = await Statute.deleteStatute(id);
    if (!deleteSuccess) {
      return api.sendError(res, 404, "Statute not found.");
    }
    api.sendSuccess(res, { message: "Statute deleted successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "statute",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deleteStatute");
  }
}