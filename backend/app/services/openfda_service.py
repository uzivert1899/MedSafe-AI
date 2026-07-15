import requests

OPENFDA_BASE_URL = "https://api.fda.gov/drug/label.json"

def get_medicine_info(medicine_name: str):
    try:
        name_quoted = medicine_name.strip().replace(" ", "+")
        search_query = f'openfda.generic_name:"{name_quoted}"+OR+openfda.brand_name:"{name_quoted}"'
        url = f"{OPENFDA_BASE_URL}?search={search_query}&limit=1"

        response = requests.get(url, timeout=10)

        if response.status_code != 200:
            return {"error": f"Medicine '{medicine_name}' not found in FDA database."}

        data = response.json()
        result = data["results"][0]

        return {
            "name": medicine_name,
            "warnings": result.get("warnings", ["No warnings available"])[0][:300] if result.get("warnings") else "No warnings available",
            "indications": result.get("indications_and_usage", ["No indications available"])[0][:300] if result.get("indications_and_usage") else "No indications available",
            "side_effects": result.get("adverse_reactions", ["No side effects available"])[0][:300] if result.get("adverse_reactions") else "No side effects available",
        }

    except Exception as e:
        return {"error": str(e)}


def get_multiple_medicines(medicines: list):
    results = {}
    for medicine in medicines:
        results[medicine] = get_medicine_info(medicine.strip())
    return results