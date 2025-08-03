/*
    CSC6304 Week 6 Project 5
    Alexander Medeiros 12/3/2024

    This file contains javascript methods which handle the interactive aspects of the html homepage
*/
var user_location = document.getElementById("location"); 

// Method to obtain user coordinates
function get_coordinates() { 
    if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(autofillcoordinates); // get location and autofill
    } else { 
        user_location.innerHTML = "The browser doesn't support Geolocation.";} // handle unsupported browers   
}

// Method to autofill coordinate input fields
function autofillcoordinates(myposition) { 
    // Autofill the input fields
    document.getElementById('latitude').value = myposition.coords.latitude;
    document.getElementById('longitude').value = myposition.coords.longitude;
} 


// Method to switch css style sheets
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("toggleBtn");
    const stylesheet = document.getElementById("stylesheet");
    
    let isStyle1 = true; // Track the current stylesheet state
  
    button.addEventListener("click", () => {
      if (isStyle1) {
        stylesheet.setAttribute("href", "style2.css"); // Switch to style2
      } else {
        stylesheet.setAttribute("href", "style1.css"); // Switch back to style1
      }
      isStyle1 = !isStyle1; // Toggle the state
    });  
});

  // Method to obtain the NOAA Forecast grid points using latitude and longitude information, re-used code from week 3 project 2
  async function fetchGridInfo() {
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    const url = `https://api.weather.gov/points/${latitude},${longitude}`; // URL for gridpoints request, takes latitude and longtitude inputs
    try {
        const response = await fetch(url); // obtain the json from NOAA containing the gridpoints
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`); // catch errors
        }

        // parse the JSON response
        const locationData = await response.json(); 
        const properties = locationData.properties;

        // extract the grid information
        const gridID = properties.gridId;
        const gridX = parseFloat(properties.gridX);
        const gridY = parseFloat(properties.gridY);

        // extract the location
        const city = properties.relativeLocation.properties.city;
        const state = properties.relativeLocation.properties.state;

        // status and grid data for error checking and debugging
        if (gridID) {
            document.getElementById("outputStatus").innerHTML = "Grid data fetched successfully!";
            document.getElementById("outputGriddata").innerHTML = 
                `Grid ID: ${gridID}, Grid X: ${gridX}, Grid Y: ${gridY}`;
        } else {
            document.getElementById("outputStatus").innerHTML = "No grid data found.";
        }

        return { gridID, gridX, gridY , city, state}; // Return grid data as an object
    } catch (error) {
        console.error("Error fetching grid information:", error);
        document.getElementById("outputStatus").innerHTML = "Error fetching grid information. Please ensure input is correctly formatted";
        return {}; // Return empty object on error
    }
}

// Method to obtain the forecast using the grid values obtained from get_gridpoints, re-used code from week 3 project 2
async function get_forecast() {
    try {
        const { gridID, gridX, gridY, city, state } = await fetchGridInfo(); // obtaining the grid data, takes field entries from the html page
        
        if (!gridID || gridX === undefined || gridY === undefined) { // handle errors
            document.getElementById("outputForecast").innerText = "Invalid grid data. Cannot fetch forecast.";
            document.getElementById("outputGriddata").innerText = ""
            return;
        }

        const url_forecast = `https://api.weather.gov/gridpoints/${gridID}/${gridX},${gridY}/forecast`; // URL for forecast request, takes grid ID, X, and Y values as inputs
        let output = 'Location: '+ city + " " + state; // intilize an output variable to store the text string

        const response = await fetch(url_forecast);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const forecastData = await response.json(); // Parse the JSON response
        const periods = forecastData.properties.periods; // Access the periods array

        // Iterate through each period and construct the output string
        for (const period of periods) {
            const day_name = period.name;
            const date = period.startTime.slice(0, 10);
            const temp = period.temperature;
            const temp_unit = period.temperatureUnit;
            const percep_probability = period.probabilityOfPrecipitation?.value || 0;
            const windspeed = period.windSpeed;
            const winddirection = period.windDirection;
            const long_description = period.detailedForecast;

            // Append the formatted string to output
            output += `
                <hr>
                <h3>${day_name}, ${date}</h3>
                <p>&emsp;Temperature: ${temp} ${temp_unit}</p>
                <p>&emsp;${percep_probability}% Chance of Rain</p>
                <p>&emsp;Wind: ${windspeed} ${winddirection}</p>
                <p>&emsp;&emsp;${long_description}</p>
            `;
        }

        // Display the output
        document.getElementById("outputForecast").innerHTML = output; 

    } catch (error) {
        console.error("Error fetching forecast information:", error);
        document.getElementById("outputForecast").innerText = "Error fetching forecast information.";
    }
}
window.get_forecast = get_forecast;
