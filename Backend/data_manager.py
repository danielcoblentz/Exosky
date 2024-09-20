import pandas as pd
from pathlib import Path
from astroquery.gaia import Gaia
import numpy as np

def load_data():
    # Path to the data file
    data_file_path = Path('C:/Users/dan/Exosky-1/Backend/data/exoplanet_data.csv')
    
    # Load the dataset and skip the first 96 rows as they are just comments
    df = pd.read_csv(data_file_path, skiprows=96, low_memory=False)
    
    # Strip whitespace from column names (clean data before using it)
    df.columns = df.columns.str.strip()
    df['pl_name'] = df['pl_name'].str.strip() 
    print("Data loaded successfully!")
    print(f"Columns after stripping whitespace: {df.columns.tolist()}")
    
    return df

def get_exoplanet_names(df):
    # return the unique names from the 'pl_name' column in the csv file
    exoplanet_names = df['pl_name'].dropna().unique().tolist()
    print(f"Found {len(exoplanet_names)} exoplanets.")
    return exoplanet_names

def get_exoplanet_coordinates(planet_name, df):
    planet_name = planet_name.strip()  # Remove any white space or trailing chars
    print(f"Searching for exoplanet: {planet_name}")
    planet_data = df[df['pl_name'] == planet_name]
    if not planet_data.empty:
        ra = planet_data['ra'].values[0]
        dec = planet_data['dec'].values[0]
        print(f"Found coordinates for {planet_name}: RA = {ra}, Dec = {dec}")
        return ra, dec
    else:
        print(f"Exoplanet {planet_name} not found.")
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

        # Calculate relative position of the star from the exoplanet position
        rel_x = star_x - planet_x
        rel_y = star_y - planet_y
        rel_z = star_z - planet_z

        print(f"relative position of star (RA: {star_ra}, Dec: {star_dec}): x={rel_x}, y={rel_y}, z={rel_z}")
        relative_positions.append((rel_x, rel_y, rel_z))

    return relative_positions

# Query(astro query) nearby stars from the Gaia DR3 catalog based on the exoplanet's coordinates
def get_nearby_stars(ra, dec, radius=0.1):
    query = f"""
    SELECT TOP 1000 *
    FROM gaiadr3.gaia_source
    WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {dec}, {radius}))=1
    """
    print(f"Querying nearby stars for RA: {ra}, Dec: {dec}, within radius {radius} degrees.")
    job = Gaia.launch_job_async(query)
    results = job.get_results()

    # check if stars were found near the planet
    if len(results) == 0:
        print(f"no stars found near RA: {ra}, Dec: {dec}.")
    else:
        print(f"found {len(results)} nearby stars.")

    # Get the stars' RA and Dec
    stars_ra = results['ra']
    stars_dec = results['dec']

    # Convert the stars' RA and Dec relative to the exoplanet's RA and Dec
    relative_positions = get_stars_relative_to_exoplanet(ra, dec, stars_ra, stars_dec)

    return relative_positions

###################################################
# test function should return all of the exoplanets in the data set after rows 97 put in sample data to test, search for the first planet then if found return cordinates then query for nearby stars, if stars are found it should return the number of stars found and their cordinates on hte last line
# below are sample values to only see the first 5 hardacoded exoplanets
if __name__ == "__main__":
    df = load_data()

    # test exoplanet name retrieval
    exoplanet_names = get_exoplanet_names(df)
    print(f"First 5 exoplanet names: {exoplanet_names[:5]}")

    # test exoplanet coordinates retrieval
    exoplanet_name = "14 Her b"  #test case can replace with any planet to see the relative data associated with it 
    ra, dec = get_exoplanet_coordinates(exoplanet_name, df)

    if ra and dec:
        # test querying nearby stars of that specified exoplanet (14 Her b in this case)
        nearby_stars = get_nearby_stars(ra, dec)
        print(f"total nearby stars found: {len(nearby_stars)}")
    else:
        print(f"exoplanet {exoplanet_name} not found in dataset.")# case of planet not found in the dataset
