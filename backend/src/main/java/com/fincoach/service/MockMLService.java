package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import org.springframework.stereotype.Service;

@Service
public class MockMLService {

    public ScenarioResponse simulateScenario(ScenarioRequest request) {
        // Mock Logic: Simple projection
        double monthlySavings = request.getMonthlyIncome() - (request.getCurrentBalance() * 0.1); // Mock expense
                                                                                                  // assumption
        double futureBalance = request.getCurrentBalance() + (monthlySavings * request.getMonths());

        String riskLevel = futureBalance >= request.getTargetSavings() ? "LOW" : "HIGH";

        return ScenarioResponse.builder()
                .futureBalance(futureBalance)
                .riskLevel(riskLevel)
                .build();
    }
}
