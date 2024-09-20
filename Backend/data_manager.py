import pandas as pd
from pathlib import Path
from astroquery.gaia import Gaia
import numpy as np

def load_data():
    # Path to the data file
    data_file_path = Path('C:/Users/dan/Exosky-1/Backend/data/exoplanet_data.csv')
    
    # Load the dataset and skip the first 96 rows as they are just comments
    df = pd.read_csv(data_file_path, skiprows=96, low_memory=False)
    
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    df['pl_name'] = df['pl_name'].str.strip() 
    print("Data loaded successfully!")
    print(f"Columns after stripping whitespace: {df.columns.tolist()}")
    
    return df

def get_exoplanet_names(df):
    # Return the unique names from the 'pl_name' column
    return df['pl_name'].dropna().unique().tolist()

def get_exoplanet_coordinates(planet_name, df):
    planet_name = planet_name.strip()  # Remove any white space or trailing chars
    print(f"Searching for exoplanet: {planet_name}")
    planet_data = df[df['pl_name'] == planet_name]
    if not planet_data.empty:
        ra = planet_data['ra'].values[0]
        dec = planet_data['dec'].values[0]
        return ra, dec
    else:
        return None, None
# Convert RA/Dec to Cartesian coordinates relative to an exoplanet
def convert_to_cartesian(ra, dec):
    # Convert RA and Dec to radians
    ra_rad = np.deg2rad(ra)
    dec_rad = np.deg2rad(dec)

    # Convert to Cartesian coordinates
    x = np.cos(dec_rad) * np.cos(ra_rad)
    y = np.cos(dec_rad) * np.sin(ra_rad)
    z = np.sin(dec_rad)

    return x, y, z

# Function to convert stars' RA/Dec relative to the exoplanet
def get_stars_relative_to_exoplanet(planet_ra, planet_dec, stars_ra, stars_dec):
    planet_x, planet_y, planet_z = convert_to_cartesian(planet_ra, planet_dec)

    relative_positions = []
    for star_ra, star_dec in zip(stars_ra, stars_dec):
        star_x, star_y, star_z = convert_to_cartesian(star_ra, star_dec)

        # Calculate relative position of the star from the exoplanet
        rel_x = star_x - planet_x
        rel_y = star_y - planet_y
        rel_z = star_z - planet_z

        print(f"Relative position of star (RA: {star_ra}, Dec: {star_dec}): x={rel_x}, y={rel_y}, z={rel_z}")
        relative_positions.append((rel_x, rel_y, rel_z))

    return relative_positions