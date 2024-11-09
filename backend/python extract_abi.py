import json
import os

def extract_and_save_abi():
    try:
        # Path to the compiled contract JSON (adjust the path as needed)
        build_path = "build/contracts/BookStore.json"
        
        # Path where you want to save the ABI
        abi_output_path = "backend/BookStoreABI.json"
        
        # Read the compiled contract JSON
        with open(build_path, 'r') as file:
            contract_json = json.load(file)
            
        # Extract ONLY the ABI portion
        if 'abi' not in contract_json:
            raise KeyError("ABI not found in contract JSON")
            
        abi = contract_json['abi']
        
        # Save ONLY the ABI to a new file
        with open(abi_output_path, 'w') as file:
            json.dump(abi, file, indent=2)
            
        print(f"ABI successfully extracted and saved to {abi_output_path}")
        
        # Print the size comparison for verification
        original_size = os.path.getsize(build_path)
        abi_size = os.path.getsize(abi_output_path)
        print(f"Original contract file size: {original_size/1024:.2f} KB")
        print(f"Extracted ABI file size: {abi_size/1024:.2f} KB")
        
    except FileNotFoundError:
        print("Error: Could not find the compiled contract JSON file.")
        print("Make sure you have compiled your contract using 'truffle compile' first.")
    except KeyError as e:
        print(f"Error: {str(e)}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    extract_and_save_abi()