import { Router } from "express";
import {
  generateReportController,
  getAllReportsController,
  resendReportController,
  updateReportSettingController,
} from "../controllers/report.controller";

const reportRoutes = Router();

reportRoutes.get("/all", getAllReportsController);
reportRoutes.get("/generate", generateReportController);
reportRoutes.put("/update-setting", updateReportSettingController);
reportRoutes.post("/resend/:id", resendReportController);

export default reportRoutes;
