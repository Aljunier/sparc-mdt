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
} from "../utils/validate.js";

// Get all uncancelled bolos with limited details
export async function getBoloSummary(_, res) {
  try {
    const bolos = await Bolo.getBoloSummary();
    res.status(200).json(bolos);
  } catch (error) {
    console.error("[getBoloSummary] Error fetching bolo summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all details from a specific bolo from its id
export async function getBolo(req, res) {
  try {
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    }

    const [bolo] = await Bolo.getBolo(id);
    if (!bolo) return res.status(404).json({ message: "Bolo not found" });
    res.status(200).json(bolo);
  } catch (error) {
    console.error("[getBolo] Error fetching bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create new bolo
export async function createBolo(req, res) {
  try {
    // Sanitize and prepare bolo data
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
      // Current date + 7 days
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate bolo data
    const { valid, errors } = validateBolo(sanitizedData);
    if (!valid) {
      return res
        .status(400)
        .json({ message: "Validation errors occurred", errors });
    }

    const newBolo = await Bolo.createBolo(sanitizedData);
    res.status(201).json(newBolo);
  } catch (error) {
    console.error("[createBolo] Error creating bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update bolo
export async function updateBolo(req, res) {
  try {
    const id = sanitizeInteger(req.params.id);
    const body = req.body;

    // Validate bolo ID
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    }

    // Sanitize and prepare bolo data
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
      // Current date + 7 days
      expires_at: body.expires_at
        ? sanitizeDate(body.expires_at)
        : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    // Validate bolo data
    const { valid, errors } = validateBolo(sanitizedData);
    if (!valid) {
      return res
        .status(400)
        .json({ message: "Validation errors occurred", errors });
    }

    const updatedBolo = await Bolo.updateBolo(id, sanitizedData);
    if (!updatedBolo)
      return res.status(404).json({ message: "Bolo not found" });

    res.status(200).json(updatedBolo);
  } catch (error) {
    console.error("[updateBolo] Error updating bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete bolo
export async function deleteBolo(req, res) {
  try {
    const id = sanitizeInteger(req.params.id);
    if (!isValidInteger(id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    }

    const deletedBolo = await Bolo.deleteBolo(id);
    if (!deletedBolo)
      return res.status(404).json({ message: "Bolo not found" });
    res.status(200).json({ message: "Bolo deleted successfully" });
  } catch (error) {
    console.error("[deleteBolo] Error deleting bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Vehicles Bolos //
export async function createBoloVehicle(req, res) {
  try {
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const vehicle_id = sanitizeInteger(req.body.vehicle_id);
    if (!isValidInteger(bolo_id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    } else if (!isValidInteger(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const newBoloVehicle = await Bolo.createBoloVehicle(bolo_id, vehicle_id);
    if (!newBoloVehicle)
      return res.status(404).json({
        message:
          "Bolo or vehicle not found. Or vehicle already exists in this bolo.",
      });
    res.status(201).json(newBoloVehicle);
  } catch (error) {
    console.error("[createBoloVehicle] Error creating bolo vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBoloVehicle(req, res) {
  try {
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const vehicle_id = sanitizeInteger(req.params.id);

    // Validate IDs
    if (!isValidInteger(bolo_id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    } else if (!isValidInteger(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const deletedBoloVehicle = await Bolo.deleteBoloVehicle(
      bolo_id,
      vehicle_id
    );
    if (!deletedBoloVehicle)
      return res.status(404).json({ message: "Bolo or vehicle not found" });
    res.status(200).json({ message: "Bolo vehicle deleted successfully" });
  } catch (error) {
    console.error("[deleteBoloVehicle] Error deleting bolo vehicle:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Persons Bolos //
export async function createBoloPerson(req, res) {
  try {
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.body.person_id);
    const role = sanitizeEnum(
      req.body.role,
      ["suspect", "victim", "witness", "unknown"],
      null
    );

    // Validate IDs and role
    if (!isValidInteger(bolo_id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    } else if (!isValidInteger(person_id)) {
      return res.status(400).json({ message: "Invalid person ID" });
    } else if (
      !isValidEnum(role, ["suspect", "victim", "witness", "unknown", null])
    ) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const newBoloPerson = await Bolo.createBoloPerson(bolo_id, {
      person_id,
      role,
    });
    if (!newBoloPerson)
      return res.status(404).json({
        message:
          "Bolo or person not found. Or person already exists in this bolo.",
      });
    res.status(201).json(newBoloPerson);
  } catch (error) {
    console.error("[createBoloPerson] Error creating bolo person:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateBoloPerson(req, res) {
  try {
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.params.id);
    const role = sanitizeEnum(
      req.body.role,
      ["suspect", "victim", "witness", "unknown"],
      null
    );

    console.log(role);
    // Validate IDs and role
    if (!isValidInteger(bolo_id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    } else if (!isValidInteger(person_id)) {
      return res.status(400).json({ message: "Invalid person ID" });
    } else if (
      !isValidEnum(role, ["suspect", "victim", "witness", "unknown"])
    ) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedBoloPerson = await Bolo.updateBoloPerson(bolo_id, {
      person_id,
      role,
    });
    if (!updatedBoloPerson)
      return res.status(404).json({ message: "Bolo or person not found" });
    res.status(200).json(updatedBoloPerson);
  } catch (error) {
    console.error("[updateBoloPerson] Error updating bolo person:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBoloPerson(req, res) {
  try {
    const bolo_id = sanitizeInteger(req.params.bolo_id);
    const person_id = sanitizeInteger(req.params.id);

    // Validate IDs
    if (!isValidInteger(bolo_id)) {
      return res.status(400).json({ message: "Invalid bolo ID" });
    } else if (!isValidInteger(person_id)) {
      return res.status(400).json({ message: "Invalid person ID" });
    }

    const deletedBoloPerson = await Bolo.deleteBoloPerson(bolo_id, person_id);
    if (!deletedBoloPerson)
      return res.status(404).json({ message: "Bolo or person not found" });
    res.status(200).json({ message: "Bolo person deleted successfully" });
  } catch (error) {
    console.error("[deleteBoloPerson] Error deleting bolo person:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
