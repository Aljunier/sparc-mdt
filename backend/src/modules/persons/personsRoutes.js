import express from "express";
import * as personsController from "./personsController.js";

const router = express.Router();

///  api/persons/  ///

// Search Persons
router.get("/search/", personsController.searchPersons);
// Get Person by id
router.get("/:id", personsController.getPersonById);
// Create Person
router.post("/", personsController.createPerson);
// Update Person
router.put("/:id", personsController.updatePerson);
// Delete Person
router.delete("/:id", personsController.deletePerson);

///  api/persons/charges  ///

// Get Charges for Person
router.get("/:personId/charges/", personsController.getChargesByPersonId);
// Get Charge by id
router.get("/charges/:chargeId", personsController.getChargeById);

///  api/persons/fines  ///

// Get Fines for Person
router.get("/:personId/fines/", personsController.getFinesByPersonId);
// Get Fine by id
router.get("/fines/:fineId", personsController.getFineById);
export default router;
