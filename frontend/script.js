document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:5000/api/exoplanets/names') // fetches data from the api created in the app.py folder
        .then(response => response.json())
        .then(data => {
            console.log("Exoplanet names fetched:", data);  // Debugging log, had issues with the flask app
            const dropdown = document.getElementById('exoplanet-dropdown');  // uses the <ul> element on the html file

            // clear any previous items in the dropdown
            dropdown.innerHTML = '';

            // dynamically populate the dropdown with checkboxes for each exoplanet
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
            });
        })
        .catch(error => console.error('Error loading exoplanet names:', error));
});
