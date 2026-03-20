import os
import json
from typing import Optional
from pydantic import BaseModel, Field, model_validator
from google.cloud import documentai
import vertexai
from vertexai.generative_models import GenerativeModel, Part

class BillData(BaseModel):
    provider: Optional[str] = None
    account_number: Optional[str] = None
    billing_period: Optional[str] = None
    total_kwh: Optional[float] = None
    total_amount_thb: Optional[float] = None
    peak_kwh: Optional[float] = None
    off_peak_kwh: Optional[float] = None
    confidence: float

    @model_validator(mode='after')
    def validate_ranges(self) -> 'BillData':
        if self.total_kwh is not None and not (0 < self.total_kwh < 100000):
            raise ValueError("total_kwh must be between 0 and 100,000")
        if self.total_amount_thb is not None and not (0 < self.total_amount_thb < 1000000):
            raise ValueError("total_amount_thb must be between 0 and 1,000,000")
        return self

async def extract_bill_data(image_bytes: bytes) -> BillData:
    """Extracts energy bill data using Document AI and Gemini as fallback."""
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "mock-project-id")
    location = os.environ.get("DOCUMENTAI_LOCATION", "us")
    processor_id = os.environ.get("DOCUMENTAI_PROCESSOR_ID", "mock-processor-id")

    # In a real environment, we'd use GCS to stage the file as required by WK-010.
    # For Document AI synchronous processing, we can send bytes directly.
    
    confidence = 1.0
    extracted = {}

    try:
        docai_client = documentai.DocumentProcessorServiceClient()
        name = docai_client.processor_path(project_id, location, processor_id)
        
        raw_document = documentai.RawDocument(content=image_bytes, mime_type="image/jpeg")
        request = documentai.ProcessRequest(name=name, raw_document=raw_document)
        
        # When mocking for tests, this call should be intercepted.
        result = docai_client.process_document(request=request)
        document = result.document
        
        for entity in document.entities:
            conf = entity.confidence
            if conf < confidence:
                confidence = conf
                
            type_str = entity.type_
            val = entity.normalized_value.text if entity.normalized_value else entity.mention_text
            
            if type_str == "supplier_name":
                extracted["provider"] = "PEA" if "PEA" in val.upper() or "à¸ à¸¹à¸¡à¸´à¸ à¸²à¸„" in val else "MEA"
            elif type_str == "account_number":
                extracted["account_number"] = val
            elif type_str == "invoice_date":
                extracted["billing_period"] = val
            elif type_str == "total_amount":
                try: extracted["total_amount_thb"] = float(val)
                except ValueError: pass
                
        # Simulate extraction of kwh which might be custom to Document AI invoice parser setup
        for entity in document.entities:
            if entity.type_ == "total_kwh":
                try: extracted["total_kwh"] = float(entity.mention_text)
                except ValueError: pass

        if confidence >= 0.7 and (extracted.get("total_amount_thb") or extracted.get("total_kwh")):
            # Validate before returning Document AI results
            try:
                return BillData(**extracted, confidence=confidence)
            except ValueError:
                pass # Range check failed, fallback to Gemini
                
    except Exception as e:
        print(f"Document AI extraction failed or fallback required: {e}")
        confidence = 0.0 # Force fallback

    # Fallback to Gemini if Document AI failed or returned < 0.7 confidence
    try:
        vertexai.init(project=project_id, location=location)
        model = GenerativeModel("gemini-1.5-pro-preview-0409")
        
        prompt = """
        Extract the following information from the provided energy bill image and return it ONLY as a JSON object matching this schema:
        {
            "provider": "PEA or MEA",
            "account_number": "string",
            "billing_period": "string",
            "total_kwh": float,
            "total_amount_thb": float,
            "peak_kwh": float,
            "off_peak_kwh": float,
            "confidence": float
        }
        Do not wrap in markdown tags. Provide only the JSON.
        """
        image_part = Part.from_data(data=image_bytes, mime_type="image/jpeg")
        response = model.generate_content([image_part, prompt])
        
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        gemini_data = json.loads(response_text)
        
        if "confidence" not in gemini_data:
            gemini_data["confidence"] = 0.8 # Fallback confidence if model omits it
            
        return BillData(**gemini_data)
    except Exception as e:
        raise RuntimeError(f"Fallback Gemini OCR failed: {e}")
