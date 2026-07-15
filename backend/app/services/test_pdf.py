from app.services.pdf_report_service import generate_pdf_report

# Pass a dictionary, not a string
sample_data = {
    "patient_name": "John Doe",
    "diagnosis": "Hypertension",
    "notes": "Patient advised to reduce salt intake and exercise regularly."
}

# Call the PDF generator
generate_pdf_report("Medical Report", sample_data)

print("✅ PDF generated successfully. Check the output file (report.pdf).")
