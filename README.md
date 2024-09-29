# ExoSky!
ExoSky is an interactive web application that allows users to visualize the night sky from the perspective of various exoplanets. By selecting an exoplanet from the provided list, users can explore the surrounding stars, view detailed information about them, and even download a snapshot of their current view. ExoSky aims to provide an immersive and educational experience for astronomy enthusiasts and anyone interested in exploring the universe beyond our solar system.

Technologies Used:
- HTML5 & CSS3: For structuring and styling the web pages.
- JavaScript (ES6+): Provides interactive functionality and handles API calls.
- Three.js: A powerful 3D library used for rendering the star map and handling 3D interactions.
- Flask: A Python web framework used to create a RESTful API for serving exoplanet and star data.
- Remix Icon: An icon library used for the nav bar.
- Google Fonts: Provides aesthetically pleasing fonts for the application's text.
- OrbitControls.js: An extension for Three.js that allows intuitive mouse controls for rotating and zooming the 3D scene.
  
## Installation:
<details>
  <summary>Click to expand!</summary>
  <ul>
    <li>Clone the respository</li>
    <li><code>pip install -r requirements.txt</code> - Install the necessary packages from the requirements file.</li>
    <li><code>pip list</code> - Run this command to ensure all requirements are installed.</li>
    <li>Navigate to the "backend" folder from the terminal and run the following command: <code>flask run</code></li>
  </ul>
</details>

## Data Sources
### The application uses astronomical data for exoplanets and stars. Data can be sourced from the following:

- [**NASA Exoplanet Archive**](https://exoplanetarchive.ipac.caltech.edu/): Catalog of confirmed exoplanets, with their positions and host stars; these can be used as new observation points to simulate their star fields.

- [**Gaia DR3 Catalog (A Precise Three-Dimensional Database of About One Billion Stars Throughout Our Galaxy and Beyond)**](https://www.cosmos.esa.int/web/gaia/data-release-3): See in particular the Python access through astroquery.gaia API to avoid downloading the entire DR3 dataset.

- [Basics of Space Flight](https://science.nasa.gov/learn/basics-of-space-flight/chapter2-2/): NASA's educational guide on the basics of space flight.

### Astronomical Software Documentation:
- [Astropy Coordinates Documentation](https://learn.astropy.org/tutorials/1-Coordinates-Intro.html): Tutorial on using Astropy to handle astronomical coordinates.
- [Three.JS Library Documentation](https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene) official documentation for how to set up / use the Three.JS library.
- [Interactive Sky Chart](https://skyandtelescope.org/observing/interactive-sky-chart/): Tool provided by Sky & Telescope for observing the night sky.


## Acknowledgements
- **NASA Exoplanet Archive**: For providing all data on exoplanets used in this project.
- **Gaia DR3 Cataloge**: For detailed star data and astronomical object information.
- Deep star map: NASA/Goddard Space Flight Center Scientific Visualization Studio. Constellation figures based on those developed for the IAU by Alan MacRobert of Sky and Telescope magazine (Roger Sinnott and Rick Fienberg). found at this link https://svs.gsfc.nasa.gov/3895/
- All relative data and inspiration are accredited to NASA, and the Space Apps Challenge for the Fall 2024 hackathon & Gaia DR3 Catalog for related data.
