
const weatherForm = document.querySelector('.weather-form');
const cityInput = document.querySelector('.cityInput');
const card = document.querySelector('.card');
const cityDisplay = document.querySelector('.cityDisplay');
const tempDisplay = document.querySelector('.tempDisplay');
const humidityDisplay = document.querySelector('.humidityDisplay');
const descDisplay = document.querySelector('.descDisplay');
const emojiDisplay = document.querySelector('.weatherEmoji');
const dateDisplay = document.querySelector('.dateDisplay');
const apiKey = 'f8f62900f2e8bd0e8433ca376f416974';
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
    const humidity = data.main.humidity;
    const cityName = `${data.name}, ${data.sys.country}`;
    const emoji = getWeatherEmoji(weatherId);

    emojiDisplay.textContent = emoji;
    cityDisplay.textContent = cityName;
    tempDisplay.textContent = `${temp}${currentUnit === 'imperial' ? '°F' : '°C'}`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
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

function formatLocalDate(timestamp, timezoneOffset) {
    const localTime = new Date((timestamp + timezoneOffset) * 1000);
    return localTime.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
    humidityDisplay.textContent = '';
    descDisplay.textContent = message;
    dateDisplay.textContent = '';
    card.classList.remove('hidden');
    card.classList.add('error');
}

function showLoading() {
    emojiDisplay.textContent = '⏳';
    cityDisplay.textContent = 'Loading weather...';
    tempDisplay.textContent = '';
    humidityDisplay.textContent = '';
    descDisplay.textContent = '';
    dateDisplay.textContent = '';
    card.classList.remove('hidden');
    card.classList.remove('error');
}

function clearMessage() {
    card.classList.remove('error');
}
