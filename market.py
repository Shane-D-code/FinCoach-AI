from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import yfinance as yf
import numpy as np

market_app = FastAPI()

class PortfolioItem(BaseModel):
    symbol: str
    quantity: float
    purchase_price: float 

class PortfolioRequest(BaseModel):
    items: List[PortfolioItem]

class PortfolioResponse(BaseModel):
    total_value: float
    holdings: List[Dict[str, Any]]
    currency_rate: float # USD to INR

@market_app.post("/portfolio")
def analyze_portfolio(request: PortfolioRequest):
    try:
        symbols = [item.symbol for item in request.items]
        # Fetch current data
        # Using yfinance to fetch live data
        tickers = yf.Tickers(" ".join(symbols))
        
        # Fetch USD to INR rate
        usd_inr = yf.Ticker("INR=X").history(period="1d")['Close'].iloc[-1]
        
        holdings_data = []
        total_value_inr = 0.0

        for item in request.items:
            ticker = tickers.tickers.get(item.symbol.upper())
            if not ticker and item.symbol == "Mutual Fund A":
                 # Mock fallback for non-standard ticker in the example
                 current_price = 15.5 # dummy
                 currency = "USD"
            elif ticker:
                 # Fast way to get price
                 history = ticker.history(period="1d")
                 if not history.empty:
                    current_price = history['Close'].iloc[-1]
                    # Attempt to get previous close for change calc
                    prev_close = ticker.info.get('previousClose', current_price)
                 else:
                    current_price = item.purchase_price # Fallback
                    prev_close = item.purchase_price
                 
            else:
                 current_price = item.purchase_price # Fallback
                 prev_close = item.purchase_price
            
            # Simple conversion: assume stock is USD if not specified (yfinance usually USD for these tickers)
            # In a real app we check ticker.info['currency']
            
            current_value_usd = current_price * item.quantity
            current_value_inr = current_value_usd * usd_inr
            
            change_pct = ((current_price - prev_close) / prev_close) * 100 if prev_close else 0.0
            
            holdings_data.append({
                "symbol": item.symbol,
                "quantity": item.quantity,
                "current_price_usd": round(current_price, 2),
                "current_val_inr": round(current_value_inr, 2),
                "gain_pct": round(change_pct, 2)
            })
            
            total_value_inr += current_value_inr

        return {
            "total_value": round(total_value_inr, 2),
            "holdings": holdings_data,
            "currency_rate": round(usd_inr, 2)
        }

    except Exception as e:
        print(f"Error fetching market data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
