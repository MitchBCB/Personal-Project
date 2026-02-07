// OpenWeatherMap API key (set window.OPENWEATHER_API_KEY or localStorage key)
const API_KEY = window.OPENWEATHER_API_KEY || localStorage.getItem('OPENWEATHER_API_KEY') || '';

// Get elements from HTML
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const effectsCanvas = document.getElementById('effectsCanvas');
const devIndicator = document.getElementById('devIndicator');
const mockLabel = document.getElementById('mockLabel');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const urlParams = new URLSearchParams(window.location.search);
const mockParam = urlParams.get('mock');
const mockCondition = mockParam ? mockParam.toLowerCase() : '';
const isMockMode = Boolean(mockCondition);

const ctx = effectsCanvas.getContext('2d');
let animationId = null;
let particles = [];
let clouds = [];
let stars = [];
let effectState = {
    condition: 'clear',
    isNight: false,
    lightningNext: 0,
    lightningEnd: 0,
    fogOffset: 0
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    effectsCanvas.width = window.innerWidth * dpr;
    effectsCanvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setupParticles(condition) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    particles = [];
    clouds = [];
    stars = [];

    if (condition === 'snow') {
        const count = Math.min(140, Math.floor(width / 10));
        for (let i = 0; i < count; i += 1) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: 1 + Math.random() * 3,
                speed: 0.4 + Math.random() * 0.9,
                drift: -0.3 + Math.random() * 0.6
            });
        }
    }

    if (condition === 'rain' || condition === 'drizzle' || condition === 'thunderstorm') {
        const count = Math.min(200, Math.floor(width / 6));
        for (let i = 0; i < count; i += 1) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                len: 10 + Math.random() * 14,
                speed: 4 + Math.random() * 6,
                opacity: 0.2 + Math.random() * 0.5
            });
        }
    }

    if (condition === 'clouds') {
        const count = 5;
        for (let i = 0; i < count; i += 1) {
            clouds.push({
                x: Math.random() * width,
                y: 40 + Math.random() * 160,
                scale: 0.6 + Math.random() * 0.9,
                speed: 0.08 + Math.random() * 0.12
            });
        }
    }

    if (condition === 'clear' && effectState.isNight) {
        const count = 60;
        for (let i = 0; i < count; i += 1) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.6,
                r: Math.random() * 1.4,
                opacity: 0.4 + Math.random() * 0.6
            });
        }
    }
}

function startEffects() {
    if (prefersReducedMotion.matches) {
        stopEffects();
        return;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const animate = (time) => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        ctx.clearRect(0, 0, width, height);

        if (effectState.condition === 'snow') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            particles.forEach((flake) => {
                flake.y += flake.speed;
                flake.x += flake.drift;
                if (flake.y > height) {
                    flake.y = -flake.r;
                    flake.x = Math.random() * width;
                }
                if (flake.x > width) {
                    flake.x = 0;
                }
                if (flake.x < 0) {
                    flake.x = width;
                }
                ctx.beginPath();
                ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        if (effectState.condition === 'rain' || effectState.condition === 'drizzle' || effectState.condition === 'thunderstorm') {
            ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
            ctx.lineWidth = 1;
            particles.forEach((drop) => {
                drop.y += drop.speed;
                drop.x += drop.speed * 0.15;
                if (drop.y > height) {
                    drop.y = -drop.len;
                    drop.x = Math.random() * width;
                }
                ctx.globalAlpha = drop.opacity;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 2, drop.y + drop.len);
                ctx.stroke();
            });
            ctx.globalAlpha = 1;
        }

        if (effectState.condition === 'clouds') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            clouds.forEach((cloud) => {
                cloud.x += cloud.speed;
                if (cloud.x > width + 120) {
                    cloud.x = -120;
                }
                ctx.beginPath();
                ctx.ellipse(cloud.x, cloud.y, 80 * cloud.scale, 30 * cloud.scale, 0, 0, Math.PI * 2);
                ctx.ellipse(cloud.x + 50 * cloud.scale, cloud.y + 10, 60 * cloud.scale, 24 * cloud.scale, 0, 0, Math.PI * 2);
                ctx.ellipse(cloud.x - 50 * cloud.scale, cloud.y + 12, 55 * cloud.scale, 22 * cloud.scale, 0, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        if (effectState.condition === 'fog') {
            effectState.fogOffset += 0.1;
            const fogY = 60 + Math.sin(effectState.fogOffset * 0.01) * 10;
            const gradient = ctx.createLinearGradient(0, fogY, 0, height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, fogY, width, height - fogY);
        }

        if (effectState.condition === 'clear') {
            if (effectState.isNight) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                stars.forEach((star) => {
                    ctx.globalAlpha = star.opacity;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            } else {
                const gradient = ctx.createRadialGradient(width - 120, 120, 20, width - 120, 120, 180);
                gradient.addColorStop(0, 'rgba(255, 246, 196, 0.65)');
                gradient.addColorStop(1, 'rgba(255, 246, 196, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(width - 120, 120, 180, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (effectState.condition === 'thunderstorm') {
            if (time > effectState.lightningNext) {
                effectState.lightningEnd = time + 120;
                effectState.lightningNext = time + 4000 + Math.random() * 6000;
            }
            if (time < effectState.lightningEnd) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                ctx.fillRect(0, 0, width, height);
            }
        }

        animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
}

function stopEffects() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function applyTheme(condition, isNight) {
    document.body.dataset.theme = condition;
    document.body.dataset.time = isNight ? 'night' : 'day';
}

function setEffects(condition, isNight) {
    effectState = {
        condition,
        isNight,
        lightningNext: performance.now() + 4000 + Math.random() * 4000,
        lightningEnd: 0,
        fogOffset: 0
    };
    resizeCanvas();
    setupParticles(condition);
    startEffects();
}

// Function to fetch weather data
async function getWeather(city) {
    // Show loading message
    weatherDisplay.innerHTML = '<p class="loading">Loading...</p>';

    if (isMockMode) {
        renderMockWeather(mockCondition);
        return;
    }

    if (!API_KEY) {
        weatherDisplay.innerHTML = '<p class="error">❌ Missing API key. Set window.OPENWEATHER_API_KEY or localStorage "OPENWEATHER_API_KEY".</p>';
        return;
    }
    
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
        
        // Change theme and effects based on weather
        updateThemeAndEffects(data);
        
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

function getConditionFromWeather(data) {
    const weather = data.weather && data.weather[0] ? data.weather[0] : {};
    const id = Number(weather.id);
    const main = (weather.main || '').toLowerCase();
    const description = (weather.description || '').toLowerCase();

    if (!Number.isNaN(id)) {
        if (id >= 200 && id < 300) return 'thunderstorm';
        if (id >= 300 && id < 400) return 'drizzle';
        if (id >= 500 && id < 600) return 'rain';
        if (id >= 600 && id < 700) return 'snow';
        if (id >= 700 && id < 800) return 'fog';
        if (id === 800) return 'clear';
        if (id > 800 && id < 900) return 'clouds';
    }

    if (description.includes('thunder')) return 'thunderstorm';
    if (description.includes('drizzle')) return 'drizzle';
    if (description.includes('rain')) return 'rain';
    if (description.includes('snow')) return 'snow';
    if (description.includes('fog') || description.includes('mist') || description.includes('haze')) return 'fog';
    if (description.includes('cloud')) return 'clouds';
    if (description.includes('clear') || main.includes('clear')) return 'clear';

    return 'clear';
}

function getIsNight(data) {
    const weather = data.weather && data.weather[0] ? data.weather[0] : {};
    if (weather.icon) {
        return weather.icon.endsWith('n');
    }
    if (data.dt && data.sys && data.sys.sunrise && data.sys.sunset) {
        return data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
    }
    return false;
}

function updateThemeAndEffects(data) {
    const condition = getConditionFromWeather(data);
    const isNight = getIsNight(data);
    applyTheme(condition, isNight);
    setEffects(condition, isNight);
}

function renderMockWeather(condition) {
    const isNight = condition === 'night';
    const mockCondition = isNight ? 'clear' : condition;
    const displayLabel = mockCondition === 'thunder' ? 'Thunderstorm' : mockCondition;
    const data = {
        name: 'Mock City',
        sys: { country: 'XX', sunrise: 0, sunset: 0 },
        main: { temp: 22, feels_like: 20, humidity: 55 },
        wind: { speed: 3.2 },
        weather: [{
            main: displayLabel,
            description: displayLabel,
            id: mockCondition === 'thunder' ? 201 : 800,
            icon: isNight ? '01n' : '01d'
        }]
    };

    if (mockCondition === 'rain') data.weather[0].id = 501;
    if (mockCondition === 'drizzle') data.weather[0].id = 301;
    if (mockCondition === 'snow') data.weather[0].id = 601;
    if (mockCondition === 'clouds') data.weather[0].id = 803;
    if (mockCondition === 'thunder') data.weather[0].id = 201;
    if (mockCondition === 'fog') data.weather[0].id = 741;

    displayWeather(data);
    updateThemeAndEffects(data);
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

window.addEventListener('resize', () => {
    resizeCanvas();
    setupParticles(effectState.condition);
});

prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
        stopEffects();
    } else {
        setEffects(effectState.condition, effectState.isNight);
    }
});

resizeCanvas();

if (isMockMode) {
    devIndicator.hidden = false;
    mockLabel.textContent = mockCondition;
    renderMockWeather(mockCondition);
}
