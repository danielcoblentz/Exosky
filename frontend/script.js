document.addEventListener('DOMContentLoaded', function() {
    let allCheckboxes = [];
    fetch('http://127.0.0.1:5000/api/exoplanets/names') // fetches data from the api created in the app.py folder
        .then(response => response.json())
        .then(data => {
            console.log("Exoplanet names fetched:", data);  // Debugging log, had issues with the flask app
            const dropdown = document.getElementById('exoplanet-dropdown');  // uses the <ul> element on the html file

        
            dropdown.innerHTML = '';

            // dynamically populate the dropdown with checkboxes for each exoplanet from the data file
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

                              // Add to list of checkboxes
                              allCheckboxes.push(input);

                              // Event listener to limit selection to one so multiple simulations cannot run simultaneously
                              input.addEventListener('change', function() {
                                  if (this.checked) {
                                      // Uncheck all other checkboxes in the dropdown menu 
                                      allCheckboxes.forEach(checkbox => {
                                          if (checkbox !== this) {
                                              checkbox.checked = false;
                                          }
                                      });
                                  }
                              });
                          });
                      })
                      .catch(error => console.error('Error loading exoplanet names:', error));
              });
              