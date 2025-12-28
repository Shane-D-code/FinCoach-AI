package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.service.MockMLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MockMLController {

    @Autowired
    MockMLService mockMLService;

    @PostMapping("/scenario/simulate")
    public ResponseEntity<?> simulateScenario(@RequestBody ScenarioRequest request) {
        ScenarioResponse response = mockMLService.simulateScenario(request);
        return ResponseEntity.ok(response);
    }

    // Ingest OCR Data (Mock)
    @PostMapping("/ocr/transactions")
    public ResponseEntity<?> ingestOcrData(@RequestBody Map<String, Object> ocrData) {
        // Mocking successful ingestion logic
        // In real ML scenario, this would parse JSON and save transactions via
        // TransactionService
        return ResponseEntity.ok(Map.of("message", "OCR Data Processed Successfully", "itemsProcessed", 5));
    }
}
