import json
import os

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Load JSON files
    with open(os.path.join(base_dir, "testnet_cohort.json"), "r", encoding="utf-8") as f:
        testnet_data = json.load(f)
        
    with open(os.path.join(base_dir, "mainnet_cohort.json"), "r", encoding="utf-8") as f:
        mainnet_data = json.load(f)
        
    # 1. Update components/constants.ts
    constants_path = os.path.join(base_dir, "components", "constants.ts")
    
    # Read the existing constants file content
    with open(constants_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # We want to replace everything from "export const ONBOARDED_COHORT" to the end of the file
    # Let's locate "export const ONBOARDED_COHORT"
    idx = content.find("export const ONBOARDED_COHORT")
    if idx == -1:
        print("Error: Could not find ONBOARDED_COHORT in constants.ts")
        return
        
    header = content[:idx]
    
    # Format testnet cohort
    testnet_ts = "export const ONBOARDED_COHORT: OnboardedUser[] = [\n"
    for i, u in enumerate(testnet_data):
        row = f'  {{ name: "{u["name"]}", email: "{u["email"]}", address: "{u["address"]}", corridor: "{u["corridor"]}", uiRating: {u["uiRating"]}, speedRating: {u["speedRating"]}, costRating: {u["costRating"]}, comment: "{u["comment"]}", txHash: "{u["txHash"]}", dateOnboarded: "{u["dateOnboarded"]}" }}'
        testnet_ts += row
        if i < len(testnet_data) - 1:
            testnet_ts += ",\n"
        else:
            testnet_ts += "\n"
    testnet_ts += "];\n\n"
    
    # Format mainnet cohort
    mainnet_ts = "export const MAINNET_COHORT: OnboardedUser[] = [\n"
    for i, u in enumerate(mainnet_data):
        row = f'  {{ name: "{u["name"]}", email: "{u["email"]}", address: "{u["address"]}", corridor: "{u["corridor"]}", uiRating: {u["uiRating"]}, speedRating: {u["speedRating"]}, costRating: {u["costRating"]}, comment: "{u["comment"]}", txHash: "{u["txHash"]}", dateOnboarded: "{u["dateOnboarded"]}" }}'
        mainnet_ts += row
        if i < len(mainnet_data) - 1:
            mainnet_ts += ",\n"
        else:
            mainnet_ts += "\n"
    mainnet_ts += "];\n"
    
    new_constants_content = header + testnet_ts + mainnet_ts
    
    with open(constants_path, "w", encoding="utf-8") as f:
        f.write(new_constants_content)
    print("Successfully updated components/constants.ts")
    
    # 2. Update docs/user-onboarding-feedback.csv
    csv_header = "Full Name,Email Address,Stellar Wallet Address,Destination Corridor,UI Rating,Speed Rating,Cost Rating,Review Comment,Transaction Hash,Date Onboarded\n"
    
    testnet_csv_path = os.path.join(base_dir, "docs", "user-onboarding-feedback.csv")
    with open(testnet_csv_path, "w", encoding="utf-8", newline="") as f:
        f.write(csv_header)
        for u in testnet_data:
            # Map corridor back to descriptive name for Testnet CSV compatibility
            corr_map = {"INR": "India", "EUR": "Europe", "PHP": "Philippines"}
            corridor_desc = corr_map.get(u["corridor"], u["corridor"])
            row = f'"{u["name"]}","{u["email"]}","{u["address"]}","{corridor_desc}",{u["uiRating"]},{u["speedRating"]},{u["costRating"]},"{u["comment"]}","{u["txHash"]}","{u["dateOnboarded"]}"\n'
            f.write(row)
    print("Successfully updated docs/user-onboarding-feedback.csv")
    
    # 3. Update docs/mainnet-user-onboarding.csv
    mainnet_csv_path = os.path.join(base_dir, "docs", "mainnet-user-onboarding.csv")
    with open(mainnet_csv_path, "w", encoding="utf-8", newline="") as f:
        f.write(csv_header)
        for u in mainnet_data:
            # Mainnet uses INR, EUR, PHP
            row = f'"{u["name"]}","{u["email"]}","{u["address"]}","{u["corridor"]}",{u["uiRating"]},{u["speedRating"]},{u["costRating"]},"{u["comment"]}","{u["txHash"]}","{u["dateOnboarded"]}"\n'
            f.write(row)
    print("Successfully updated docs/mainnet-user-onboarding.csv")

if __name__ == "__main__":
    main()
