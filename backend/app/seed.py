from sqlalchemy.orm import Session
from backend.app.database import SessionLocal, engine, Base
from backend.app.models.scheme import Scheme
from backend.app.models.legal import LegalAct, LegalSection
from backend.app.core.logging_config import logger

def seed_database():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Seed only public reference data. User accounts are always created through
        # the registration flow or a separately managed administration process.
        # 1. Seed Schemes
        schemes_data = [
            {
                "code": "PACS_COMP_2022",
                "title_en": "Centrally Sponsored Scheme for Computerization of 63,000 PACS",
                "title_hi": "63,000 पैक्स के कंप्यूटरीकरण की केंद्रीय प्रायोजित योजना",
                "title_kn": "63,000 ಪ್ಯಾಕ್ಸ್ ಗಣಕೀಕರಣ ಕೇಂದ್ರ ಪ್ರಾಯೋಜಿತ ಯೋಜನೆ",
                "category": "INFRASTRUCTURE",
                "ministry_or_agency": "Ministry of Cooperation, Government of India",
                "target_beneficiaries": ["PACS", "Primary Agricultural Credit Societies", "Farmers"],
                "description_en": "A project with Rs 2,516 Crore budget to onboard 63,000 functional PACS onto a cloud-based Common National Software ERP linking them directly with DCCBs and NABARD.",
                "description_hi": "63,000 पैक्स को क्लाउड-आधारित राष्ट्रीय साझा ईआरपी सॉफ्टवेयर पर लाने हेतु ₹2,516 करोड़ की योजना, जो इन्हें जिला सहकारी बैंकों और नाबार्ड से जोड़ती है।",
                "description_kn": "63,000 ಪ್ಯಾಕ್ಸ್ ಗಳನ್ನು ಏಕರೂಪದ ರಾಷ್ಟ್ರೀಯ ತಂತ್ರಾಂಶಕ್ಕೆ ಜೋಡಿಸಿ ಡಿಸಿಸಿ ಬ್ಯಾಂಕ್ ಮತ್ತು ನಬಾರ್ಡ್ ನೊಂದಿಗೆ ಸಂಯೋಜಿಸುವ 2,516 ಕೋಟಿ ರೂ.ಗಳ ಯೋಜನೆ.",
                "eligibility_criteria": {
                    "requires_pacs_membership": True,
                    "allowed_applicant_types": ["PACS"],
                    "documents_required": ["PACS Registration Certificate", "Resolution of Managing Committee", "DCCB Affiliation Letter"]
                },
                "benefits_summary": "100% financial grant for computer hardware (desktops, biometric scanners, printers, UPS), ERP software, and cloud hosting.",
                "application_process": "PACS Managing Committee passes resolution and submits onboarding request via State Cooperative Department portal.",
                "source_type": "OFFICIAL",
                "source_citation": "Cabinet Committee on Economic Affairs (CCEA), Gazette Notification 2022",
                "official_url": "https://cooperation.gov.in/pacs-computerization"
            },
            {
                "code": "YUVA_SAHAKAR",
                "title_en": "NCDC Yuva Sahakar — Cooperative Enterprise Support Scheme",
                "title_hi": "एनसीडीसी युवा सहकार योजना",
                "title_kn": "ಎನ್‌ಸಿಡಿಸಿ ಯುವ ಸಹಕಾರ ಯೋಜನೆ",
                "category": "YOUTH",
                "ministry_or_agency": "National Cooperative Development Corporation (NCDC)",
                "target_beneficiaries": ["Youth Entrepreneurs", "FPOs", "Primary Cooperatives"],
                "description_en": "Encourages young entrepreneurs to establish innovative cooperative startups in agriculture processing, warehousing, and green energy with soft term loans.",
                "description_hi": "युवा उद्यमियों को कृषि प्रसंस्करण, भंडारण और हरित ऊर्जा में सहकारी स्टार्टअप स्थापित करने हेतु रियायती ऋण सहायता।",
                "description_kn": "ಕೃಷಿ ಸಂಸ್ಕರಣೆ ಮತ್ತು ನವೀಕರಿಸಬಹುದಾದ ಇಂಧನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಯುವಜನರು ಸಹಕಾರಿ ಉದ್ಯಮಗಳನ್ನು ಸ್ಥಾಪಿಸಲು ರಿಯಾಯಿತಿ ಸಾಲ ನೆರವು ನೀಡುವ ಯೋಜನೆ.",
                "eligibility_criteria": {
                    "requires_pacs_membership": False,
                    "allowed_applicant_types": ["INDIVIDUAL_FARMER", "FPO", "PACS"],
                    "documents_required": ["Detailed Project Report (DPR)", "Society Registration / KYC", "Audited Financials (if existing)"]
                },
                "benefits_summary": "Term loan up to 80% of project cost (up to ₹3 Crore), 2% interest incentive on prompt repayment, and 85% for SC/ST/Women/PWD.",
                "application_process": "Submit project proposal directly to regional NCDC director or through State Cooperative Bank.",
                "source_type": "OFFICIAL",
                "source_citation": "NCDC Operational Guidelines 2023",
                "official_url": "https://www.ncdc.in"
            },
            {
                "code": "MISS_CROP_LOAN",
                "title_en": "Modified Interest Subvention Scheme (MISS) for Short Term Crop Loans",
                "title_hi": "संशोधित ब्याज अनुदान योजना (अल्पकालिक फसल ऋण)",
                "title_kn": "ಸ್ವಲ್ಪಾವಧಿ ಬೆಳೆ ಸಾಲಕ್ಕೆ ಪರಿಷ್ಕೃತ ಬಡ್ಡಿ ಸಹಾಯಧನ ಯೋಜನೆ",
                "category": "CREDIT",
                "ministry_or_agency": "Ministry of Agriculture & Cooperation / NABARD",
                "target_beneficiaries": ["Small and Marginal Farmers", "PACS Members"],
                "description_en": "Concessional short-term agricultural crop loans up to Rs 3 Lakh at 7% normal interest, with an additional 3% prompt repayment incentive, reducing effective rate to 4% per annum.",
                "description_hi": "₹3 लाख तक के अल्पकालिक फसल ऋण पर 7% सामान्य ब्याज, समय पर भुगतान करने पर 3% अतिरिक्त छूट के साथ प्रभावी ब्याज दर मात्र 4% प्रति वर्ष।",
                "description_kn": "ರೈತರಿಗೆ 3 ಲಕ್ಷ ರೂ. ವರೆಗಿನ ಅಲ್ಪಾವಧಿ ಬೆಳೆ ಸಾಲಕ್ಕೆ ಶೇ. 4 ರ ರಿಯಾಯಿತಿ ಬಡ್ಡಿದರದಲ್ಲಿ ಸಾಲ ಸೌಲಭ್ಯ.",
                "eligibility_criteria": {
                    "requires_pacs_membership": True,
                    "allowed_applicant_types": ["INDIVIDUAL_FARMER"],
                    "max_land_acres": 25.0,
                    "documents_required": ["Aadhaar Card", "Kisan Credit Card (KCC)", "Land Record / RTC Pahani"]
                },
                "benefits_summary": "Effective 4% annual interest rate for prompt paying farmers on crop loans up to ₹3,00,000.",
                "application_process": "Apply through your registered local PACS or affiliated District Central Cooperative Bank.",
                "source_type": "OFFICIAL",
                "source_citation": "NABARD Circular No. NB.DoR / 12 / 2023",
                "official_url": "https://www.nabard.org"
            }
        ]

        for s_data in schemes_data:
            existing = db.query(Scheme).filter(Scheme.code == s_data["code"]).first()
            if not existing:
                scheme = Scheme(**s_data)
                db.add(scheme)
                logger.info(f"Seeded Scheme: {s_data['code']}")

        # 3. Seed Legal Acts & Sections
        mscs_act = db.query(LegalAct).filter(LegalAct.act_code == "MSCS_ACT_2002").first()
        if not mscs_act:
            mscs_act = LegalAct(
                act_code="MSCS_ACT_2002",
                title_en="The Multi-State Co-operative Societies Act, 2002 & 2023 Amendments",
                title_hi="बहु-राज्य सहकारी सोसायटी अधिनियम, 2002",
                title_kn="ಬಹು-ರಾಜ್ಯ ಸಹಕಾರ ಸಂಘಗಳ ಕಾಯ್ದೆ, 2002",
                jurisdiction="National",
                enacted_year=2002,
                description="Governs cooperative societies serving members across more than one state, upholding democratic control and transparency.",
                source_type="OFFICIAL",
                official_source_url="https://cooperation.gov.in"
            )
            db.add(mscs_act)
            db.flush()

            # Add Sections
            sections_data = [
                {
                    "act_id": mscs_act.id,
                    "section_number": "Section 25",
                    "chapter": "Chapter III: Membership and Rights",
                    "title_en": "Persons who may become members",
                    "title_hi": "व्यक्ति जो सदस्य बन सकते हैं",
                    "title_kn": "ಸದಸ್ಯರಾಗಲು ಅರ್ಹ ವ್ಯಕ್ತಿಗಳು",
                    "simplified_en": "Any individual competent to contract, any other cooperative society, Central or State Government, and national cooperative corporations may become members.",
                    "simplified_hi": "कोई भी वयस्क नागरिक, अन्य सहकारी समिति, केंद्र या राज्य सरकार multi-state समिति के सदस्य बन सकते हैं।",
                    "simplified_kn": "ಯಾವುದೇ ಒಪ್ಪಂದಕ್ಕೆ ಅರ್ಹ ವ್ಯಕ್ತಿಗಳು, ಇತರ ಸಹಕಾರ ಸಂಘಗಳು ಅಥವಾ ಸರ್ಕಾರ ಸದಸ್ಯರಾಗಬಹುದು.",
                    "official_text": "No person shall be admitted as a member of a multi-state co-operative society except an individual competent to contract under section 11 of the Indian Contract Act, 1872; any other multi-state co-operative society or any co-operative society; the Central Government; a State Government; and the National Co-operative Development Corporation.",
                    "source_citation": "Act No. 39 of 2002, Gazette of India"
                },
                {
                    "act_id": mscs_act.id,
                    "section_number": "Section 41",
                    "chapter": "Chapter IV: Management of Societies",
                    "title_en": "Votes of members (One Member, One Vote)",
                    "title_hi": "सदस्यों का मतदान अधिकार (एक सदस्य, एक मत)",
                    "title_kn": "ಸದಸ್ಯರ ಮತದಾನ ಹಕ್ಕು (ಒಬ್ಬ ಸದಸ್ಯ, ಒಂದು ಮತ)",
                    "simplified_en": "Every member has exactly one vote regardless of their shareholding, ensuring pure democratic governance.",
                    "simplified_hi": "प्रत्येक सदस्य को केवल एक वोट देने का अधिकार है, भले ही उसके पास कितने भी शेयर हों।",
                    "simplified_kn": "ಸದಸ್ಯರು ಹೊಂದಿರುವ ಷೇರುಗಳ ಸಂಖ್ಯೆಯನ್ನು ಲೆಕ್ಕಿಸದೆ ಪ್ರತಿಯೊಬ್ಬ ಸದಸ್ಯನಿಗೆ ಒಂದು ಮತದ ಹಕ್ಕಿರುತ್ತದೆ.",
                    "official_text": "Every member of a multi-state co-operative society shall have one vote in the affairs of the society. In the case of an equality of votes, the chairperson shall have a second or casting vote.",
                    "source_citation": "Act No. 39 of 2002, Section 41"
                },
                {
                    "act_id": mscs_act.id,
                    "section_number": "Section 84",
                    "chapter": "Chapter IX: Settlement of Disputes",
                    "title_en": "Reference of disputes to arbitration",
                    "title_hi": "विवादों का मध्यस्थता (Arbitration) द्वारा निपटारा",
                    "title_kn": "ವಿವಾದಗಳನ್ನು ಮಧ್ಯಸ್ಥಿಕೆಗೆ ಒಪ್ಪಿಸುವುದು",
                    "simplified_en": "Disputes relating to the constitution, management, or business of the society must be referred to arbitration instead of civil courts.",
                    "simplified_hi": "समिति के संविधान, प्रबंधन या व्यापार संबंधी विवादों को दीवानी अदालत के बजाय मध्यस्थ (Arbitrator) के पास भेजा जाना चाहिए।",
                    "simplified_kn": "ಸಂಘದ ವ್ಯವಹಾರ ಅಥವಾ ಆಡಳಿತಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ವಿವಾದಗಳನ್ನು ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯದ ಬದಲಿಗೆ ಆರ್ಬಿಟ್ರೇಷನ್ ಮೂಲಕ ಇತ್ಯರ್ಥಪಡಿಸಬೇಕು.",
                    "official_text": "Notwithstanding anything contained in any other law for the time being in force, if any dispute touching the constitution, management or business of a multi-state co-operative society arises, such dispute shall be referred to arbitration.",
                    "source_citation": "Act No. 39 of 2002, Section 84"
                }
            ]
            for sec in sections_data:
                db.add(LegalSection(**sec))
            logger.info("Seeded MSCS Act and Sections.")

        db.commit()
        logger.info("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
