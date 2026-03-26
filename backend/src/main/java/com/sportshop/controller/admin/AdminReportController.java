package com.sportshop.controller.admin;

import com.sportshop.dto.common.ApiResponse;
import com.sportshop.dto.dashboard.DashboardResponse;
import com.sportshop.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final DashboardService dashboardService;

    public AdminReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> revenueReport() {
        DashboardResponse summary = dashboardService.getSummary();
        Map<String, Object> data = Map.of(
                "totalRevenue", summary.getTotalRevenue(),
                "revenueByDay", summary.getRevenueByDay(),
                "topProducts", summary.getTopProducts(),
                "orderStatusStats", summary.getOrderStatusStats()
        );
        return ResponseEntity.ok(ApiResponse.success("Revenue report", data));
    }
}
