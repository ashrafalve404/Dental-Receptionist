from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.database import Base
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.conversation import Conversation
from app.models.clinic import ClinicSettings, FAQItem
from datetime import datetime, timedelta


def seed_clinic_settings(db: Session):
    existing = db.query(ClinicSettings).first()
    if existing:
        return
    
    settings = ClinicSettings(
        clinic_name="AS Clinic",
        address="123 Dental Street, Medical District, Dhaka",
        phone="+880 1234-567890",
        email="contact@asclinic.com",
        opening_time="09:00",
        closing_time="20:00",
        working_days="Saturday,Sunday,Monday,Tuesday,Wednesday,Thursday",
        slot_duration_minutes=30,
        emergency_note="For dental emergencies, please call our emergency line or visit the nearest emergency dental clinic."
    )
    db.add(settings)
    db.commit()
    print("Clinic settings seeded")


def seed_faqs(db: Session):
    existing = db.query(FAQItem).first()
    if existing:
        return
    
    faqs = [
        FAQItem(
            question="What are your working hours?",
            answer="We are open Saturday to Thursday from 9:00 AM to 8:00 PM. We are closed on Fridays.",
            category="timing"
        ),
        FAQItem(
            question="Where is AS Clinic located?",
            answer="We are located at 123 Dental Street, Medical District, Dhaka.",
            category="location"
        ),
        FAQItem(
            question="What services do you offer?",
            answer="We offer: Dental Checkup, Teeth Cleaning, Tooth Extraction, Root Canal, Braces Consultation, Teeth Whitening, and Gum Treatment.",
            category="services"
        ),
        FAQItem(
            question="How much is the consultation fee?",
            answer="Our consultation fee is 500 BDT. This may vary depending on the type of examination required.",
            category="fees"
        ),
        FAQItem(
            question="Do you do teeth cleaning?",
            answer="Yes, we offer professional teeth cleaning (scaling and polishing) as part of our dental services.",
            category="services"
        ),
        FAQItem(
            question="Can I get braces at AS Clinic?",
            answer="Yes, we provide braces consultation and treatment. Our orthodontist will assess your case and recommend the best options.",
            category="services"
        ),
        FAQItem(
            question="How do I book an appointment?",
            answer="You can book an appointment by calling us, visiting our clinic, or using our AI chatbot. For immediate assistance, use our online booking system.",
            category="booking"
        ),
        FAQItem(
            question="What should I do for tooth pain?",
            answer="For tooth pain, we recommend visiting us for examination. Meanwhile, you can take pain relievers and avoid hot/cold foods. If it's an emergency, please seek immediate care.",
            category="emergency"
        ),
        FAQItem(
            question="Do you treat children?",
            answer="Yes, we provide dental care for patients of all ages including children.",
            category="services"
        ),
        FAQItem(
            question="What is root canal treatment?",
            answer="Root canal treatment is a procedure to treat infected or damaged tooth pulp. It involves removing the infected tissue and sealing the tooth to prevent further infection.",
            category="services"
        )
    ]
    
    for faq in faqs:
        db.add(faq)
    db.commit()
    print(f"Seeded {len(faqs)} FAQ items")


def seed_sample_patients(db: Session):
    existing = db.query(Patient).first()
    if existing:
        return
    
    patients = [
        Patient(
            full_name="Rahim Ahmed",
            phone="01712345678",
            email="rahim@example.com",
            age=35,
            gender="Male",
            notes="Regular patient"
        ),
        Patient(
            full_name="Fatima Khan",
            phone="01712345679",
            email="fatima@example.com",
            age=28,
            gender="Female"
        ),
        Patient(
            full_name="Ahmed Hassan",
            phone="01712345680",
            email="ahmed@example.com",
            age=45,
            gender="Male"
        )
    ]
    
    for patient in patients:
        db.add(patient)
    db.commit()
    print(f"Seeded {len(patients)} sample patients")


def seed_sample_appointments(db: Session):
    existing = db.query(Appointment).first()
    if existing:
        return
    
    patients = db.query(Patient).all()
    if not patients:
        return
    
    tomorrow = datetime.now() + timedelta(days=1)
    while tomorrow.weekday() == 4:
        tomorrow += timedelta(days=1)
    
    appointments = [
        Appointment(
            patient_id=patients[0].id,
            service_type="Dental Checkup",
            appointment_date=tomorrow,
            appointment_time="10:00",
            status="booked",
            reason="Regular checkup"
        ),
        Appointment(
            patient_id=patients[1].id,
            service_type="Teeth Cleaning",
            appointment_date=tomorrow,
            appointment_time="14:00",
            status="booked",
            reason="Routine cleaning"
        ),
        Appointment(
            patient_id=patients[2].id,
            service_type="Root Canal",
            appointment_date=tomorrow + timedelta(days=2),
            appointment_time="11:00",
            status="booked",
            reason="Tooth pain"
        )
    ]
    
    for appointment in appointments:
        db.add(appointment)
    db.commit()
    print(f"Seeded {len(appointments)} sample appointments")


def seed_all():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_clinic_settings(db)
        seed_faqs(db)
        seed_sample_patients(db)
        seed_sample_appointments(db)
        print("Database seeding completed!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
