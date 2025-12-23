# Real-Time ML Model Integration Plan

## Current Situation Analysis

### Existing Architecture
- **Frontend**: React/TypeScript app with Lifestyle page
- **Backend**: Spring Boot with ML service integration  
- **ML Services**: Python FastAPI services (nearby.py, ml_main.py)
- **Current Data Flow**: Mock → ML Model → Frontend Display

### Current Limitations
1. **Mock Data**: Uses static merchant list and synthetic deals
2. **No Real APIs**: No integration with actual deal platforms
3. **Limited Scope**: Only basic store types (Walmart, Target, etc.)
4. **No Real-Time Updates**: Static data with no live refresh

## Real-Time Integration Strategy

### Phase 1: API Integration Layer
**Goal**: Connect to real deal APIs and merchant databases

#### Recommended Real-Time Data Sources:
1. **Google Places API** - Merchant locations and reviews
2. **Yelp API** - Local business data and ratings
3. **RetailMeNot API** - Actual coupons and deals
4. **Honey/Rakuten APIs** - Cashback and discount data
5. **Groupon API** - Local deals and promotions
6. **Facebook/Instagram Business APIs** - Merchant promotions

#### Implementation Steps:
1. Create data aggregation service
2. Implement API rate limiting and caching
3. Build merchant database with real locations
4. Add deal verification and filtering

### Phase 2: ML Model Enhancement
**Goal**: Train model on real deal data for better predictions

#### Model Improvements:
1. **Feature Engineering**: Include real metrics like:
   - Merchant ratings and reviews
   - Historical deal performance
   - Seasonal patterns
   - User engagement metrics
   - Competition analysis

2. **Real-Time Scoring**: 
   - Dynamic score calculation based on:
     - Distance and travel time
     - User preferences and history
     - Deal quality and authenticity
     - Merchant reputation

3. **Personalization**:
   - User behavior analysis
   - Category preferences
   - Spending patterns
   - Location history

### Phase 3: Real-Time Data Pipeline
**Goal**: Build live data processing and ML inference system

#### Architecture Components:
1. **Data Ingestion Pipeline**
   - Real-time API polling
   - Webhook integrations
   - Event streaming
   - Data validation and cleaning

2. **ML Processing Pipeline**
   - Real-time model inference
   - Batch processing for training
   - Model versioning and A/B testing
   - Performance monitoring

3. **Caching and Performance**
   - Redis for deal caching
   - CDN for merchant data
   - Background job processing
   - Result optimization

### Phase 4: Enhanced Frontend Integration
**Goal**: Display real-time data with advanced features

#### New Features:
1. **Real-Time Updates**
   - Live deal refresh
   - Push notifications
   - Price tracking
   - Expiration alerts

2. **Advanced Filtering**
   - Deal authenticity verification
   - User ratings and reviews
   - Category-based filtering
   - Price range preferences

3. **Social Features**
   - Deal sharing
   - User reviews
   - Community ratings
   - Friend recommendations

## Technical Implementation Plan

### 1. Data Source Integration

#### Create Data Aggregator Service:
```python
# data_aggregator.py
class RealTimeDealsAggregator:
    def __init__(self):
        self.google_places = GooglePlacesAPI()
        self.yelp_api = YelpAPI()
        self.retailmenot = RetailMeNotAPI()
        
    async def fetch_nearby_deals(self, lat, lng, radius):
        # Aggregate deals from multiple sources
        deals = []
        deals.extend(await self.google_places.get_merchants(lat, lng, radius))
        deals.extend(await self.yelp_api.get_deals(lat, lng, radius))
        deals.extend(await self.retailmenot.get_coupons(lat, lng, radius))
        
        # Filter and deduplicate
        return self.process_and_filter_deals(deals)
```

### 2. Enhanced ML Model

#### Upgrade nearby.py with real data:
```python
# Enhanced nearby.py with real-time data
from data_aggregator import RealTimeDealsAggregator
import asyncio

@app.post("/nearby-deals")
async def get_real_time_deals(req: DealRequest):
    aggregator = RealTimeDealsAggregator()
    
    # Fetch real deals from multiple APIs
    real_deals = await aggregator.fetch_nearby_deals(
        req.latitude, req.longitude, req.radius_km
    )
    
    if not real_deals:
        return {"count": 0, "deals": []}
    
    # Convert to DataFrame for ML processing
    df = pd.DataFrame(real_deals)
    
    # Enhanced feature engineering
    df['merchant_rating'] = df['rating'].fillna(0)
    df['review_count'] = df['review_count'].fillna(0)
    df['price_level'] = df['price_level'].fillna(2)
    df['is_verified'] = df['verified'].astype(bool)
    
    # Prepare features for ML model
    features = [
        'distance_km', 'discount_val', 'merchant_rating', 
        'review_count', 'price_level', 'is_verified'
    ]
    
    # Enhanced scoring with real data
    X = df[features]
    scores = model.predict_proba(X)[:, 1]  # Probability of deal being good
    
    df['score'] = scores
    df = df.sort_values('score', ascending=False).head(req.top_k)
    
    return {
        "count": len(df),
        "deals": df.to_dict(orient="records"),
        "last_updated": datetime.now().isoformat(),
        "data_sources": df['source'].unique().tolist()
    }
```

### 3. Backend Service Updates

#### Enhanced MLService.java:
```java
@Service
public class RealTimeMLService {
    
    @Value("${app.ml.real-time.enabled}")
    private boolean realTimeEnabled;
    
    @Value("${app.ml.api-keys.google-places}")
    private String googlePlacesKey;
    
    @Value("${app.ml.api-keys.yelp}")
    private String yelpKey;
    
    public NearbyDealsResponse getNearbyDeals(NearbyDealsRequest request) {
        if (realTimeEnabled) {
            return getRealTimeDeals(request);
        } else {
            return getMockDeals(request);
        }
    }
    
    private NearbyDealsResponse getRealTimeDeals(NearbyDealsRequest request) {
        // Call enhanced Python service with real-time data
        String url = mlBaseUrl + "/nearby/real-time-deals";
        try {
            return restTemplate.postForObject(url, request, NearbyDealsResponse.class);
        } catch (Exception e) {
            // Fallback to mock data if real-time fails
            return getMockDeals(request);
        }
    }
}
```

### 4. Frontend Enhancements

#### Enhanced Lifestyle.tsx with real-time features:
```typescript
// Real-time features for Lifestyle.tsx
const [realTimeEnabled, setRealTimeEnabled] = useState(true);
const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
const [dataSources, setDataSources] = useState<string[]>([]);

const fetchDeals = async (useRealTime: boolean = true) => {
  if (navigator.geolocation) {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const res = await mlApi.getNearbyDeals(
          position.coords.latitude, 
          position.coords.longitude,
          5, // radius
          { realTime: useRealTime }
        );
        
        if (res.deals) {
          setLocalDeals(res.deals);
          setLastUpdated(new Date());
          setDataSources(res.dataSources || []);
        }
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setIsLoading(false);
      }
    });
  }
};

// Auto-refresh every 5 minutes
useEffect(() => {
  const interval = setInterval(() => {
    fetchDeals(realTimeEnabled);
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [realTimeEnabled]);
```

## Implementation Timeline

### Week 1-2: Data Source Integration
- [ ] Set up Google Places API
- [ ] Integrate Yelp API
- [ ] Create data aggregator service
- [ ] Implement basic deal filtering

### Week 3-4: ML Model Enhancement
- [ ] Retrain model with real data
- [ ] Add new features (ratings, reviews, etc.)
- [ ] Implement real-time scoring
- [ ] Add model versioning

### Week 5-6: Backend Integration
- [ ] Update Spring Boot services
- [ ] Add API key management
- [ ] Implement caching layer
- [ ] Add monitoring and logging

### Week 7-8: Frontend Enhancement
- [ ] Real-time data display
- [ ] Auto-refresh functionality
- [ ] Enhanced filtering options
- [ ] Performance optimization

## Cost Considerations

### API Costs (Estimated Monthly):
- **Google Places API**: $200-500 (depending on usage)
- **Yelp API**: $100-300
- **RetailMeNot API**: $150-400
- **Additional APIs**: $200-600

### Infrastructure Costs:
- **Enhanced ML Processing**: $50-150/month
- **Caching Layer (Redis)**: $30-100/month
- **Monitoring & Logging**: $20-50/month

**Total Estimated Cost**: $750-2,100/month (depending on scale)

## Risk Mitigation

### 1. Fallback Strategy
- Always have mock data as backup
- Graceful degradation when APIs fail
- Circuit breaker pattern for external APIs

### 2. Rate Limiting
- Implement API rate limiting
- Caching to reduce API calls
- Batch processing for efficiency

### 3. Data Quality
- Deal verification system
- Duplicate detection and removal
- Spam and fake deal filtering

## Success Metrics

### Technical Metrics:
- API response time < 2 seconds
- 99.5% uptime
- < 1% error rate
- 50+ deals per location

### Business Metrics:
- User engagement increase
- Deal click-through rates
- User satisfaction scores
- Conversion rates

## Next Steps

1. **Choose Data Sources**: Select 2-3 primary APIs to start with
2. **Set Up Infrastructure**: Create development environment
3. **Build MVP**: Implement basic real-time integration
4. **Test & Iterate**: Gather feedback and improve
5. **Scale Up**: Add more data sources and features

This plan will transform your demo system into a production-ready real-time deals platform with actual merchant data and live deal information.
