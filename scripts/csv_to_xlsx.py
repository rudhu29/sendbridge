import sys
import os

try:
    import pandas as pd
except ImportError:
    import subprocess
    print("Installing pandas and openpyxl for Excel generation...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])
    import pandas as pd

def clean_csv_file(csv_path):
    if not os.path.exists(csv_path):
        return None
        
    cleaned_lines = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        header = f.readline().strip()
        cleaned_lines.append(header.split(','))
        
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            # Split the CSV line manually to handle unquoted commas in comments.
            # A valid line has 10 fields: Name, Email, Address, Corridor, UI, Speed, Cost, Comment, TxHash, DateOnboarded.
            # We split by comma up to the Cost field (first 7 fields).
            parts_left = line.split(',', 7)
            if len(parts_left) < 8:
                continue
                
            # The last part contains "Comment,TxHash,DateOnboarded". We split from the right by the last two commas.
            right_part = parts_left[7]
            parts_right = right_part.rsplit(',', 2)
            if len(parts_right) < 3:
                continue
                
            comment = parts_right[0]
            tx_hash = parts_right[1]
            date_onboarded = parts_right[2]
            
            # Clean quotes if any
            comment = comment.strip('"')
            tx_hash = tx_hash.strip('"')
            date_onboarded = date_onboarded.strip('"')
            
            row = parts_left[:7] + [comment, tx_hash, date_onboarded]
            cleaned_lines.append(row)
            
    return cleaned_lines

def convert_csv_to_xlsx(csv_path, xlsx_path):
    print(f"Cleaning and converting {csv_path}...")
    rows = clean_csv_file(csv_path)
    if not rows:
        print(f"Error: {csv_path} could not be read.")
        return
        
    # Re-write the cleaned CSV to make the repository CSV standard-compliant
    import csv
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
        
    # Convert to Excel
    df = pd.DataFrame(rows[1:], columns=rows[0])
    df.to_excel(xlsx_path, index=False)
    print(f"Successfully created Excel file: {xlsx_path}")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    csv1 = os.path.join(base_dir, "docs", "user-onboarding-feedback.csv")
    xlsx1 = os.path.join(base_dir, "docs", "user-onboarding-feedback.xlsx")
    
    csv2 = os.path.join(base_dir, "docs", "mainnet-user-onboarding.csv")
    xlsx2 = os.path.join(base_dir, "docs", "mainnet-user-onboarding.xlsx")
    
    convert_csv_to_xlsx(csv1, xlsx1)
    convert_csv_to_xlsx(csv2, xlsx2)
