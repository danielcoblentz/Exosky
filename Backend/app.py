from flask import Flask, jsonify, request
from data_manager import load_data, get_exoplanet_names, get_exoplanet_coordinates, get_nearby_stars  # Import new functions
from flask_cors import CORS
import numpy as np

# initialize the Flask application
app = Flask(__name__)
CORS(app)

# load the dataset
df = load_data()

# endpoint to fetch exoplanet names
@app.route('/api/exoplanets/names', methods=['GET'])
def exoplanet_names():
    try:
        # get exoplanet names from the loaded data in data_manager.py file
        names = get_exoplanet_names(df)
        return jsonify(names)
    except Exception as e:
        return jsonify({"error": "cannot fetch exoplanet names", "message": str(e)}), 500

# endpoint to fetch exoplanet coordinates via name
@app.route('/api/exoplanets/coordinates', methods=['GET'])
def exoplanet_coordinates():
    try:
        planet_name = request.args.get('planet_name')  # get the planet name from the request query
        ra, dec = get_exoplanet_coordinates(planet_name, df)  # get the RA/Dec coordinates
        if ra and dec:
            return jsonify({'ra': ra, 'dec': dec})  # return the coordinates as JSON 
        else:
            return jsonify({'error': 'exoplanet not found in hte dataset!'}), 404  
    except Exception as e:
        return jsonify({"error": "failed to fetch exoplanet coordinates", "message": str(e)}), 500

# endpoint to fetch nearby stars using Gaia DR3 around an exoplanet's coordinates
@app.route('/api/exoplanets/stars', methods=['GET'])
def exoplanet_stars():
    try:
        planet_name = request.args.get('planet_name')  # get the planet name from the request query
        ra, dec = get_exoplanet_coordinates(planet_name, df)  # get the RA/Dec coordinates of the planet
        if ra and dec:
            stars = get_nearby_stars(ra, dec)  # query nearby stars from Gaia DR3

          
            stars_df = stars.to_pandas()

           
            stars_df = stars_df.replace({np.nan: None})
            print(stars_df.head())  

            return jsonify(stars_df.to_dict(orient='records')) 
        else:
            return jsonify({'error': 'exoplanet not found'}), 404 
    except Exception as e:
       
        print(f"Error fetching nearby stars: {e}")
        return jsonify({"error": "cannot fetch nearby stars", "message": str(e)}), 500
