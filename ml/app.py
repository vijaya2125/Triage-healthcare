from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

with open("model.pkl", "rb") as f:
    model = pickle.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    features = [
        data["fever"],
        data["cough"],
        data["chest_pain"],
        data["breathlessness"],
        data["severity"],
        data["duration"],
        data["age"]
    ]

    prediction = model.predict([features])[0]

    return jsonify({
        "risk_level": int(prediction)
    })

if __name__ == "__main__":
    app.run(port=8000)
