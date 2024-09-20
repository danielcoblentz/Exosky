document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/exoplanets')
        .then(response => response.json())
        .then(data => {
            const dropdownMenu = document.querySelector('.dropdown-menu');
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
                dropdownMenu.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error loading exoplanet names:', error));
});

