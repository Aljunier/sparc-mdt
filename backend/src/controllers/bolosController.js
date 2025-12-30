import * as Bolo from "../models/Bolo.js";
import {
  sanitizeString,
  sanitizeInteger,
  sanitizeEnum,
  sanitizeDate,
} from "../utils/sanitize.js";
import {
  validateBolo,
  isValidInteger,
  isValidEnum,
  validatePaginationParams,
} from "../utils/validate.js";
import * as api from "../utils/apiResponse.js";
import { logAct } from "../utils/logActivity.js";

// Get all uncancelled bolos with limited details
export async function getBoloSummary(req, res) {
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
    const bolos = await Bolo.getBoloSummary(page, pageSize);
    return api.sendSuccess(res, bolos.data, 200, {
      pagination: bolos.pagination,
    });
  } catch (error) {
    api.handleDatabaseError(error, res, "getBoloSummary");
  }
}

// Get all details from a specific bolo from its id
export async function getBolo(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    }

    // Fetch
    const bolo = await Bolo.getBolo(id);
    if (!bolo) return api.sendError(res, 404, "Bolo not found");
    api.sendSuccess(res, bolo);
  } catch (error) {
    api.handleDatabaseError(error, res, "getBolo");
  }
}

// Create new bolo
export async function createBolo(req, res) {
  try {
    // Sanitize
    const body = req.body;
    const sanitizedData = {
      issued_by: sanitizeInteger(body.issued_by),
      report_id: body.report_id ? sanitizeInteger(body.report_id) : null,
      type: sanitizeEnum(body.type, ["person", "vehicle", "other"]),
      title: sanitizeString(body.title),
      description: sanitizeString(body.description),
      status: body.status
        ? sanitizeEnum(body.status, [
            "active",
            "resolved",
            "cancelled",
            "expired",
          ])
        : null,
      priority: body.priority
        ? sanitizeEnum(body.priority, ["low", "medium", "high"])
        : null,
      // Current date + 7 days if not provided
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate
    const { valid, errors } = validateBolo(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors occurred", errors);
    }

    // Create
    const result = await Bolo.createBolo(sanitizedData);
    api.sendSuccess(res, result, 201);

    // Log
    logAct({
      user_id: sanitizedData.issued_by,
      entity_type: "bolo",
      action: "create",
      entity_id: result.id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "createBolo");
  }
}

// Update bolo
export async function updateBolo(req, res) {
  try {
    const body = req.body;

    // Sanitize and validate id before proceeding
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    }

    // Sanitize
    const sanitizedData = {
      issued_by: sanitizeInteger(body.issued_by),
      report_id: body.report_id ? sanitizeInteger(body.report_id) : null,
      type: sanitizeEnum(body.type, ["person", "vehicle", "other"], null),
      title: sanitizeString(body.title),
      description: sanitizeString(body.description),
      status: sanitizeEnum(
        body.status,
        ["active", "resolved", "cancelled", "expired"],
        null
      ),
      priority: sanitizeEnum(body.priority, ["low", "medium", "high"], null),
      // Current date + 7 days if not provided
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate
    const { valid, errors } = validateBolo(sanitizedData);
    if (!valid) {
      return api.sendError(res, 400, "Validation errors occurred", errors);
    }

    // Update
    const updatedBolo = await Bolo.updateBolo(id, sanitizedData);
    if (!updatedBolo) return api.sendError(res, 404, "Bolo not found");
    api.sendSuccess(res, updatedBolo);

    // Log
    logAct({
      user_id: sanitizedData.issued_by,
      entity_type: "bolo",
      action: "update",
      entity_id: updatedBolo.id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "updateBolo");
  }
}

// Delete bolo
export async function deleteBolo(req, res) {
  try {
    // Sanitize
    const id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    }

    // Delete
    const deletedBolo = await Bolo.deleteBolo(id);
    if (!deletedBolo) return api.sendError(res, 404, "Bolo not found");
    api.sendSuccess(res, { message: "Bolo deleted successfully" });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo",
      action: "delete",
      entity_id: id,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "deleteBolo");
  }
}

// Vehicles Bolos //
export async function createBoloVehicle(req, res) {
  try {
    // Sanitize
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const vehicle_id = sanitizeInteger(req.body.vehicle_id);

    // Validate
    if (!isValidInteger(bolo_id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    } else if (!isValidInteger(vehicle_id)) {
      return api.sendError(res, 400, "Invalid vehicle id");
    }

    // Create
    const newBoloVehicle = await Bolo.createBoloVehicle(bolo_id, vehicle_id);
    if (!newBoloVehicle)
      return api.sendError(
        res,
        404,
        "Bolo or vehicle not found. Or vehicle already exists in this bolo."
      );
    api.sendSuccess(res, newBoloVehicle, 201);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo_vehicle",
      action: "create",
      entity_id: `${bolo_id}-${vehicle_id}`,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "createBoloVehicle");
  }
}

export async function deleteBoloVehicle(req, res) {
  try {
    // Sanitize
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const vehicle_id = sanitizeInteger(req.params.vehicle_id);

    // Validate
    if (!isValidInteger(bolo_id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    } else if (!isValidInteger(vehicle_id)) {
      return api.sendError(res, 400, "Invalid vehicle id");
    }

    // Delete
    const deletedBoloVehicle = await Bolo.deleteBoloVehicle(
      bolo_id,
      vehicle_id
    );
    if (!deletedBoloVehicle)
      return api.sendError(res, 404, "Bolo or vehicle not found");
    api.sendSuccess(res, { message: "Bolo vehicle deleted successfully" });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo_vehicle",
      action: "delete",
      entity_id: `${bolo_id}-${vehicle_id}`,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "deleteBoloVehicle");
  }
}

// Persons Bolos //
export async function createBoloPerson(req, res) {
  try {
    // Sanitize
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.body.person_id);
    const role = sanitizeEnum(
      req.body.role,
      ["suspect", "victim", "witness", "unknown"],
      null
    );

    // Validate
    if (!isValidInteger(bolo_id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    } else if (!isValidInteger(person_id)) {
      return api.sendError(res, 400, "Invalid person id");
    } else if (
      !isValidEnum(role, ["suspect", "victim", "witness", "unknown", null])
    ) {
      return api.sendError(res, 400, "Invalid role");
    }

    // Create
    const newBoloPerson = await Bolo.createBoloPerson(bolo_id, {
      person_id,
      role,
    });
    if (!newBoloPerson)
      return api.sendError(res, 404, {
        message:
          "Bolo or person not found. Or person already exists in this bolo.",
      });
    api.sendSuccess(res, newBoloPerson, 201);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo_person",
      action: "create",
      entity_id: `${bolo_id}-${person_id}`,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "createBoloPerson");
  }
}

export async function updateBoloPerson(req, res) {
  try {
    // Sanitize
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.params.id);
    const role = sanitizeEnum(
      req.body.role,
      ["suspect", "victim", "witness", "unknown"],
      null
    );

    // Validate
    if (!isValidInteger(bolo_id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    } else if (!isValidInteger(person_id)) {
      return api.sendError(res, 400, "Invalid person id");
    } else if (
      !isValidEnum(role, ["suspect", "victim", "witness", "unknown"])
    ) {
      return api.sendError(res, 400, "Invalid role");
    }

    // Update
    const updatedBoloPerson = await Bolo.updateBoloPerson(bolo_id, {
      person_id,
      role,
    });
    if (!updatedBoloPerson)
      return api.sendError(res, 404, "Bolo or person not found");
    api.sendSuccess(res, updatedBoloPerson);

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo_person",
      action: "update",
      entity_id: `${bolo_id}-${person_id}`,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "updateBoloPerson");
  }
}

export async function deleteBoloPerson(req, res) {
  try {
    // Sanitize
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.params.id);

    // Validate
    if (!isValidInteger(bolo_id)) {
      return api.sendError(res, 400, "Invalid bolo id");
    } else if (!isValidInteger(person_id)) {
      return api.sendError(res, 400, "Invalid person id");
    }

    // Delete
    const deletedBoloPerson = await Bolo.deleteBoloPerson(bolo_id, person_id);
    if (!deletedBoloPerson)
      return api.sendError(res, 404, "Bolo or person not found");
    api.sendSuccess(res, { message: "Bolo person deleted successfully" });

    // Log
    logAct({
      user_id: req.user?.id || null,
      entity_type: "bolo_person",
      action: "delete",
      entity_id: `${bolo_id}-${person_id}`,
    }).catch(() => {});
  } catch (error) {
    api.handleDatabaseError(error, res, "deleteBoloPerson");
  }
}
