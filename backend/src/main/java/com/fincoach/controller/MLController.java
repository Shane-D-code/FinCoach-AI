package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.service.MLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDate;

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

    @PostMapping("/ocr/scan-bill")
    public ResponseEntity<OCRResponse> scanBill(@RequestParam("file") MultipartFile file) {
        try {
            OCRResponse response = mlService.scanBill(file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            OCRResponse errorResponse = new OCRResponse(
                false,
                null,
                "",
                "Error processing bill: " + e.getMessage()
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    @PostMapping("/ocr/scan-bill-base64")
    public ResponseEntity<OCRResponse> scanBillBase64(@RequestBody String imageBase64) {
        try {
            OCRResponse response = mlService.scanBillBase64(imageBase64);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            OCRResponse errorResponse = new OCRResponse(
                false,
                null,
                "",
                "Error processing bill: " + e.getMessage()
            );
            return ResponseEntity.ok(errorResponse);
        }
    }
}
