from flask import Flask, jsonify, request
from data_manager import load_data, get_exoplanet_names, get_exoplanet_coordinates, get_nearby_stars  # Import new functions
from flask_cors import CORS
import numpy as np

# initialize the Flask app
app = Flask(__name__)
CORS(app)

# load the dataset
df = load_data()

@app.route('/')
def home():
    return "Welcome to the API!"


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
    planet_name = request.args.get('planet_name')
    print(f"Received request for coordinates of: {planet_name}")  # Log the received planet name
    ra, dec = get_exoplanet_coordinates(planet_name, df)
    if ra is not None and dec is not None:
        return jsonify({'ra': ra, 'dec': dec})
    else:
        return jsonify({'error': 'exoplanet not found!'})

# endpoint to fetch nearby stars using Gaia DR3 around an exoplanet's coordinates
@app.route('/api/exoplanets/stars', methods=['GET'])
def exoplanet_stars():
    try:
        planet_name = request.args.get('planet_name')  # get the planet name from the request query
        ra, dec = get_exoplanet_coordinates(planet_name, df)  # get the RA/Dec coordinates of the planet
        if ra and dec:
            stars = get_nearby_stars(ra, dec)  # query nearby stars from Gaia DR3
            
            # Converting NumPy float32 types to Python float and pandas to_dict for JSON serialization
            stars_cleaned = []
            for star in stars:
                stars_cleaned.append({
                    'ra': float(star['ra']),
                    'dec': float(star['dec']),
                    'brightness': float(star['brightness']),
                    'color_index': float(star['color_index']) if star['color_index'] is not None else None,
                    'parallax': float(star['parallax']) if star['parallax'] is not None else None
                })
            
            return jsonify(stars_cleaned)  # directly return cleaned stars as JSON
        else:
            return jsonify({'error': 'exoplanet not found'}), 404
    except Exception as e:
        print(f"Error fetching nearby stars: {e}")
        return jsonify({"error": "cannot fetch nearby stars", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
