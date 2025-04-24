import { Router } from "express";
import {
  createReport,
  deleteReport,
  getReportDetail,
  getReports,
  updateReport,
} from "../controllers/reportController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  validateCreateReportBody,
  validateGetReportQuery,
  validateReportId,
  validateUpdateReportBody,
} from "../middlewares/reportValidator.js";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware.js";

const router = Router();

// 사용자 권한
router.post(
  "/",
  authMiddleware.authenticate,
  validateCreateReportBody,
  validationErrorMiddleware,
  createReport
);

// 어드민 권한
router.get(
  "/",
  authMiddleware.authenticate,
  validateGetReportQuery,
  validationErrorMiddleware,
  getReports
);
router.get(
  "/:reportId",
  authMiddleware.authenticate,
  validateReportId,
  validationErrorMiddleware,
  getReportDetail
);
router.delete(
  "/:reportId",
  validateReportId,
  validationErrorMiddleware,
  deleteReport
);
router.patch(
  "/:reportId",
  validateReportId,
  validateUpdateReportBody,
  validationErrorMiddleware,
  updateReport
);

export default router;
