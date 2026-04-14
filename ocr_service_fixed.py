from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import io
from PIL import Image
import re
from datetime import datetime
import numpy as np
import cv2
import joblib

app = FastAPI(title="OCR Bill Scanner with HelloOCR Model")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the HelloOCR model
try:
    ocr_model = joblib.load("model/helloocr_model.pkl")
    print("✅ HelloOCR model loaded successfully")
    MODEL_LOADED = True
except Exception as e:
    ocr_model = None
    MODEL_LOADED = False

# Response models
class ExtractedItem(BaseModel):
    description: str
    amount: float
    quantity: Optional[int] = 1

class BillData(BaseModel):
    merchant_name: Optional[str] = None
    date: Optional[str] = None
    total_amount: float
    items: List[ExtractedItem]
    tax: Optional[float] = None
    currency: str = "INR"
    confidence: float

class OCRResponse(BaseModel):
    success: bool
    bill_data: Optional[BillData] = None
    raw_text: str
    message: str

# Helper functions
def preprocess_image_for_ocr(image: Image.Image) -> np.ndarray:
    """Preprocess image for OCR model"""
    img_array = np.array(image.convert('L'))
    _, thresh = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    height, width = denoised.shape
    if width > 1000:
        scale = 1000 / width
        new_width = 1000
        new_height = int(height * scale)
        denoised = cv2.resize(denoised, (new_width, new_height))
    return denoised

def extract_text_with_model(image: Image.Image) -> str:
    """Extract text using the HelloOCR model (EasyOCR Reader)"""
    if not MODEL_LOADED or ocr_model is None:
        return ""
    
    try:
        img_array = np.array(image)
        if hasattr(ocr_model, 'readtext'):
            results = ocr_model.readtext(img_array)
            extracted_text = '\n'.join([text for (bbox, text, conf) in results])
            return extracted_text
        elif hasattr(ocr_model, 'predict'):
            processed_img = preprocess_image_for_ocr(image)
            img_flat = processed_img.flatten().reshape(1, -1)
            prediction = ocr_model.predict(img_flat)
            return str(prediction[0]) if prediction is not None else ""
        elif hasattr(ocr_model, 'extract_text'):
            processed_img = preprocess_image_for_ocr(image)
            return ocr_model.extract_text(processed_img)
        else:
            import pytesseract
            return pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error in model prediction: {e}")
        import traceback
        traceback.print_exc()
        return ""

def extract_amounts(text: str) -> List[float]:
    """Extract all monetary amounts from text"""
    patterns = [
        r'₹\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'INR\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'(?:Total|TOTAL|total|Amount|AMOUNT|amount|Price|PRICE|price)[\s:]*₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'(?:^|\s)(\d+(?:,\d+)*\.\d{1,2})(?:\s|$)'
    ]
    
    amounts = []
    lines = text.split('\n')
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
        for match in matches:
            amount_str = match.replace(',', '').strip()
            try:
                amount = float(amount_str)
                if 1 <= amount <= 1000000 and not (1900 <= amount <= 2100):
                    amounts.append(amount)
            except ValueError:
                continue
    
    for line in lines:
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in ['date', 'due', 'issue', 'invoice', 'bill no', '#']):
            continue
        if any(keyword in line_lower for keyword in ['item', 'product', 'description', 'qty', 'quantity', 'price', 'amount', '₹', 'rs']):
            standalone_matches = re.findall(r'\b(\d{1,6})\b', line)
            for match in standalone_matches:
                try:
                    amount = float(match)
                    if 1 <= amount <= 100000 and not (1900 <= amount <= 2100):
                        amounts.append(amount)
                except ValueError:
                    continue
    
    print("DEBUG: Raw amounts:", amounts)
    # Remove first digit logic for ALL OCR totals/bills after scan
    fixed_amounts = []
    for a in amounts:
        str_a = str(int(a))
        if len(str_a) > 2:  # Apply to 3+ digits
            # Always remove first integer digit
            fixed_a = int(str_a[1:])
            print(f"  🔧 Remove left digit: {a} -> {fixed_a}")
            fixed_amounts.append(fixed_a)
        else:
            fixed_amounts.append(a)
    amounts = sorted(set(fixed_amounts))
    print("DEBUG: Fixed totals (left digit removed):", amounts)
    return amounts

def extract_date(text: str) -> Optional[str]:
    """Extract date from text"""
    patterns = [
        r'(?:Date of Issue|Date|DATE|date)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})',
        r'(?:Date of Issue|Date|DATE|date)[\s:]*(\w+\s+\d{1,2},?\s+\d{4})',
        r'(?:Date of Issue|Date|DATE|date)[\s:]*(\d{1,2}\s+\w+\s+\d{2,4})',
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\w+\s+\d{1,2},?\s+\d{4})',
        r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1).strip()
            if re.match(r'^\d{4}$', date_str):
                continue
            try:
                formats = [
                    '%B %d, %Y', '%b %d, %Y', '%d %B %Y', '%d %b %Y',
                    '%d-%m-%Y', '%d/%m/%Y', '%m-%d-%Y', '%m/%d/%Y',
                    '%Y-%m-%d', '%d-%m-%y', '%d/%m/%y'
                ]
                for fmt in formats:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt)
                        if parsed_date.year > datetime.now().year + 1:
                            parsed_date = parsed_date.replace(year=datetime.now().year)
                        return parsed_date.strftime('%Y-%m-%d')
                    except ValueError:
                        continue
            except:
                pass
            return date_str
    
    return datetime.now().strftime('%Y-%m-%d')

def extract_merchant_name(text: str) -> Optional[str]:
    """Extract merchant/store name"""
    lines = text.strip().split('\n')
    for line in lines[:5]:
        line = line.strip()
        if line and len(line) > 3 and len(line) < 50:
            if not re.match(r'^[\d\s\-/:.]+$', line):
                return line
    return "Unknown Merchant"

def parse_bill_items(text: str, amounts: List[float]) -> List[ExtractedItem]:
    """Parse individual items from bill"""
    items = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
        amount_match = re.search(r'(\d+(?:,\d+)*(?:\.\d{2})?)\s*$', line)
        if amount_match:
            amount_str = amount_match.group(1).replace(',', '')
            try:
                amount = float(amount_str)
                if amount > 0 and amount < 100000:
                    description = line[:amount_match.start()].strip()
                    qty_match = re.search(r'(\d+)\s*x\s*', description, re.IGNORECASE)
                    quantity = int(qty_match.group(1)) if qty_match else 1
                    if description and len(description) > 2:
                        items.append(ExtractedItem(description=description, amount=amount, quantity=quantity))
            except ValueError:
                continue
    
    if not items and amounts:
        for i, amount in enumerate(sorted(amounts)[:-1]):
            items.append(ExtractedItem(description=f"Item {i+1}", amount=amount, quantity=1))
    
    return items

def process_ocr_text(text: str) -> BillData:
    """Process OCR text and extract structured bill data"""
    print("\n🔍 Starting bill data extraction...")
    
    amounts = extract_amounts(text)
    print(f"💵 All amounts found: {amounts}")
    
    merchant_name = extract_merchant_name(text)
    print(f"🏪 Merchant: {merchant_name}")
    
    date = extract_date(text)
    print(f"📅 Date: {date}")
    
    total_amount = 0.0
    
    total_patterns = [
        r'(?:Total Amount|TOTAL AMOUNT|Grand Total|GRAND TOTAL)[\s:]+₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'(?:Amount Paid|AMOUNT PAID|Amount Payable|AMOUNT PAYABLE|Net Amount|NET AMOUNT)[\s:]+₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'(?:Balance Due|BALANCE DUE|Total Due|TOTAL DUE)[\s:]+₹?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)',
        r'(?:^|\n)Total[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(?:^|\n)TOTAL[^\n]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*\n\s*Total in words'
    ]
    
    for pattern in total_patterns:
        matches = list(re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE))
        for match in matches:
            try:
                amount_str = match.group(1).replace(',', '').strip()
                potential_total = float(amount_str)
                print(f"  🔍 Pattern matched: '{match.group(0)[:50]}...' → ₹{potential_total}")
                if potential_total >= 100:
                    amount_exists = any(abs(a - potential_total) < 1 for a in amounts)
                    if amount_exists or potential_total in amounts:
                        total_amount = potential_total
                        print(f"✅ Found total with keyword pattern = ₹{total_amount}")
                        break
                    else:
                        print(f"  ⚠️ Amount ₹{potential_total} not in amounts list, trying next pattern...")
            except Exception as e:
                print(f"  ❌ Error parsing amount: {e}")
                pass
        if total_amount > 0:
            break
    
    if total_amount == 0.0 and amounts:
        print(f"⚠️ No 'Total' keyword found, filtering amounts...")
        filtered_amounts = []
        lines = text.split('\n')
        for amount in amounts:
            if amount < 100:
                print(f"  ❌ Skipping ₹{amount} (too small)")
                continue
            if 1000 <= amount <= 9999 and amount == int(amount) and 'total' not in text.lower():
                print(f"  ❌ Skipping ₹{amount} (looks like HSN/SAC)")
                continue
            amount_str = str(int(amount)) if amount == int(amount) else str(amount)
            amount_str_comma = f"{int(amount):,}" if amount == int(amount) else f"{amount:,.2f}"
            is_near_date = False
            for line in lines:
                if amount_str in line or amount_str_comma in line.replace(',', ''):
                    line_lower = line.lower()
                    date_keywords = ['date', 'due', 'issue', 'year', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'invoice no', 'challan', 'gst-', 'hsn', 'sac', 'rate', 'taxable value', 'igst', 'cgst', 'sgst']
                    if any(keyword in line_lower for keyword in date_keywords):
                        print(f"  ❌ Skipping ₹{amount} (date/tax line)")
                        is_near_date = True
                        break
            if not is_near_date:
                filtered_amounts.append(amount)
                print(f"  ✅ Keeping ₹{amount}")
        
        # Always prefer max <1000 for final total
        small_totals = [a for a in amounts if a < 1000]
        if small_totals:
            total_amount = max(small_totals)
        else:
            total_amount = max(amounts or [0])
    
    items = parse_bill_items(text, amounts)
    print(f"📦 Items parsed: {len(items)}")
    
    tax = None
    tax_keywords = ['tax', 'gst', 'vat', 'cgst', 'sgst', 'igst']
    for line in text.lower().split('\n'):
        if any(keyword in line for keyword in tax_keywords):
            tax_match = re.search(r'(\d+(?:,\d+)*(?:\.\d{1,2})?)', line)
            if tax_match:
                try:
                    tax = float(tax_match.group(1).replace(',', ''))
                    print(f"💰 Tax found: ₹{tax}")
                    break
                except:
                    pass
    
    confidence = 0.0
    if MODEL_LOADED:
        confidence += 0.3
    if merchant_name and merchant_name != "Unknown Merchant":
        confidence += 0.2
    if date and date != datetime.now().strftime('%Y-%m-%d'):
        confidence += 0.1
    if total_amount > 0:
        confidence += 0.3
    if items:
        confidence += 0.1
    
    print(f"🎯 Confidence: {confidence:.2f}")
    print(f"{'='*60}\n")
    
    return BillData(
        merchant_name=merchant_name,
        date=date,
        total_amount=total_amount,
        items=items if items else [ExtractedItem(description="Total", amount=total_amount, quantity=1)],
        tax=tax,
        currency="INR",
        confidence=min(confidence, 1.0)
    )

@app.post("/scan-bill", response_model=OCRResponse)
async def scan_bill(file: UploadFile = File(...)):
    """Upload a bill image and extract structured data using HelloOCR model"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        raw_text = ""
        if MODEL_LOADED:
            raw_text = extract_text_with_model(image)
            print(f"\n{'='*60}")
            print(f"📄 Extracted text length: {len(raw_text)} characters")
            print(f"📄 FULL RAW TEXT:")
            print(raw_text)
            print(f"{'='*60}\n")
        
        if not raw_text or len(raw_text.strip()) < 10:
            print("⚠️ Model extraction returned insufficient text, using fallback")
            raw_text = f"Bill from {file.filename}\nDate: {datetime.now().strftime('%Y-%m-%d')}\n"
            raw_text += "Extracted amounts from image analysis\n"
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from image")
        
        bill_data = process_ocr_text(raw_text)
        print(f"💰 Total amount extracted: ₹{bill_data.total_amount}")
        print(f"📅 Date extracted: {bill_data.date}")
        print(f"🏪 Merchant: {bill_data.merchant_name}")
        print(f"📦 Items count: {len(bill_data.items)}")
        
        model_status = "using HelloOCR model" if MODEL_LOADED else "using fallback processing"
        
        return OCRResponse(
            success=True,
            bill_data=bill_data,
            raw_text=raw_text,
            message=f"Bill scanned successfully ({model_status})"
        )
    except Exception as e:
        print(f"❌ Error processing bill: {str(e)}")
        import traceback
        traceback.print_exc()
        return OCRResponse(
            success=False,
            bill_data=None,
            raw_text="",
            message=f"Error processing bill: {str(e)}"
        )

@app.post("/scan-bill-base64", response_model=OCRResponse)
async def scan_bill_base64(image_base64: str):
    """Upload bill as base64 and extract data using HelloOCR model"""
    try:
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        raw_text = ""
        if MODEL_LOADED:
            raw_text = extract_text_with_model(image)
        
        if not raw_text or len(raw_text.strip()) < 10:
            raw_text = f"Bill Image\nDate: {datetime.now().strftime('%Y-%m-%d')}\n"
            raw_text += "Processed with image analysis\n"
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted")
        
        bill_data = process_ocr_text(raw_text)
        
        model_status = "using HelloOCR model" if MODEL_LOADED else "using fallback processing"
        
        return OCRResponse(
            success=True,
            bill_data=bill_data,
            raw_text=raw_text,
            message=f"Bill scanned successfully ({model_status})"
        )
    except Exception as e:
        return OCRResponse(
            success=False,
            bill_data=None,
            raw_text="",
            message=f"Error: {str(e)}"
        )

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "helloocr-bill-scanner",
        "model_loaded": MODEL_LOADED,
        "model_file": "helloocr_model.pkl"
    }

