document.addEventListener('DOMContentLoaded', function () {
    let allCheckboxes = [];
    let selectedPlanet = null;
    let showStarNames = false; // keep track of the state of the "Show Star Names" checkbox on the home page from dropdown menu
    

    const exportButton = document.getElementById('export-btn');
    exportButton.addEventListener('click', downloadStarMap);

// Function to download the user view as a screenshot
    function downloadStarMap() {
        if (!renderer) {
            console.error('Renderer not initialized.');
            return;
        }

    // get the data URL of the renderers canvas
        const imgData = renderer.domElement.toDataURL('image/png');

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `star_map_${selectedPlanet || 'exoplanet'}.png`; // name of image

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // fetch exoplanet names and populate the dropdown menu on the index page
    fetch('http://127.0.0.1:5000/api/exoplanets/names')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('exoplanet-dropdown');
            dropdown.innerHTML = '';

            // Populate exoplanet names
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

    // featrue to display star names once the dropdown option is selcted
    const featureCheckboxes = document.querySelectorAll('input[name="feature"]');
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.value === 'star-names') {
                showStarNames = this.checked;
                if (selectedPlanet) {
                    fetchAndRenderStars(selectedPlanet);
                }
            }
        });
    });

    // function to fetch coordinates and render stars on the home page canvas
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
                            renderStarMap(stars, coords.ra, coords.dec, showStarNames);  // Pass showStarNames
                        })
                        .catch(error => console.error('Error fetching nearby stars:', error));
                } else {
                    console.error('Invalid coordinates received:', coords);
                }
            })
            .catch(error => console.error('Error fetching coordinates:', error));
    }

    let renderer;
    let camera;
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    function renderStarMap(stars, exoplanetRa, exoplanetDec, showNames) {
        const scene = new THREE.Scene();

        // clear the scene before rendering image
        while (scene.children.length > 0) {
            scene.remove(scene.children[0]);
        }

     // set up the camera at the exoplanet's position
        camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,5000 );
        camera.position.set(0, 0, 0); // position the camera at the origin of the exoplanet

        // create the renderer if it doesn't exist
        if (!renderer) {
            renderer = new THREE.WebGLRenderer({
                canvas: document.getElementById('starCanvas'),
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000);
        }

    // Add OrbitControls for users to look around in the render
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enablePan = false; // Disable panning
        controls.enableZoom = false; // Disable zooming
        controls.minDistance = 0;
        controls.maxDistance = 0;
        controls.update();

    // fixed radius for the celestial sphere
        const starSphereRadius = 2000; // Adjusted radius for better spread of stars (still working with this and making adjustments)

        //  scaling factor for angular differences
        const angularScalingFactor = 100000; // scaling factor spread out stars

        //arrays for positions and colors
        const positions = [];
        const colors = [];
        const starData = []; // To store star data with positions
        const color = new THREE.Color();

        stars.forEach((star, index) => {
             // calculate angular differences and scale them
            let deltaRa = (star.ra - exoplanetRa) * angularScalingFactor;
            let deltaDec = (star.dec - exoplanetDec) * angularScalingFactor;

            // wrapping of RA differences
            if (deltaRa > 180) deltaRa -= 360;
            if (deltaRa < -180) deltaRa += 360;

                 //convert scaled angular differences to radians
            const deltaRaRadians = deltaRa * (Math.PI / 180);
            const deltaDecRadians = deltaDec * (Math.PI / 180);

            //convert spherical coordinates to Cartesian coordinates
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

            // store the star's position and data
            starData.push({
                position: new THREE.Vector3(x, y, z),
                data: star,
            });

            // Set star color depending on permaters (can easily be adjusted for different peramters)
            if (index < 10) {
                color.setHex(0xff0000); // Red color for first 10 stars
            } else {
                color.setHex(0xffff00); // Yellow color for the rest
            }
            colors.push(color.r, color.g, color.b);
        });

        // geometry and material, creates shapes in 3D space
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
            size: 10, 
            vertexColors: true,
            sizeAttenuation: true,
        });

             // Create point cloud from the geometery and material then points are rendered as individual points
        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // store sprites for later removal
        const starNameSprites = [];

            // Create labels if showNames is true
        if (showNames) {
            starData.forEach((starInfo, index) => {
                const starName = starInfo.data.name || `Star ${index + 1}`;

                // Create a canvas texture with the star name
                const canvas = generateSprite(starName);
                const texture = new THREE.CanvasTexture(canvas);

                const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
                const sprite = new THREE.Sprite(spriteMat);

                // position the sprite at the same position as the star
                sprite.position.copy(starInfo.position);

                // adjust the scale of the sprite
                sprite.scale.set(100, 50, 1); // Adjust as needed

                scene.add(sprite);
                starNameSprites.push(sprite);
            });
        }

        // function to generate canvas with text with more detailed inofrmation about the specific star on hover
        function generateSprite(text) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 128;
            const context = canvas.getContext('2d');
            context.fillStyle = 'rgba(255, 255, 255, 1)';
            context.font = '55px Arial';
            context.fillText(text, 10, 64);
            return canvas;
        }

        // event listener for hover interaction
        renderer.domElement.addEventListener('mousemove', onMouseMove, false);

        let INTERSECTED;
        function onMouseMove(event) {
            event.preventDefault();

            // calculate mouse position in normalized device coordinates (-1 to +1)
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // check for intersections with points
            const intersects = raycaster.intersectObject(points);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const index = intersect.index;

                if (INTERSECTED != index) {
                    INTERSECTED = index;

                    const star = stars[index];

                    // display star information
                    showTooltip(event.clientX, event.clientY, `Star Name: ${star.name || 'Unknown'}<br>RA: ${star.ra}<br>Dec: ${star.dec}`);
                }
            } else {
                INTERSECTED = null;
                hideTooltip();
            }
        }

        // tooltip management
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.7)';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '5px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        function showTooltip(x, y, content) {
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            tooltip.innerHTML = content;
            tooltip.style.display = 'block';
        }

        function hideTooltip() {
            tooltip.style.display = 'none';
        }

        // animation loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    }

    // this adjusts the screen for different sizes and handles window resizing
    window.addEventListener('resize', () => {
        if (renderer && camera) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
    });
});
z