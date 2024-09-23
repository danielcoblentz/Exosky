import pandas as pd
from pathlib import Path
from astroquery.gaia import Gaia
import numpy as np

def load_data():
    data_file_path = Path('C:/Users/dan/Exosky-1/Backend/data/exoplanet_data.csv')
    df = pd.read_csv(data_file_path, skiprows=96, low_memory=False)
    df.columns = df.columns.str.strip()
    df['pl_name'] = df['pl_name'].str.strip()
    print("Data loaded successfully!")
    print(f"Columns after stripping whitespace: {df.columns.tolist()}")
    return df

def get_exoplanet_names(df):
    exoplanet_names = df['pl_name'].dropna().unique().tolist()
    print(f"Found {len(exoplanet_names)} exoplanets.")
    return exoplanet_names

def get_exoplanet_coordinates(planet_name, df):
    planet_name = planet_name.strip()
    print(f"Searching for exoplanet: {planet_name}")
    planet_data = df[df['pl_name'] == planet_name]
    
    if not planet_data.empty:
        ra = planet_data['ra'].values[0]
        dec = planet_data['dec'].values[0]
        print(f"Found coordinates for {planet_name}: RA = {ra}, Dec = {dec}")
        return ra, dec
    else:
        print(f"exoplanet {planet_name} not found.")
        return None, None

# query nearby stars from the Gaia DR3 catalog based on the exoplanet's coordinates
def get_nearby_stars(ra, dec, radius=0.1):
    query = f"""
    SELECT TOP 1000 *
    FROM gaiadr3.gaia_source
    WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {dec}, {radius}))=1
    """
    print(f"Querying nearby stars for RA: {ra}, Dec: {dec}, within radius {radius} degrees.")
    job = Gaia.launch_job_async(query)
    results = job.get_results()

    if len(results) == 0:
        print(f"no stars found near RA: {ra}, Dec: {dec}.")
        return []  # return an empty list if no stars are found
    else:
        print(f"found {len(results)} nearby stars.")
    
    # return the RA and Dec of the found stars
    stars_data = [{'ra': row['ra'], 'dec': row['dec']} for row in results]
    return stars_data

'''# Test function
if __name__ == "__main__":
    df = load_data()

    # Test exoplanet name retrieval
    exoplanet_names = get_exoplanet_names(df)
    print(f"First 5 exoplanet names: {exoplanet_names[:5]}")

    # Test exoplanet coordinates retrieval
    exoplanet_name = "14 Her b"  # Replace with any planet name you want to test
    ra, dec = get_exoplanet_coordinates(exoplanet_name, df)

    if ra is not None and dec is not None:
        # Test querying nearby stars of the specified exoplanet
        nearby_stars = get_nearby_stars(ra, dec)
        print(f"Total nearby stars found: {len(nearby_stars)}")
        print("Star coordinates (RA, Dec):", nearby_stars)  # Print the star coordinates
    else:
        print(f"Exoplanet {exoplanet_name} not found in the dataset.")'''
