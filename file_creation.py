import json
import os
import random
import string
import shutil
import subprocess
import math


SIZE_INCREMENT = 128
QTT_INCREMENT = 1024
ITERATION = 3

TOTAL = math.floor(((math.log2(QTT_INCREMENT) + math.log2(SIZE_INCREMENT)) * ITERATION) * 2)

current = 1

def file_deletion():
    shutil.rmtree("target_files")


def json_file_creation(to_total_files, to_target_file_size_mb):
    total_files = to_total_files
    target_file_size_mb = to_target_file_size_mb
    target_file_size_bytes = target_file_size_mb * 1024 * 1024  # MB to bytes

    if os.path.exists("target_files"): shutil.rmtree("target_files")
    os.makedirs("target_files")

    for i in range(1, total_files + 1):
        file_name = f"data_{i}.json"
        file_path = os.path.join("target_files", file_name)
        data = {
            "random_data": ''.join(random.choices(string.ascii_letters + string.digits, k=target_file_size_bytes))
        }
        with open(file_path, 'w') as file:
            json.dump(data, file)
        print(f"Generated: {file_path}")


def binary_file_creation(to_total_files, to_target_file_size_mb):
    total_files = to_total_files
    target_file_size_mb = to_target_file_size_mb
    target_file_size_bytes = target_file_size_mb * 1024 * 1024

    if os.path.exists("target_files"): shutil.rmtree("target_files")
    os.makedirs("target_files")

    for i in range(1, total_files + 1):
        file_name = f"data_{i}.bin"
        file_path = os.path.join("target_files", file_name)
        with open(file_path, 'wb') as file:
            file.write(os.urandom(target_file_size_bytes))
        print(f"Generated: {file_path}")


if __name__ == "__main__":
    # 랜덤스트링: 크기 고정, 개수 증가
    i = 1
    while i <= QTT_INCREMENT:
        for _ in range(0, ITERATION):
            json_file_creation(to_total_files=i, to_target_file_size_mb=8)
            env = os.environ.copy()
            env["EACHSIZE"] = "8"
            env["FILETYPE"] = ".json"
            process = subprocess.Popen(["node", "index.js"], env=env)
            process.wait()
            print(i, f"{current}/{TOTAL}", f"{round(current / TOTAL, 2)}%")
            file_deletion()
            current += 1
        i *= 2

    # 랜덤스트링: 개수 고정, 크기 증가
    i = 1
    while i <= SIZE_INCREMENT:
        for _ in range(0, ITERATION):
            json_file_creation(to_total_files=128, to_target_file_size_mb=i)
            env = os.environ.copy()
            env["EACHSIZE"] = str(i)
            env["FILETYPE"] = ".json"
            process = subprocess.Popen(["node", "index.js"], env=env)
            process.wait()
            print(i, f"{current}/{TOTAL}", f"{round(current / TOTAL, 2)}%")
            file_deletion()
            current += 1
        i *= 2

    # 바이너리: 크기 고정, 개수 증가
    i = 1
    while i <= QTT_INCREMENT:
        for _ in range(0, ITERATION):
            binary_file_creation(to_total_files=i, to_target_file_size_mb=8)
            env = os.environ.copy()
            env["EACHSIZE"] = "8"
            env["FILETYPE"] = ".bin"
            process = subprocess.Popen(["node", "index.js"], env=env)
            process.wait()
            print(i, f"{current}/{TOTAL}", f"{round(current / TOTAL, 2)}%")
            file_deletion()
            current += 1
        i *= 2

    # 바이너리: 개수 고정, 크기 증가
    i = 1
    while i <= SIZE_INCREMENT:
        for _ in range(0, ITERATION):
            binary_file_creation(to_total_files=128, to_target_file_size_mb=i)
            env = os.environ.copy()
            env["EACHSIZE"] = str(i)
            env["FILETYPE"] = ".bin"
            process = subprocess.Popen(["node", "index.js"], env=env)
            process.wait()
            print(i, f"{current}/{TOTAL}", f"{round(current / TOTAL, 2)}%")
            file_deletion()
            current += 1
        i *= 2

