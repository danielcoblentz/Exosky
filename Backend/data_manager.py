import pandas as pd
from pathlib import Path

def load_data():
    # path to the data file
    data_file_path = Path('C:/Users/dan/Exosky-1/Backend/data/exoplanet_data.csv')
    
    # Load the dataset and skip thefirst 96 rows as they are just comments and not needed, start capturing data on line 97
    df = pd.read_csv(data_file_path, skiprows=96, low_memory=False)
    
    # Strip whitespace from column names (for clarity)
    df.columns = df.columns.str.strip()
    
    print("Data loaded successfully!")
    print(f"Columns after stripping whitespace: {df.columns.tolist()}")
    
    return df

def get_exoplanet_names(df):
    # Return the unique names from the 'pl_name' column (incase of duplicates)
    return df['pl_name'].dropna().unique().tolist()

def get_exoplanet_coordinates(planet_name, df):
    planet_data = df[df['pl_name'] == planet_name]
    if not planet_data.empty:
        ra = planet_data['ra'].values[0]
        dec = planet_data['dec'].values[0]
        return ra, dec
    else:
        return None, None
