package com.expensetracker.demo.controller;

import com.expensetracker.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") 

public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary(@RequestParam("userId") Long userId) {
        return dashboardService.getDashboardSummary(userId);
    }
}
