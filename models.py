from pydantic import BaseModel, Field
from typing import Optional

class KitchenRecordCreate(BaseModel):
    date: str = Field(..., description="Date of transaction (DD/MM/YYYY)")
    person_name: str = Field(..., min_length=1, description="Person name / Devotee / Contact")
    program: Optional[str] = Field(default="", description="Program, event, or location")
    type: str = Field(default="Order", description="Order, Sponsor, or Coupon")
    payment_through: str = Field(default="Cash", description="Payment mode: Cash, Gpay, Bank, etc.")
    amount: float = Field(default=0.0, ge=0, description="Amount in ₹")
    payment_received: str = Field(default="Yes", description="Yes or No")
    notes: Optional[str] = Field(default="", description="Remarks or verification notes")
    number_of_devotees: Optional[int] = Field(default=0, ge=0, description="Number of devotees for Order prasad")
    menu_type: Optional[str] = Field(default="", description="Light, Medium, Heavy, Very Heavy")

class KitchenRecordUpdate(BaseModel):
    date: Optional[str] = None
    person_name: Optional[str] = None
    program: Optional[str] = None
    type: Optional[str] = None
    payment_through: Optional[str] = None
    amount: Optional[float] = None
    payment_received: Optional[str] = None
    notes: Optional[str] = None
    number_of_devotees: Optional[int] = None
    menu_type: Optional[str] = None

class VendorItem(BaseModel):
    vendor_name: str = Field(..., min_length=1, description="Vendor / Expense category name")
    amount: float = Field(default=0.0, ge=0, description="Expense amount in ₹")

class VendorEntryCreate(BaseModel):
    vendor_name: str = Field(..., min_length=1, description="Vendor / Store name from dropdown or new")
    amount: float = Field(..., gt=0, description="Bill / Expense amount in ₹")
    date: Optional[str] = Field(default="", description="Bill date DD/MM/YYYY")
    notes: Optional[str] = Field(default="", description="Invoice number / purchased items / notes")
    tab: Optional[str] = Field(default=None, description="Month tab name")

class VendorCreate(BaseModel):
    vendor_name: str = Field(..., min_length=1, description="New vendor / store name")
    initial_amount: Optional[float] = Field(default=0.0, ge=0, description="Initial bill amount in ₹")
    tab: Optional[str] = Field(default=None, description="Month tab name")

class CookCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Cook name")
    base_salary: float = Field(default=18000.0, ge=0, description="Monthly basic salary in ₹")
    role: Optional[str] = Field(default="Cook", description="Assigned role or machine area")
    festival_allowance: Optional[float] = Field(default=1000.0, ge=0, description="Festival allowance per program in ₹")
    yearly_bonus: Optional[float] = Field(default=0.0, ge=0, description="Yearly Janmāṣṭamī bonus in ₹")
    tab: Optional[str] = Field(default=None, description="Month tab name")

class CookUpdate(BaseModel):
    name: Optional[str] = None
    base_salary: Optional[float] = None
    festival_allowance: Optional[float] = None
    yearly_bonus: Optional[float] = None
    role: Optional[str] = None
    tab: Optional[str] = None

class TabSelectRequest(BaseModel):
    tab: str = Field(..., description="Month worksheet name, e.g. 'April 26'")

class CreateSheetRequest(BaseModel):
    sheet_name: str = Field(..., min_length=2, description="Name of the new month sheet, e.g. 'Dec 26'")
    clone_from: Optional[str] = Field(default="Master_Template", description="Template tab to clone structure from")
