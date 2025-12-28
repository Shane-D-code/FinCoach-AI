package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.security.JwtUtils;
import com.fincoach.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    BudgetService budgetService;

    @Autowired
    JwtUtils jwtUtils;

    @GetMapping("/recommendation")
    public ResponseEntity<?> getRecommendations(@RequestHeader("Authorization") String token) {
        String email = jwtUtils.getUserNameFromJwtToken(token.substring(7));
        List<BudgetRecommendationResponse> recommendations = budgetService.getRecommendations(email);
        return ResponseEntity.ok(recommendations);
    }
}
