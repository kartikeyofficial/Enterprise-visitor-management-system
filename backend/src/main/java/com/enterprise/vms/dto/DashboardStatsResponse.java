package com.enterprise.vms.dto;

public class DashboardStatsResponse {
    private long totalVisitorsToday;
    private long activeInsideBuilding;
    private long pendingApprovals;
    private long totalPassesGenerated;
    private long totalCheckInsAllTime;

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalVisitorsToday, long activeInsideBuilding, long pendingApprovals, long totalPassesGenerated, long totalCheckInsAllTime) {
        this.totalVisitorsToday = totalVisitorsToday;
        this.activeInsideBuilding = activeInsideBuilding;
        this.pendingApprovals = pendingApprovals;
        this.totalPassesGenerated = totalPassesGenerated;
        this.totalCheckInsAllTime = totalCheckInsAllTime;
    }

    public long getTotalVisitorsToday() {
        return totalVisitorsToday;
    }

    public void setTotalVisitorsToday(long totalVisitorsToday) {
        this.totalVisitorsToday = totalVisitorsToday;
    }

    public long getActiveInsideBuilding() {
        return activeInsideBuilding;
    }

    public void setActiveInsideBuilding(long activeInsideBuilding) {
        this.activeInsideBuilding = activeInsideBuilding;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public long getTotalPassesGenerated() {
        return totalPassesGenerated;
    }

    public void setTotalPassesGenerated(long totalPassesGenerated) {
        this.totalPassesGenerated = totalPassesGenerated;
    }

    public long getTotalCheckInsAllTime() {
        return totalCheckInsAllTime;
    }

    public void setTotalCheckInsAllTime(long totalCheckInsAllTime) {
        this.totalCheckInsAllTime = totalCheckInsAllTime;
    }
}
