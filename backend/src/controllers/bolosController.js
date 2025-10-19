import * as Bolo from "../models/Bolo.js";

// Get all uncancelled bolos with limited details
export async function getBoloList(_, res) {
  try {
    const bolos = await Bolo.getBoloList();
    res.status(200).json(bolos);
  } catch (error) {
    console.error("[getBoloList] Error fetching bolo list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all bolos
export async function getAllBolos(_, res) {
  try {
    const bolos = await Bolo.getAllBolos();
    res.status(200).json(bolos);
  } catch (error) {
    console.error("[getAllBolos] Error fetching all bolos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all details from a specfic bolo from its id
export async function getBolo(req, res) {
  try {
    const [bolo] = await Bolo.getBolo(req.params.id);

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
    const {
      issued_by,
      report_id,
      type,
      title,
      description,
      status,
      priority,
      expires_at,
    } = req.body;

    const boloData = {
      issued_by,
      report_id: report_id || null,
      type: type || "other",
      title,
      description,
      status: status || "active",
      priority: priority || "medium",
      // Current date + 7 days
      expires_at: expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };

    const newBolo = await Bolo.createBolo(boloData);
    res.status(201).json(newBolo);
  } catch (error) {
    console.error("[createBolo] Error creating bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update bolo
export async function updateBolo(req, res) {
  try {
    const {
      issued_by,
      report_id,
      type,
      title,
      description,
      status,
      priority,
      expires_at,
    } = req.body;

    const boloData = {
      issued_by,
      report_id: report_id || null,
      type: type || "other",
      title,
      description,
      status: status || "active",
      priority: priority || "medium",
      // Current date + 7 days
      expires_at: expires_at ?? new Date(Date.now() + 24 * 60 * 60 * 1000 * 7),
    };
    const updatedBolo = await Bolo.updateBolo(req.params.id, boloData);
    if (!updatedBolo)
      return res.status(404).json({ message: "Bolo not found" });

    res.status(200).json(updatedBolo);
  } catch (error) {
    console.error("[updateBolo] Error updating bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteBolo(req, res) {
  try {
    // TODO Check for permissions?
    const deletedBolo = await Bolo.deleteBolo(req.params.id);
    if (!deletedBolo)
      return res.status(404).json({ message: "Bolo not found" });
    res.status(200).json({ message: "Bolo deleted successfully" });
  } catch (error) {
    console.error("[deleteBolo] Error deleting bolo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
