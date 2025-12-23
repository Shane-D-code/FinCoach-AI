package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.service.MLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MLController {

    @Autowired
    private MLService mlService;

    @PostMapping("/scenario/simulate")
    public ResponseEntity<ScenarioResponse> simulateScenario(@RequestBody ScenarioRequest request) {
        return ResponseEntity.ok(mlService.simulateScenario(request));
    }

    @PostMapping("/risk/assess")
    public ResponseEntity<RiskAssessmentResponse> assessRisk(@RequestBody RiskAssessmentRequest request) {
        return ResponseEntity.ok(mlService.assessRisk(request.getData()));
    }

    @PostMapping("/nearby/deals")
    public ResponseEntity<NearbyDealsResponse> getNearbyDeals(@RequestBody NearbyDealsRequest request) {
        return ResponseEntity.ok(mlService.getNearbyDeals(request));
    }

    @PostMapping("/ocr/transactions")
    public ResponseEntity<?> ingestOcrData(@RequestBody Map<String, Object> ocrData) {
        // Mocking successful ingestion logic for OCR until the service is available
        return ResponseEntity.ok(Map.of("message", "OCR Data Processed Successfully", "itemsProcessed", 5));
    }

    @PostMapping("/scenario/purchase")
    public ResponseEntity<PurchaseResponse> simulatePurchase(@RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(mlService.simulatePurchase(request));
    }

    @PostMapping("/expense/forecast")
    public ResponseEntity<ExpenseForecastResponse> forecastExpenses(@RequestBody ExpenseForecastRequest request) {
        return ResponseEntity.ok(mlService.forecastExpenses(request));
    }

    @PostMapping("/market/portfolio")
    public ResponseEntity<PortfolioResponse> analyzePortfolio(@RequestBody PortfolioRequest request) {
        return ResponseEntity.ok(mlService.analyzePortfolio(request));
    }
}
