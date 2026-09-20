from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User, UserRole, LanguagePreference
from backend.app.schemas.auth import UserCreate, UserLogin, UserResponse, Token, UserUpdate
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check phone uniqueness
    existing_phone = db.query(User).filter(User.phone == user_in.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this phone number already exists"
        )
    
    # Check email if provided
    if user_in.email:
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
            
    # Hash password & create user
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        phone=user_in.phone,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        # Public registration can only create member accounts. Privileged
        # roles must be assigned through an authenticated administration flow.
        role=UserRole.MEMBER.value,
        language=user_in.language or LanguagePreference.EN.value,
        pacs_name=user_in.pacs_name,
        pacs_registration_number=user_in.pacs_registration_number,
        district=user_in.district,
        state=user_in.state or "Karnataka",
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate JWT token
    access_token = create_access_token(data={"sub": str(db_user.id), "role": db_user.role})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(db_user))

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.phone == credentials.phone_or_email) | (User.email == credentials.phone_or_email)
    ).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone/email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.email is not None:
        existing_email = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id,
        ).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists",
            )
        current_user.email = user_update.email
    if user_update.language is not None:
        current_user.language = user_update.language
    if user_update.pacs_name is not None:
        current_user.pacs_name = user_update.pacs_name
    if user_update.district is not None:
        current_user.district = user_update.district
    if user_update.state is not None:
        current_user.state = user_update.state

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
