import json

def debug_json():
    path = '/Users/rafaelalmeida/lifetrek-mirror/linkedin_mass_results.json'
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            
        print(f"Type of data: {type(data)}")
        if isinstance(data, list):
            print(f"Length of list: {len(data)}")
            if len(data) > 0:
                print(f"First item keys: {data[0].keys()}")
                
        # Count total "linkedinUrl" via string just to be sure
        with open(path, 'r') as f:
            content = f.read()
            print(f"Occurrences of 'linkedinUrl': {content.count('linkedinUrl')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_json()
