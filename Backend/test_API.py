import requests

# this document is just to ensure all API endpoints are returning the correct data and accessing the correct files should printout steps of the program in hte terminal for users to view

# Test Exoplanet Names
def test_exoplanet_names():
    response = requests.get("http://127.0.0.1:5000/api/exoplanets/names")
    if response.status_code == 200:
        print("Exoplanet names fetched successfully!")
        print(response.json())  # Should return a list of exoplanet names
    else:
        print(f"Error fetching exoplanet names: {response.status_code}")
        print(response.json())

# Test Exoplanet Coordinates
def test_exoplanet_coordinates(planet_name):
    response = requests.get(f"http://127.0.0.1:5000/api/exoplanets/coordinates?planet_name={planet_name}")
    if response.status_code == 200:
        print(f"Coordinates for {planet_name} fetched successfully!")
        print(response.json())  # should return RA/Dec coordinates for the planet
    else:
        print(f"Error fetching coordinates for {planet_name}: {response.status_code}")
        print(response.json())

# Test Nearby Stars
def test_nearby_stars(planet_name):
    response = requests.get(f"http://127.0.0.1:5000/api/exoplanets/stars?planet_name={planet_name}")
    if response.status_code == 200:
        print(f"Nearby stars for {planet_name} fetched successfully!")
        print(response.json())  # should return a list of stars near the exoplanet
    else:
        print(f"Error fetching nearby stars for {planet_name}: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    # Test the API endpoints
    test_exoplanet_names()
    
    #sample planet
    planet_name = "14 Her b"
    
    test_exoplanet_coordinates(planet_name)
    test_nearby_stars(planet_name)
