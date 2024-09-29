document.addEventListener('DOMContentLoaded', function () {
    let allCheckboxes = [];
    let selectedPlanet = null;

    // fetch exoplanet names and populate the dropdown menu on the index page
    fetch('http://127.0.0.1:5000/api/exoplanets/names')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('exoplanet-dropdown');
            dropdown.innerHTML = '';

            data.forEach(name => {
                const listItem = document.createElement('li');
                const label = document.createElement('label');
                const input = document.createElement('input');
                
                input.type = 'checkbox';
                input.name = 'exoplanet';
                input.value = name;
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${name}`));
                listItem.appendChild(label);
                dropdown.appendChild(listItem);

                allCheckboxes.push(input);

                input.addEventListener('change', function () {
                    if (this.checked) {
                        allCheckboxes.forEach(checkbox => {
                            if (checkbox !== this) {
                                checkbox.checked = false;
                            }
                        });
                        selectedPlanet = this.value;
                        fetchAndRenderStars(selectedPlanet);
                    }
                });
            });
        })
        .catch(error => console.error('Error loading exoplanet names:', error));

    // function to fetch coordinates and render stars to the html canvas
    function fetchAndRenderStars(planetName) {
        fetch(`http://127.0.0.1:5000/api/exoplanets/coordinates?planet_name=${planetName}`)
            .then(response => response.json())
            .then(coords => {
                console.log("Coordinates Response:", coords);

                if (coords.ra && coords.dec) {
                    fetch(`http://127.0.0.1:5000/api/exoplanets/stars?planet_name=${planetName}`)
                        .then(response => response.json())
                        .then(stars => {
                            console.log("Star Data:", stars);
                            renderStarMap(stars, coords.ra, coords.dec);  // Pass RA/Dec to renderStarMap
                        })
                } 
            })
            .catch(error => console.error('cannot fetch coordinates:', error));
    }

    let renderer;
    let camera;

    function renderStarMap(stars, exoplanetRa, exoplanetDec) {
        const scene = new THREE.Scene();
    
        //clear the scene in case there was a previous rendering
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }
    
        // set up the camera at the exoplanet's current position
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1,1e7);
        camera.position.set(0, 0, 0); // position at the origin
        camera.lookAt(0, 0, 1);
    
        // Create the renderer
        if (!renderer) {
            renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById('starCanvas'),
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000);
        }
    
        //imported controls for user (zoom in zoomout, and look around the current rendering)
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 1); // Ensure controls are centered
        controls.update();
    
        // fixed radius for the celestial sphere
        const starSphereRadius = 1000;
    
        // scaling factor for angular differences
        const angularScalingFactor = 10000; // used to adjust the current spread of stars
    
        s
        const positions = [];
        const colors = [];
        const color = new THREE.Color();
    
        stars.forEach((star, index) => {
            // calculate angular differences and scale them
            let deltaRa = (star.ra - exoplanetRa) * angularScalingFactor;
            let deltaDec = (star.dec - exoplanetDec) * angularScalingFactor;
    
            // handle wrapping of RA differences
            if (deltaRa > 180) deltaRa -= 360;
            if (deltaRa < -180) deltaRa += 360;
    
            // convert scaled angular differences to radians
            const deltaRaRadians = deltaRa * (Math.PI / 180);
            const deltaDecRadians = deltaDec * (Math.PI / 180);
    
            // convert spherical coordinates to cartesian coords
            const x =
                starSphereRadius *
                Math.cos(deltaDecRadians) *
                Math.cos(deltaRaRadians);
            const y = starSphereRadius * Math.sin(deltaDecRadians);
            const z =
                starSphereRadius *
                Math.cos(deltaDecRadians) *
                Math.sin(deltaRaRadians);
    
            positions.push(x, y, z);
    
            //add star color (should be easy to add different colros for different things)
            if (index < 10) {
                color.setHex(0xff0000); 
            } else {
                color.setHex(0xffff00); 
            }
            colors.push(color.r, color.g, color.b);
        });
    
        //create geometry and material
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
        );
    
        const material = new THREE.PointsMaterial({
            size: 20, 
            vertexColors: true,
            sizeAttenuation: true,
        });
    
        //create points and add to scene current
        const points = new THREE.Points(geometry, material);
        scene.add(points);
    
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    }
    
    

    // Adjust the renderer size when the window is resized
    window.addEventListener('resize', () => {
        if (renderer) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
    });
});
