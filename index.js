const weatherForm = document.querySelector('.weather-form');
const cityInput = document.querySelector('.cityInput');
const card = document.querySelector('.card');
const cityDisplay = document.querySelector('.cityDisplay');
const tempDisplay = document.querySelector('.tempDisplay');
const highLowDisplay = document.querySelector('.highLowDisplay');
const humidityDisplay = document.querySelector('.humidityDisplay');
const pressureDisplay = document.querySelector('.pressureDisplay');
const windDisplay = document.querySelector('.windDisplay');
const precipDisplay = document.querySelector('.precipDisplay');
const sunriseDisplay = document.querySelector('.sunriseDisplay');
const sunsetDisplay = document.querySelector('.sunsetDisplay');
const descDisplay = document.querySelector('.descDisplay');
const emojiDisplay = document.querySelector('.weatherEmoji');
const dateDisplay = document.querySelector('.dateDisplay');
const apiKey = '164396c14amsh67ec2fb197adc70p15ec76jsnf35472bc1498';
let currentUnit = 'imperial'; // 'imperial' for °F, 'metric' for °C
let lastCity = '';
const unitToggle = document.querySelector('.unitToggle');

weatherForm.addEventListener('submit', async event => {
    event.preventDefault();

    const city = cityInput.value.trim();
    clearMessage();

    if (!city) {
        displayError('Please enter a city name');
        return;
    }

    showLoading();
    lastCity = city;
    const data = await getWeatherData(city, currentUnit);

    if (data) {
        displayWeatherInfo(data);
    }
});

unitToggle.addEventListener('click', async () => {
    currentUnit = currentUnit === 'imperial' ? 'metric' : 'imperial';
    unitToggle.textContent = currentUnit === 'imperial' ? '°F' : '°C';
    unitToggle.setAttribute('aria-pressed', currentUnit === 'imperial' ? 'false' : 'true');
    if (lastCity) {
        showLoading();
        const data = await getWeatherData(lastCity, currentUnit);
        if (data) displayWeatherInfo(data);
    }
});

async function getWeatherData(city, unit = currentUnit) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${unit}`
        );

        if (!response.ok) {
            const message = response.status === 404 ? 'City not found' : 'Unable to fetch weather';
            throw new Error(message);
        }

        return await response.json();
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

function displayWeatherInfo(data) {
    const weatherId = data.weather[0].id;
    const description = capitalize(data.weather[0].description);
    const temp = Math.round(data.main.temp);
    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = data.wind?.speed ?? 0;
    const windDeg = data.wind?.deg;
    const precipitationMm = data.rain?.['1h'] ?? data.rain?.['3h'] ?? data.snow?.['1h'] ?? data.snow?.['3h'] ?? 0;
    const sunrise = data.sys?.sunrise;
    const sunset = data.sys?.sunset;
    const cityName = `${data.name}, ${data.sys.country}`;
    const emoji = getWeatherEmoji(weatherId);
    const tempUnit = currentUnit === 'imperial' ? '°F' : '°C';
    const pressureInHg = (pressure * 0.029529983071445).toFixed(2);
    const windUnit = currentUnit === 'imperial' ? 'mph' : 'm/s';
    const precipUnit = currentUnit === 'imperial' ? 'in' : 'mm';
    const precipitation = currentUnit === 'imperial' ? (precipitationMm * 0.0393701).toFixed(2) : precipitationMm.toFixed(1);
    const windDirection = windDeg !== undefined ? getWindDirection(windDeg) : 'N/A';

    emojiDisplay.textContent = emoji;
    cityDisplay.textContent = cityName;
    tempDisplay.textContent = `${temp}${tempUnit}`;
    highLowDisplay.textContent = `High: ${tempMax}${tempUnit} • Low: ${tempMin}${tempUnit}`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    pressureDisplay.textContent = `Pressure: ${pressureInHg} "`;
    windDisplay.textContent = `Wind: ${windSpeed} ${windUnit} ${windDirection}`;
    precipDisplay.textContent = `Precipitation: ${precipitation} ${precipUnit}`;
    sunriseDisplay.textContent = `Sunrise: ${sunrise ? formatLocalTime(sunrise, data.timezone) : 'N/A'}`;
    sunsetDisplay.textContent = `Sunset: ${sunset ? formatLocalTime(sunset, data.timezone) : 'N/A'}`;
    descDisplay.textContent = description;
    dateDisplay.textContent = formatLocalDate(data.dt, data.timezone);

    card.classList.remove('hidden');
}

function getWeatherEmoji(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';
    if (weatherId >= 300 && weatherId < 500) return '🌦️';
    if (weatherId >= 500 && weatherId < 600) return '🌧️';
    if (weatherId >= 600 && weatherId < 700) return '❄️';
    if (weatherId >= 700 && weatherId < 800) return '🌫️';
    if (weatherId === 800) return '☀️';
    if (weatherId > 800) return '☁️';
    return '🌈';
}

function getWindDirection(deg) {
    if (deg === null || deg === undefined) return 'N/A';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((deg % 360) / 22.5) % 16;
    return directions[index];
}

function formatLocalDate(timestamp, timezoneOffset) {
    if (timestamp == null || timezoneOffset == null) return 'N/A';
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekday = weekdays[localTime.getUTCDay()];
    const month = months[localTime.getUTCMonth()];
    const day = localTime.getUTCDate();
    return `${weekday}, ${month} ${day}`;
}

function formatLocalTime(timestamp, timezoneOffset) {
    if (timestamp == null || timezoneOffset == null) return 'N/A';
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    let hour = localTime.getUTCHours();
    const minute = String(localTime.getUTCMinutes()).padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
}

function capitalize(text) {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function displayError(message) {
    emojiDisplay.textContent = '⚠️';
    cityDisplay.textContent = '';
    tempDisplay.textContent = '';
    highLowDisplay.textContent = '';
    humidityDisplay.textContent = '';
    pressureDisplay.textContent = '';
    windDisplay.textContent = '';
    precipDisplay.textContent = '';
    sunriseDisplay.textContent = '';
    sunsetDisplay.textContent = '';
    descDisplay.textContent = message;
    dateDisplay.textContent = '';
    card.classList.remove('hidden');
    card.classList.add('error');
}

function showLoading() {
    emojiDisplay.textContent = '⏳';
    cityDisplay.textContent = 'Loading weather...';
    tempDisplay.textContent = '';
    highLowDisplay.textContent = '';
    humidityDisplay.textContent = '';
    pressureDisplay.textContent = '';
    windDisplay.textContent = '';
    precipDisplay.textContent = '';
    sunriseDisplay.textContent = '';
    sunsetDisplay.textContent = '';
    descDisplay.textContent = '';
    dateDisplay.textContent = '';
    card.classList.remove('hidden');
    card.classList.remove('error');
}

function clearMessage() {
    card.classList.remove('error');
}
