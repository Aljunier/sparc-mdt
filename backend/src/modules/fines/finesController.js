import * as Fine from "./finesModel.js";
import * as api from "#utils/apiResponse";
import { logAct } from "#utils/logActivity";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeEnum,
  sanitizeDate,
} from "#utils/sanitize";
import { isValidInteger, isValidEnum, isNonEmptyString } from "#utils/validate";

// Create Fine
export async function createFine(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const fields = {
      person_id: sanitizeInteger(body.person_id),
      issued_by: sanitizeInteger(body.issued_by), // optional
      type: sanitizeEnum(body.type, [
        "traffic",
        "parking",
        "criminal",
        "other",
      ]),
      description: sanitizeString(body.description),
      amount: sanitizeInteger(body.amount),
      status: sanitizeEnum(body.status, ["unpaid", "paid", "voided"]),
      due_by: body.due_by ? sanitizeDate(body.due_by) : null,
    };

    // Validate
    const errors = [];
    if (!isValidInteger(fields.person_id)) {
      errors.push("Invalid person id");
    }
    if (fields.issued_by && !isValidInteger(fields.issued_by)) {
      errors.push("Invalid 'issued by' id");
    }
    if (
      !isValidEnum(fields.type, ["traffic", "parking", "criminal", "other"])
    ) {
      errors.push(
        "Fine type must be one of: traffic, parking, criminal, other"
      );
    }
    if (!isNonEmptyString(fields.description)) {
      errors.push("Description is required");
    }
    if (!isValidInteger(fields.amount) || fields.amount < 0) {
      errors.push("Amount must be a valid non-negative integer");
    }
    if (!isValidEnum(fields.status, ["unpaid", "paid", "voided"])) {
      errors.push("Status must be one of: unpaid, paid, voided");
    }
    if (fields.due_by && isNaN(fields.due_by.getTime())) {
      errors.push("Due by must be a valid date");
    }
    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Create fine
    const newFine = await Fine.createFine(fields);
    api.sendSuccess(res, newFine, 201);

    // Log
    logAct({
      user_id: fields.issued_by || false,
      entity_type: "fine",
      action: "create",
      entity_id: newFine.id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "createFine");
  }
}

// Update Fine
export async function updateFine(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const fields = {
      person_id: sanitizeInteger(body.person_id),
      issued_by: sanitizeInteger(body.issued_by), // optional
      type: sanitizeEnum(body.type, [
        "traffic",
        "parking",
        "criminal",
        "other",
      ]),
      description: sanitizeString(body.description),
      amount: sanitizeInteger(body.amount),
      status: sanitizeEnum(body.status, ["unpaid", "paid", "voided"]),
      due_by: body.due_by ? sanitizeDate(body.due_by) : null,
      paid_at: body.paid_at ? sanitizeDate(body.paid_at) : null, // optional
    };

    // Validate
    const errors = [];
    if (!isValidInteger(id)) {
      errors.push("Invalid fine id");
    }
    if (!isValidInteger(fields.person_id)) {
      errors.push("Invalid person id");
    }
    if (fields.issued_by && !isValidInteger(fields.issued_by)) {
      errors.push("Invalid 'issued by' id");
    }
    if (
      !isValidEnum(fields.type, ["traffic", "parking", "criminal", "other"])
    ) {
      errors.push(
        "Fine type must be one of: traffic, parking, criminal, other"
      );
    }
    if (!isNonEmptyString(fields.description)) {
      errors.push("Description is required");
    }
    if (!isValidInteger(fields.amount) || fields.amount < 0) {
      errors.push("Amount must be a valid non-negative integer");
    }
    if (!isValidEnum(fields.status, ["unpaid", "paid", "voided"])) {
      errors.push("Status must be one of: unpaid, paid, voided");
    }
    if (fields.due_by && isNaN(fields.due_by.getTime())) {
      errors.push("Due by must be a valid date");
    }
    if (fields.paid_at && isNaN(fields.paid_at.getTime())) {
      errors.push("Paid at must be a valid date");
    }
    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update fine
    const success = await Fine.updateFine(id, fields);
    if (!success) return api.sendError(res, 404, "Fine not found");
    api.sendSuccess(res, { message: "Fine updated successfully." }, 200);

    // Log
    logAct({
      user_id: fields.issued_by || false,
      entity_type: "fine",
      action: "update",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateFine");
  }
}

// Update fine status
export async function updateFineStatus(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);
    const body = req.body;
    const fields = {
      status: sanitizeEnum(body.status, ["unpaid", "paid", "voided"]),
      paid_at: sanitizeDate(body.paid_at), // optional
    };

    // Validate
    const errors = [];
    if (!isValidInteger(id)) {
      errors.push("Invalid fine id");
    }
    if (!isValidEnum(fields.status, ["unpaid", "paid", "voided"])) {
      errors.push("Status must be one of: unpaid, paid, voided");
    }
    if (fields.paid_at && isNaN(fields.paid_at.getTime())) {
      errors.push("Paid at must be a valid date");
    }
    if (errors.length > 0) {
      return api.sendError(res, 400, "Validation errors", errors);
    }

    // Update fine status
    const success = await Fine.updateFineStatus(id, fields);
    if (!success) return api.sendError(res, 404, "Fine not found");
    api.sendSuccess(res, { message: "Fine status updated successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "fine",
      action: "update_status",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "updateFineStatus");
  }
}

// Delete Fine
export async function deleteFine(req, res) {
  try {
    // Sanitize and validate fine id
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid fine id");
    }

    // Delete
    const success = await Fine.deleteFine(id);
    if (!success) return api.sendError(res, 404, "Fine not found");
    api.sendSuccess(res, { message: "Fine deleted successfully." }, 200);

    // Log
    logAct({
      user_id: false,
      entity_type: "fine",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    return api.handleDatabaseError(error, res, "deleteFine");
  }
}
