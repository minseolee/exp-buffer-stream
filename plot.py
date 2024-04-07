import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# CSV 파일 읽기
copy_data = pd.read_csv('./exp-datas/copy_capacity_256.csv', header=None, names=['quantity', 'eachSize', 'fileType', 'totalSize', 'eachSize2', 'totalSize2', 'runTime', 'totalIter', 'minCPU', 'maxCPU', 'avgCPU', 'minMEM', 'maxMEM', 'avgMEM'], usecols=['eachSize', 'runTime'])
stream_data = pd.read_csv('./exp-datas/stream_capacity_256.csv', header=None, names=['quantity', 'eachSize', 'fileType', 'totalSize', 'eachSize2', 'totalSize2', 'runTime', 'totalIter', 'minCPU', 'maxCPU', 'avgCPU', 'minMEM', 'maxMEM', 'avgMEM'], usecols=['eachSize', 'runTime'])

# 같은 eachSize에 대한 평균 runTime 계산
copy_mean = copy_data.groupby('eachSize')['runTime'].mean().reset_index()
stream_mean = stream_data.groupby('eachSize')['runTime'].mean().reset_index()

# 그래프 그리기
fig, ax = plt.subplots(figsize=(8, 25))

ax.plot(copy_mean['eachSize'], copy_mean['runTime'], marker='o', label='copy')
ax.plot(stream_mean['eachSize'], stream_mean['runTime'], marker='s', label='stream')

ax.set_xlabel('log2(eachSize)')
ax.set_ylabel('runTime')
ax.set_title('Performance Comparison')
ax.legend()

plt.show()