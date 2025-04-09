import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import reportService from "../services/reportService";
import { ReportStatus, ReportTargetType } from "@prisma/client";
import { UserInfo } from "../services/authService";

export async function getReports(
    req: Request, 
    res: Response, 
    next:NextFunction
): Promise<void> {
    try {
        const reports = await reportService.getReports();

        res.status(StatusCodes.OK).json(reports);
    } catch(error) {
        next(error);
    }
}

export async function getReportDetail(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { reportId } = req.params;

        const report = await reportService.getReportDetail(parseInt(reportId));

        if (!report) {
            res.status(StatusCodes.NOT_FOUND).json({ message: "Report not found" });
            return;
        }

        res.status(StatusCodes.OK).json(report);
    } catch(error) {
        next(error);
    }
}

export interface CreateReportRequest {
    body: {
        targetType: ReportTargetType;
        targetId: number;
        reason: string;
    }
}

export async function createReport(
    req: Request & { user?: UserInfo },
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { targetType, targetId, reason } = req.body as CreateReportRequest["body"];
        const reporterId = (req.user as UserInfo).userId;

        const newReport = await reportService.createReport(reporterId, targetType, targetId, reason);

        res.status(StatusCodes.CREATED).json(newReport);
    } catch(error) {
        next(error);
    }
}

export async function deleteReport(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { reportId } = req.params;
        await reportService.deleteReport(parseInt(reportId));

        res.status(StatusCodes.NO_CONTENT).send();
    } catch(error) {
        next(error);
    }
}

export interface UpdateReportRequest {
    params: {
        reportId: string;
    }

    body: {
        status: ReportStatus;
    }
}

export async function updateReport(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const { reportId } = req.params as UpdateReportRequest["params"];
    const { status } = req.body as UpdateReportRequest["body"];

    try {
        const updatedReport = await reportService.updateReport(parseInt(reportId), status);

        res.status(StatusCodes.OK).json(updatedReport);
        
    } catch(error) {
        next(error);
    }
}