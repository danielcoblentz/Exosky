from flask import Flask, jsonify
from data_manager import load_data, get_exoplanet_names  # load the necessary libraries for the data import
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# Load the dataset
df = load_data()

@app.route('/api/exoplanets/names', methods=['GET'])
def exoplanet_names():
    try:
        # fetch exoplanet names from the loaded data in data_manager.py
        names = get_exoplanet_names(df)
        return jsonify(names)
    except Exception as e:
        return jsonify({"error": "Failed to fetch exoplanet names", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
