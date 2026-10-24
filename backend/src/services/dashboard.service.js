import prisma from '../config/prisma.js';

export class DashboardService {
  static async getAdminDashboard() {
    // 1. Counter Statistics
    const [
      totalMembers,
      totalInventory,
      activeLoans,
      pendingLoansCount,
      recentReportsCount,
      cashSummary,
    ] = await Promise.all([
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.inventoryItem.aggregate({
        _sum: { quantity: true },
        _count: true,
      }),
      prisma.loan.count({
        where: { status: { in: ['APPROVED', 'BORROWED'] } },
      }),
      prisma.loan.count({
        where: { status: 'PENDING' },
      }),
      prisma.fieldReport.count({
        where: {
          isResolved: false,
          status: { in: ['ATTENTION_NEEDED', 'DAMAGED'] },
        },
      }),
      Promise.all([
        prisma.transaction.aggregate({
          where: { type: 'INCOME' },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { type: 'EXPENSE' },
          _sum: { amount: true },
        }),
      ]),
    ]);

    const totalIncome = Number(cashSummary[0]._sum.amount || 0);
    const totalExpense = Number(cashSummary[1]._sum.amount || 0);
    const currentBalance = totalIncome - totalExpense;

    // 2. Inventory Condition Breakdown (Donut Chart)
    const inventoryConditions = await prisma.inventoryItem.groupBy({
      by: ['condition'],
      _sum: { quantity: true },
    });

    const conditionData = [
      { name: 'Baik', key: 'GOOD', value: 0 },
      { name: 'Rusak Ringan', key: 'SLIGHTLY_DAMAGED', value: 0 },
      { name: 'Rusak Berat', key: 'DAMAGED', value: 0 },
    ];
    inventoryConditions.forEach((ic) => {
      const target = conditionData.find((c) => c.key === ic.condition);
      if (target) target.value = Number(ic._sum.quantity || 0);
    });

    // 3. Reports Status Breakdown
    const reportStatuses = await prisma.fieldReport.groupBy({
      by: ['status'],
      _count: true,
    });
    const reportStatusData = [
      { name: 'Baik', key: 'GOOD', count: 0 },
      { name: 'Perlu Perhatian', key: 'ATTENTION_NEEDED', count: 0 },
      { name: 'Rusak', key: 'DAMAGED', count: 0 },
    ];
    reportStatuses.forEach((rs) => {
      const target = reportStatusData.find((r) => r.key === rs.status);
      if (target) target.count = rs._count;
    });

    // 4. Monthly Finance Trend (Last 6 Months)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('id-ID', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        income: 0,
        expense: 0,
      });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const recentTransactions = await prisma.transaction.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { type: true, amount: true, date: true },
    });

    recentTransactions.forEach((trx) => {
      const trxDate = new Date(trx.date);
      const found = months.find(
        (m) => m.year === trxDate.getFullYear() && m.month === trxDate.getMonth()
      );
      if (found) {
        if (trx.type === 'INCOME') found.income += Number(trx.amount);
        else found.expense += Number(trx.amount);
      }
    });

    // 5. Monthly Loan Trend
    const recentLoans = await prisma.loan.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });
    const loanTrend = months.map((m) => {
      const count = recentLoans.filter((l) => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      }).length;
      return { label: m.label, count };
    });

    // 6. Recent Activities & Pending Approvals
    const [recentActivities, pendingLoansList, criticalReports] = await Promise.all([
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, role: true } } },
      }),
      prisma.loan.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          member: true,
          loanItems: { include: { inventoryItem: true } },
        },
      }),
      prisma.fieldReport.findMany({
        where: {
          isResolved: false,
          status: { in: ['ATTENTION_NEEDED', 'DAMAGED'] },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          taskPoint: { include: { region: true } },
          member: true,
        },
      }),
    ]);

    return {
      stats: {
        totalMembers,
        totalInventoryCount: totalInventory._count,
        totalInventoryUnits: Number(totalInventory._sum.quantity || 0),
        activeLoans,
        pendingLoansCount,
        criticalReportsCount: recentReportsCount,
        balance: currentBalance,
        totalIncome,
        totalExpense,
      },
      charts: {
        financeTrend: months.map((m) => ({
          month: m.label,
          Pemasukan: m.income,
          Pengeluaran: m.expense,
        })),
        loanTrend,
        inventoryCondition: conditionData,
        reportStatus: reportStatusData,
      },
      recentActivities,
      pendingLoansList,
      criticalReports,
    };
  }

  static async getMemberDashboard(userId) {
    const member = await prisma.member.findUnique({
      where: { userId },
      include: { region: true },
    });

    if (!member) {
      return {
        member: null,
        stats: {
          totalLoans: 0,
          activeLoans: 0,
          taskPointsCount: 0,
        },
        myRecentLoans: [],
        assignedTaskPoints: [],
        myRecentReports: [],
      };
    }

    const [myLoansCount, myActiveLoansCount, assignedTaskPoints, myRecentLoans, myRecentReports] = await Promise.all([
      prisma.loan.count({ where: { memberId: member.id } }),
      prisma.loan.count({
        where: {
          memberId: member.id,
          status: { in: ['PENDING', 'APPROVED', 'BORROWED'] },
        },
      }),
      prisma.taskPoint.findMany({
        where: { picMemberId: member.id },
        include: { region: true, category: true },
      }),
      prisma.loan.findMany({
        where: { memberId: member.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          loanItems: { include: { inventoryItem: true } },
        },
      }),
      prisma.fieldReport.findMany({
        where: { memberId: member.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          taskPoint: true,
          media: true,
        },
      }),
    ]);

    return {
      member,
      stats: {
        totalLoans: myLoansCount,
        activeLoans: myActiveLoansCount,
        taskPointsCount: assignedTaskPoints.length,
      },
      assignedTaskPoints,
      myRecentLoans,
      myRecentReports,
    };
  }
}

