import pandas as pd
import json

DIR = "" # 로그 파일의 위치
file = open(DIR, 'r')

logList = []


while True:
    data = file.readline()
    if not data:
        break
    data = (data.split())[3]
    data = json.loads(data)
    logList.append(data)


allLogs = pd.DataFrame(logList)
allLogs.to_excel('purchaseLog.xlsx')
file.close()

