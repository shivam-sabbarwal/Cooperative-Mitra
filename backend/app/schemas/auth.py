from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone: str = Field(..., description="10-digit mobile number")
    email: Optional[EmailStr] = None
    full_name: str
    role: str = "MEMBER"
    language: str = "en"
    pacs_name: Optional[str] = None
    pacs_registration_number: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "Karnataka"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")

class UserLogin(BaseModel):
    phone_or_email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    language: Optional[str] = None
    pacs_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: str
    exp: int
    role: Optional[str] = None
