import json
import os
import random
import string

def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_json_file(file_path, size_in_bytes):
    data = {
        "random_data": generate_random_string(size_in_bytes)
    }
    with open(file_path, 'w') as file:
        json.dump(data, file)

if __name__ == "__main__":
    total_files = 1000
    target_file_size_mb = 2
    target_file_size_bytes = target_file_size_mb * 1024 * 1024  # MB to bytes

    for i in range(1, total_files + 1):
        file_name = f"data_{i}.json"
        file_path = os.path.join("json_files", file_name)
        generate_json_file(file_path, target_file_size_bytes)
        print(f"Generated: {file_path}")

