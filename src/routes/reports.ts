import { Router } from "express";
import { createReport, deleteReport, getReportDetail, getReports, updateReport } from "../controllers/reportController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getReports);
router.get("/:reportId", getReportDetail);
router.post("/", authMiddleware.authenticate, createReport);
router.delete("/:reportId", deleteReport);
router.patch("/:reportId", updateReport);

export default router;