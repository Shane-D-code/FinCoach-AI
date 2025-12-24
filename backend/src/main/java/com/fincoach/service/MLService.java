package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;

@Service
public class MLService {

    @Autowired
    private RestTemplate restTemplate;

    // @Value("${app.ml.url}")
    private String mlBaseUrl = "http://localhost:8000";

    public ScenarioResponse simulateScenario(ScenarioRequest request) {
        Map<String, Object> input = new HashMap<>();
        input.put("income", request.getMonthlyIncome());
        input.put("expenses", request.getMonthlyIncome() * 0.5);
        input.put("risk_factor", 0.5);
        input.put("duration_months", request.getMonths());

        String url = mlBaseUrl + "/scenario/simulate";
        try {
            ResponseEntity<ScenarioResponse> response = restTemplate.postForEntity(url, input, ScenarioResponse.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to connect to ML Service: " + e.getMessage());
        }
    }

    public RiskAssessmentResponse assessRisk(Map<String, Object> data) {
        String url = mlBaseUrl + "/risk/assess-risk";
        Map<String, Object> body = new HashMap<>();
        body.put("data", data);

        try {
            return restTemplate.postForObject(url, body, RiskAssessmentResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access Risk Assessment Service");
        }
    }

    public NearbyDealsResponse getNearbyDeals(NearbyDealsRequest request) {
        String url = mlBaseUrl + "/nearby/nearby-deals";
        try {
            return restTemplate.postForObject(url, request, NearbyDealsResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access Nearby Deals Service");
        }
    }

    public PurchaseResponse simulatePurchase(PurchaseRequest request) {
        String url = mlBaseUrl + "/scenario/simulate-purchase";
        try {
            return restTemplate.postForObject(url, request, PurchaseResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access Purchase Simulation Service: " + e.getMessage());
        }
    }

    public ExpenseForecastResponse forecastExpenses(ExpenseForecastRequest request) {
        String url = mlBaseUrl + "/expense/forecast";
        try {
            return restTemplate.postForObject(url, request, ExpenseForecastResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access Expense Forecasting Service: " + e.getMessage());
        }
    }

    public PortfolioResponse analyzePortfolio(PortfolioRequest request) {
        String url = mlBaseUrl + "/market/portfolio";
        try {
            return restTemplate.postForObject(url, request, PortfolioResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access Market Service: " + e.getMessage());
        }
    }

    public OCRResponse scanBill(org.springframework.web.multipart.MultipartFile file) {
        String url = mlBaseUrl + "/ocr/scan-bill";
        try {
            // Create multipart request
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA);

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, Object>> requestEntity = 
                new org.springframework.http.HttpEntity<>(body, headers);

            ResponseEntity<OCRResponse> response = restTemplate.postForEntity(url, requestEntity, OCRResponse.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access OCR Service: " + e.getMessage());
        }
    }

    public OCRResponse scanBillBase64(String imageBase64) {
        String url = mlBaseUrl + "/ocr/scan-bill-base64";
        try {
            Map<String, String> body = new HashMap<>();
            body.put("image_base64", imageBase64);
            
            return restTemplate.postForObject(url, body, OCRResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to access OCR Service: " + e.getMessage());
        }
    }
}
