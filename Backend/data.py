from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the dataset
df = pd.read_csv('C:\Users\dan\Exosky-1\Backend\data\exoplanet_data.csv')

@app.route('/api/exoplanets', methods=['GET'])
def get_exoplanets():
    exoplanet_names = df['pl_name'].dropna().unique().tolist()
    return jsonify(exoplanet_names)

if __name__ == '__main__':
    app.run(debug=True)
