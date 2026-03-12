const express = require("express");
const controller = require("../controllers/teacherController");
const { requireAdminAuth } = require("../utils/adminAuth");

const router = express.Router();

router.get("/", controller.getAllTeachers);
router.get("/search", controller.searchTeachers);
router.get("/by-time", controller.getTeachersByTime);
router.get("/current-office-hour", controller.getCurrentOfficeHourTeachers);
router.post("/", requireAdminAuth, controller.createTeacher);
router.put("/:id", requireAdminAuth, controller.updateTeacher);
router.delete("/:id", requireAdminAuth, controller.deleteTeacher);

module.exports = router;
