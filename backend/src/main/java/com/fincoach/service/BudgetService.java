package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class BudgetService {

    // Mock Rule-Based Recommendation Engine
    public List<BudgetRecommendationResponse> getRecommendations(String userEmail) {
        List<BudgetRecommendationResponse> recommendations = new ArrayList<>();

        recommendations.add(BudgetRecommendationResponse.builder()
                .category("Dining")
                .suggestion("You are spending 30% more on dining than last month. Consider cooking at home.")
                .riskLevel("MEDIUM")
                .build());

        recommendations.add(BudgetRecommendationResponse.builder()
                .category("Shopping")
                .suggestion("Your shopping expenses are within limits. Good job!")
                .riskLevel("LOW")
                .build());

        return recommendations;
    }
}
