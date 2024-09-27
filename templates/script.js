document.addEventListener('DOMContentLoaded', function() {
    let allCheckboxes = [];
    let selectedPlanet = null;

    // Fetch exoplanet names and populate the dropdown menu on the index page
    fetch('http://127.0.0.1:5000/api/exoplanets/names')  
        .then(response => response.json())
        .then(data => {
            console.log("Exoplanet names fetched:", data);
            const dropdown = document.getElementById('exoplanet-dropdown');  
            
            dropdown.innerHTML = '';

            // dynamically populate the dropdown with exoplanets from the dataset (added checkcboxes for each item in thelist)
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

                // this section ensures that the user can only select one planet from the dropdown to prevent multiple queries and runtime errors
                input.addEventListener('change', function() {
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

    // Function to fetch coordinates and render stars
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
                            renderStarMap(stars);  
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

    function renderStarMap(stars) {
        const scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        
        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starCanvas') });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000); 
    
        // Adjust camera position to view the rendered stars in that position
        camera.position.set(0, 0, 2000);  
        camera.lookAt(0, 0, 0);  
    
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ size: 1, vertexColors: true });
    
        const positions = [];
        const colors = [];
    
        stars.forEach(star => {
            const ra = star.ra * (Math.PI / 180);
            const dec = star.dec * (Math.PI / 180);
            const r = 1500;  // adjust radius value for more visible stars
    //pain
            const x = r * Math.cos(dec) * Math.cos(ra);
            const y = r * Math.sin(dec);
            const z = r * Math.cos(dec) * Math.sin(ra);
    
            positions.push(x, y, z);
    
            const colorIndex = star.color_index !== null ? star.color_index : 0.5;
            const color = new THREE.Color();
            color.setHSL((1.0 - colorIndex), 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        });
    
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
        const starsMesh = new THREE.Points(starGeometry, starMaterial);
        scene.add(starsMesh);
    
        // Add fixed stars for testing to ensure the rendered scene is working
        const testStars = [
            { x: 100, y: 100, z: -200 },
            { x: -100, y: -100, z: -200 },
            { x: 200, y: 50, z: -200 },
            { x: 300, y: 300, z: -300 },
            { x: -300, y: 300, z: -300 },
        ];
    
        testStars.forEach(pos => {
            const testStarGeometry = new THREE.SphereGeometry(5, 8, 8);
            const testStarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const testStarMesh = new THREE.Mesh(testStarGeometry, testStarMaterial);
            testStarMesh.position.set(pos.x, pos.y, pos.z);
            scene.add(testStarMesh);
        });
    
        // render the scene
        renderer.render(scene, camera);
    }
    
    
    // in case of window resizing this should work
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('starCanvas');
        if (renderer) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
    });
});
