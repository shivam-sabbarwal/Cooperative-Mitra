import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.seed import seed_database
from backend.app.core.security import create_access_token

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    # Seed test db
    db = TestingSessionLocal()
    from backend.app.models.user import User, UserRole
    from backend.app.core.security import hash_password
    from backend.app.models.scheme import Scheme
    from backend.app.models.legal import LegalAct, LegalSection

    # Seed admin & member
    admin = User(
        phone="9876543210",
        email="admin@test.com",
        full_name="Test Admin",
        hashed_password=hash_password("Pass123"),
        role=UserRole.ADMIN.value,
        is_active=True
    )
    member = User(
        phone="9123456789",
        email="member@test.com",
        full_name="Test Member",
        hashed_password=hash_password("Pass123"),
        role=UserRole.MEMBER.value,
        is_active=True
    )
    db.add(admin)
    db.add(member)

    # Seed sample scheme
    scheme = Scheme(
        code="TEST_SCHEME",
        title_en="PACS Digital Support",
        title_hi="पैक्स डिजिटल सहायता",
        title_kn="ಪ್ಯಾಕ್ಸ್ ಡಿಜಿಟಲ್ ಬೆಂಬಲ",
        category="INFRASTRUCTURE",
        ministry_or_agency="Ministry of Cooperation",
        target_beneficiaries=["PACS", "Farmers"],
        description_en="Digital assistance for societies",
        description_hi="समितियों के लिए डिजिटल सहायता",
        description_kn="ಸಂಘಗಳಿಗೆ ಡಿಜಿಟಲ್ ನೆರವು",
        eligibility_criteria={
            "requires_pacs_membership": True,
            "allowed_applicant_types": ["INDIVIDUAL_FARMER", "PACS"],
            "max_land_acres": 10.0
        },
        benefits_summary="Subsidy up to 50%",
        application_process="Apply online",
        source_type="OFFICIAL",
        source_citation="Govt Circular 2023",
        is_active=True
    )
    db.add(scheme)

    # Seed legal act
    act = LegalAct(
        act_code="TEST_ACT",
        title_en="Test Multi-State Cooperative Act",
        title_hi="परीक्षण बहु-राज्य सहकारी अधिनियम",
        title_kn="ಪರೀಕ್ಷಾ ಸಹಕಾರ ಕಾಯ್ದೆ",
        jurisdiction="National",
        enacted_year=2023,
        description="Testing act description",
        source_type="OFFICIAL"
    )
    db.add(act)
    db.flush()

    sec = LegalSection(
        act_id=act.id,
        section_number="Section 10",
        title_en="Democratic Control",
        title_hi="लोकतांत्रिक नियंत्रण",
        title_kn="ಪ್ರಜಾಸತ್ತಾತ್ಮಕ ನಿಯಂತ್ರಣ",
        simplified_en="One member one vote",
        simplified_hi="एक सदस्य एक मत",
        simplified_kn="ಒಬ್ಬ ಸದಸ್ಯ ಒಂದು ಮತ",
        official_text="Every member shall have one vote.",
        source_citation="Act Section 10"
    )
    db.add(sec)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def member_token():
    return create_access_token(data={"sub": "2", "role": "MEMBER"})

@pytest.fixture
def admin_token():
    return create_access_token(data={"sub": "1", "role": "ADMIN"})
