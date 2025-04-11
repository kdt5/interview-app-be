import { Router } from "express";
import {
  createReport,
  deleteReport,
  getReportDetail,
  getReports,
  updateReport,
} from "../controllers/reportController";
import authMiddleware from "../middlewares/authMiddleware";
import {
  validateCreateReportBody,
  validateGetReportQuery,
  validateReportId,
  validateUpdateReportBody,
} from "../middlewares/reportValidator";
import { validationErrorMiddleware } from "../middlewares/validationErrorMiddleware";

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
