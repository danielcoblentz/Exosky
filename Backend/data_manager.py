import pandas as pd
from pathlib import Path
from astroquery.gaia import Gaia
import numpy as np

def load_data(): # stripping whitespace from the CSV file to worki with data
    data_file_path = Path('C:/Users/dan/Exosky-1/Backend/data/exoplanet_data.csv')
    df = pd.read_csv(data_file_path, skiprows=96, low_memory=False)
    df.columns = df.columns.str.strip()
    df['pl_name'] = df['pl_name'].str.strip()
    print("Data loaded successfully!")
    print(f"Columns after stripping whitespace: {df.columns.tolist()}")
    return df


# query the unique names for the dropdown menu for users to select
def get_exoplanet_names(df):
    exoplanet_names = df['pl_name'].dropna().unique().tolist()
    print(f"Found {len(exoplanet_names)} exoplanets.")
    return exoplanet_names
# returns coordinates
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
import numpy as np

def get_nearby_stars(ra, dec, radius=1.0):
    query = f"""
    SELECT TOP 1000 ra, dec, phot_g_mean_mag as brightness, bp_rp as color_index, parallax
    FROM gaiadr3.gaia_source
    WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', {ra}, {dec}, {radius}))=1
    AND phot_g_mean_mag <= 15  -- Limiting to reasonably bright stars for visibility
    """
    print(f"Querying nearby stars for RA: {ra}, Dec: {dec}, within radius {radius} degrees.")
    job = Gaia.launch_job_async(query)
    results = job.get_results()

    if results is None or len(results) == 0:
        print(f"No stars found near RA: {ra}, Dec: {dec}.")
        return []  # Return an empty list if no stars are found
    else:
        print(f"Found {len(results)} nearby stars.")

    #  handle masked or missing values for color_index and parallax
    stars_data = [
        {
            'ra': float(star['ra']),
            'dec': float(star['dec']),
            'brightness': float(star['brightness']),
            'color_index': float(star['color_index']) if not np.ma.is_masked(star['color_index']) else None,  # handle masked color_index
            'parallax': float(star['parallax']) if not np.ma.is_masked(star['parallax']) else None  # handle masked parallax
        }
        for star in results
    ]
    return stars_data




# Test function to ensure th eprogram is working as indented
'''if __name__ == "__main__":
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
