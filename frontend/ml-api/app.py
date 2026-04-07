from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

# Dummy dataset
data = pd.DataFrame({
    "budget": [100, 200, 150, 300],
    "votes": [1000, 2000, 1500, 3000],
    "rating": [6.5, 7.5, 7.0, 8.5]
})

X = data[["budget", "votes"]]
y = data["rating"]

model = LinearRegression()
model.fit(X, y)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    prediction = model.predict([[data["budget"], data["votes"]]])

    return jsonify({
        "predicted_rating": round(float(prediction[0]), 2)
    })

if __name__ == "__main__":
    app.run(port=6000)