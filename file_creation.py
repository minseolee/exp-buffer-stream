import json
import os
import random
import string
import zipfile
import hashlib
import base64
import shutil
import subprocess


def generate_random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_json_file(file_path, size_in_bytes):
    data = {
        "random_data": generate_random_string(size_in_bytes)
    }
    with open(file_path, 'w') as file:
        json.dump(data, file)


def create_zip(source_dir, zip_filename):
    with zipfile.ZipFile(zip_filename, 'w') as zipf:
        for root, dirs, files in os.walk(source_dir):
            for file in files:
                zipf.write(os.path.join(root, file))


def hash_file(file_path):
    # Open the file in binary mode
    with open(file_path, 'rb') as file:
        # Read the entire file
        file_contents = file.read()

    # Calculate the SHA-1 hash of the file contents
    return hashlib.sha1(file_contents).hexdigest()


def get_file_size(file_path):
    return os.stat(file_path)


def file_creation(to_total_files, to_target_file_size_mb):
    total_files = to_total_files
    target_file_size_mb = to_target_file_size_mb
    target_file_size_bytes = target_file_size_mb * 1024 * 1024  # MB to bytes

    if os.path.exists("json_files"): shutil.rmtree("json_files")
    os.makedirs("json_files")

    for i in range(1, total_files + 1):
        file_name = f"data_{i}.json"
        file_path = os.path.join("json_files", file_name)
        generate_json_file(file_path, target_file_size_bytes)
        print(f"Generated: {file_path}")


if __name__ == "__main__":
    for i in range(1, 10):
        file_creation(to_total_files=i, to_target_file_size_mb=2)
        process = subprocess.Popen(["node", "index.js"])
        process.wait()
        print(i, "done")

    # create_zip("./json_files", "uuid.zip")
    # print(get_file_size("uuid.zip"))
    # print(hash_file("uuid.zip"))

