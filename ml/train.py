import pandas as pd
from sklearn.linear_model import LogisticRegression
import pickle

# Synthetic dataset (OK for hackathons)
data = {
    "fever": [1, 0, 1, 0, 1, 1, 0],
    "cough": [1, 1, 0, 0, 1, 0, 0],
    "chest_pain": [0, 0, 1, 0, 1, 1, 0],
    "breathlessness": [0, 0, 1, 0, 1, 1, 0],
    "severity": [3, 2, 8, 1, 9, 7, 1],
    "duration": [2, 1, 5, 1, 7, 6, 1],
    "age": [25, 30, 60, 20, 65, 55, 22],
    "risk": [0, 0, 2, 0, 2, 2, 0]
}

df = pd.DataFrame(data)

X = df.drop("risk", axis=1)
y = df["risk"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved as model.pkl")
