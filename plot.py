import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

names = ['quantity', 'eachSize', 'fileType', 'totalSize', 'eachSize2', 'totalSize2', 'runTime', 'totalIter', 'minCPU', 'maxCPU', 'avgCPU', 'minMEM', 'maxMEM', 'avgMEM']
x = 'eachSize'
y = 'avgCPU'
usecols = [x, y]

copy_path = 'exp-results/refine/copy_size_json.csv'
stream_path = 'exp-results/refine/stream_size_json.csv'

log2 = True


# CSV 파일 읽기
copy_data = pd.read_csv(copy_path, header=None, names=names, usecols=usecols)
stream_data = pd.read_csv(stream_path, header=None, names=names, usecols=usecols)

# 같은 quantity에 대한 평균 runTime 계산
copy_mean = copy_data.groupby(x)[y].mean().reset_index()
stream_mean = stream_data.groupby(x)[y].mean().reset_index()

# 그래프 그리기
fig, ax = plt.subplots(figsize=(6, 8))

ax.plot(np.log2(copy_mean[x]), copy_mean[y], marker='o', label='copy')
ax.plot(np.log2(copy_mean[x]), stream_mean[y], marker='s', label='stream')

ax.set_xlabel('Size log2 increase .json')
ax.set_ylabel('CPU usage')
ax.set_title('Average CPU Usage Comparison')
ax.legend()

plt.show()