RISK_RULES = {
    "hemoglobin": {
        "low": 13.0,
        "message_low": "Low hemoglobin detected. Possible anemia risk."
    },
    "creatinine": {
        "high": 1.3,
        "message_high": "Elevated creatinine detected. Possible kidney risk."
    },
    "blood_sugar": {
        "high": 140,
        "message_high": "High blood sugar detected. Possible diabetes risk."
    },
    "cholesterol": {
        "high": 200,
        "message_high": "High cholesterol detected. Possible cardiovascular risk."
    },
    "wbc": {
        "low": 4.0,
        "high": 11.0,
        "message_low": "Low WBC detected. Possible immune system concern.",
        "message_high": "High WBC detected. Possible infection or inflammation."
    },
    "platelets": {
        "low": 150,
        "high": 400,
        "message_low": "Low platelet count. Possible bleeding risk.",
        "message_high": "High platelet count. Possible clotting risk."
    },
    "sodium": {
        "low": 136,
        "high": 145,
        "message_low": "Low sodium detected. Possible hyponatremia.",
        "message_high": "High sodium detected. Possible hypernatremia."
    },
    "potassium": {
        "low": 3.5,
        "high": 5.0,
        "message_low": "Low potassium detected. Possible hypokalemia.",
        "message_high": "High potassium detected. Possible hyperkalemia."
    },
    "bilirubin": {
        "high": 1.2,
        "message_high": "High bilirubin detected. Possible liver concern."
    },
    "tsh": {
        "low": 0.4,
        "high": 4.0,
        "message_low": "Low TSH detected. Possible hyperthyroidism.",
        "message_high": "High TSH detected. Possible hypothyroidism."
    }
}

def analyze_risk(lab_values):
    risks = []

    for param, rules in RISK_RULES.items():
        value = lab_values.get(param)
        if value is None:
            continue

        try:
            val = float(value)
        except ValueError:
            continue

        if "high" in rules and val > rules["high"]:
            risks.append(rules["message_high"])
        elif "low" in rules and val < rules["low"]:
            risks.append(rules["message_low"])

    return risks