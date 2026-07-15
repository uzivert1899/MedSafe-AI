from backend.app.services.gemini_service import generate_health_summary

summary = generate_health_summary(
    {
        "hemoglobin": "11.5",
        "creatinine": "1.8",
        "blood_sugar": "95"
    },
    [
        "Elevated creatinine detected. Possible kidney risk.",
        "Low hemoglobin detected. Possible anemia risk."
    ]
)

print(summary)