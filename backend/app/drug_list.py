"""
Curated list of ~200 common generic drug names for OpenFDA label indexing.
Organized by therapeutic category for maintainability.
Names chosen to maximize OpenFDA match rate (generic names, common spellings).
"""

DRUG_LIST = [
    # Cardiovascular
    "lisinopril", "enalapril", "ramipril", "losartan", "valsartan", "amlodipine",
    "metoprolol", "atenolol", "carvedilol", "propranolol", "furosemide",
    "hydrochlorothiazide", "spironolactone", "digoxin", "warfarin", "clopidogrel",
    "atorvastatin", "simvastatin", "rosuvastatin", "pravastatin", "diltiazem",
    "verapamil", "nitroglycerin", "isosorbide mononitrate", "hydralazine",
    "amiodarone", "apixaban", "rivaroxaban", "dabigatran", "aspirin",

    # Diabetes / Endocrine
    "metformin", "glipizide", "glyburide", "glimepiride", "insulin glargine",
    "insulin lispro", "sitagliptin", "empagliflozin", "dapagliflozin",
    "liraglutide", "semaglutide", "pioglitazone", "levothyroxine",
    "methimazole", "prednisone", "hydrocortisone", "dexamethasone",

    # Pain / NSAIDs / Opioids
    "ibuprofen", "naproxen", "diclofenac", "celecoxib", "acetaminophen",
    "tramadol", "oxycodone", "hydrocodone", "morphine", "fentanyl",
    "gabapentin", "pregabalin", "meloxicam", "indomethacin", "ketorolac",

    # Antibiotics
    "amoxicillin", "azithromycin", "ciprofloxacin", "levofloxacin",
    "doxycycline", "cephalexin", "clindamycin", "metronidazole",
    "trimethoprim sulfamethoxazole", "nitrofurantoin", "vancomycin",
    "penicillin", "clarithromycin", "erythromycin", "ceftriaxone",

    # Mental Health / Neuro
    "sertraline", "fluoxetine", "citalopram", "escitalopram", "paroxetine",
    "venlafaxine", "duloxetine", "bupropion", "mirtazapine", "trazodone",
    "alprazolam", "lorazepam", "diazepam", "clonazepam", "quetiapine",
    "risperidone", "olanzapine", "aripiprazole", "lithium", "valproic acid",
    "lamotrigine", "carbamazepine", "phenytoin", "levetiracetam", "topiramate",
    "methylphenidate", "amphetamine dextroamphetamine", "donepezil",

    # GI
    "omeprazole", "pantoprazole", "esomeprazole", "ranitidine", "famotidine",
    "metoclopramide", "ondansetron", "loperamide", "docusate", "polyethylene glycol",
    "sucralfate", "mesalamine", "lactulose", "bisacodyl",

    # Respiratory
    "albuterol", "fluticasone", "budesonide", "montelukast", "tiotropium",
    "ipratropium", "theophylline", "cetirizine", "loratadine", "diphenhydramine",
    "guaifenesin", "dextromethorphan", "pseudoephedrine",

    # Renal / Electrolyte
    "potassium chloride", "sodium bicarbonate", "calcium carbonate",
    "sevelamer", "cinacalcet", "epoetin alfa",

    # Anticoagulants / Hematology
    "enoxaparin", "heparin", "iron sulfate", "folic acid", "vitamin b12",

    # Thyroid / Hormones
    "liothyronine", "estradiol", "progesterone", "testosterone",
    "medroxyprogesterone", "finasteride", "tamsulosin",

    # Immunosuppressants / Autoimmune
    "methotrexate", "hydroxychloroquine", "azathioprine", "cyclosporine",
    "tacrolimus", "mycophenolate", "sulfasalazine", "adalimumab",

    # Antivirals / Antifungals
    "acyclovir", "valacyclovir", "oseltamivir", "fluconazole", "nystatin",
    "terbinafine",

    # Misc / Other common
    "allopurinol", "colchicine", "tizanidine", "cyclobenzaprine", "baclofen",
    "sildenafil", "tadalafil", "isotretinoin", "tretinoin", "finasteride",
    "latanoprost", "timolol", "ondansetron", "promethazine", "hydroxyzine",
    "bupropion", "varenicline", "naloxone", "naltrexone", "buprenorphine",
    "methadone", "phenobarbital", "ursodiol", "rifampin", "isoniazid",
    "pyrazinamide", "ethambutol", "leflunomide", "etanercept", "infliximab",
    "interferon beta", "glatiramer", "riluzole", "memantine", "rivastigmine",
]

# Deduplicate while preserving order
DRUG_LIST = list(dict.fromkeys(DRUG_LIST))