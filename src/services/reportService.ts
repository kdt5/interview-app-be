import { ReportStatus, ReportTargetType } from "@prisma/client";
import prisma from "../lib/prisma";

const reportService = {
    getReports,
    getReportDetail,
    createReport,
    deleteReport,
    updateReport
}

export default reportService;

async function getReports() {
    return prisma.report.findMany();
}

async function getReportDetail(reportId: number) {
    return prisma.report.findUnique({
        where: {id: reportId}
    });
}

async function createReport(
    reporterId: number,
    targetType: ReportTargetType,
    targetId: number,
    reason: string
) {
    return prisma.report.create({
        data: {
            reporterId,
            targetType,
            targetId,
            reason
        }
    });
}

async function deleteReport(reportId: number) {
    return prisma.report.delete({
        where: { id: reportId }
    });
}

async function updateReport(reportId: number, status: ReportStatus) {
    return prisma.report.update({
        where: { id: reportId },
        data: { status }
    });
}