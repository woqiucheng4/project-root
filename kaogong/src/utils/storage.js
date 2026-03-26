// MVP 阶段使用全局内存 Map 存储，无需数据库中间件即可快速跑通
// ⚠️生产环境必须迁移至 Redis、PostgreSQL 或 Vercel KV
const reportStorage = new Map();

export const saveReport = (report) => {
  reportStorage.set(report.reportId, report);
};

export const getReport = (reportId) => {
  return reportStorage.get(reportId) || null;
};

// 模拟支付回调触发点
export const markReportAsPaid = (reportId) => {
  const report = reportStorage.get(reportId);
  if (report) {
    report.isPaid = true;
    reportStorage.set(reportId, report);
    return true;
  }
  return false;
};
