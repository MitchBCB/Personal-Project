// Your OpenWeatherMap API key - REPLACE THIS with your actual key
const API_KEY = '79a0728d7b60a0f3852a84e7efbbab0c';

// Get elements from HTML
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');

// Function to fetch weather data
async function getWeather(city) {
    // Show loading message
    weatherDisplay.innerHTML = '<p class="loading">Loading...</p>';
    
    try {
        // Build the API URL with the city name and API key
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        
        // Fetch data from the API
        const response = await fetch(url);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        // Convert response to JSON (JavaScript Object)
        const data = await response.json();
        
        // Display the weather data
        displayWeather(data);
        
        // Change theme based on weather
        changeTheme(data.weather[0].main);
        
    } catch (error) {
        // Show error message if something went wrong
        weatherDisplay.innerHTML = `<p class="error">❌ ${error.message}. Please try again.</p>`;
    }
}

// Function to display weather data on the page
function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const description = data.weather[0].description;
    const cityName = data.name;
    const country = data.sys.country;
    
    // Create HTML with weather information
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}, ${country}</h2>
            <div class="temperature">${temp}°C</div>
            <div class="description">${description}</div>
            
            <div class="details">
                <div class="detail-item">
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${feelsLike}°C</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${windSpeed} m/s</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Conditions</div>
                    <div class="detail-value">${data.weather[0].main}</div>
                </div>
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = weatherHTML;
}

// Function to change theme based on weather conditions
function changeTheme(weatherCondition) {
    const body = document.body;
    
    // Remove any existing theme classes
    body.className = '';
    
    // Add class based on weather condition
    switch(weatherCondition.toLowerCase()) {
        case 'clear':
            body.style.background = 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)';
            break;
        case 'clouds':
            body.style.background = 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)';
            break;
        case 'rain':
        case 'drizzle':
            body.style.background = 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)';
            break;
        case 'snow':
            body.style.background = 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
            break;
        case 'thunderstorm':
            body.style.background = 'linear-gradient(135deg, #4b4b4b 0%, #1a1a1a 100%)';
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            body.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
            break;
        default:
            body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
}

// Event listener for search button
searchBtn.addEventListener('click', function() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        weatherDisplay.innerHTML = '<p class="error">❌ Please enter a city name</p>';
        return;
    }
    
    getWeather(city);
});

// Event listener for Enter key
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});