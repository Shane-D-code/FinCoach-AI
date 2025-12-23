package com.fincoach.controller;

import com.fincoach.dto.Dtos.*;
import com.fincoach.service.ScenarioSimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    @Autowired
    private ScenarioSimulationService scenarioSimulationService;

    /**
     * Real-time scenario simulation based on user's actual transaction data
     */
    @PostMapping("/simulate")
    public ResponseEntity<RealTimeScenarioResponse> simulateRealTimeScenario(@RequestBody RealTimeScenarioRequest request) {
        try {
            RealTimeScenarioResponse response = scenarioSimulationService.simulateRealTimeScenario(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(RealTimeScenarioResponse.builder()
                    .scenarioId("ERROR")
                    .userId(request.getUserId())
                    .scenarioType(request.getScenarioType())
                    .status("ERROR")
                    .insights(List.of("Error: " + e.getMessage()))
                    .lastUpdated(java.time.LocalDateTime.now())
                    .build());
        }
    }

    /**
     * Get user's scenario history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<RealTimeScenarioResponse>> getScenarioHistory(@PathVariable Long userId) {
        // TODO: Implement scenario history storage and retrieval
        return ResponseEntity.ok(List.of());
    }

    /**
     * Get scenario recommendations based on user's financial profile
     */
    @PostMapping("/recommendations")
    public ResponseEntity<List<String>> getScenarioRecommendations(@RequestBody RealTimeScenarioRequest request) {
        try {
            RealTimeScenarioResponse response = scenarioSimulationService.simulateRealTimeScenario(request);
            return ResponseEntity.ok(response.getRecommendations());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(List.of("Error generating recommendations: " + e.getMessage()));
        }
    }

    /**
     * Health check for scenario simulation service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Scenario Simulation Service is running");
    }
}
