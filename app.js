import { OPENWEATHER_API_KEY } from './config.js';

const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const unitsSelect = document.getElementById('units-select');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

const cityNameEl = document.getElementById('city-name');
const countryEl = document.getElementById('country');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const iconEl = document.getElementById('icon');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  const units = unitsSelect.value;

  if (!city) {
    statusEl.textContent = "Please enter a city.";
    resultEl.classList.add("hidden");
    return;
  }

  statusEl.textContent = "Loading…";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    // Fill UI
    cityNameEl.textContent = data.name;
    countryEl.textContent = data.sys.country;
    temperatureEl.textContent = `Temp: ${Math.round(data.main.temp)}°`;
    conditionEl.textContent = data.weather[0].description;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windEl.textContent = `Wind: ${data.wind.speed} ${units === "imperial" ? "mph" : "m/s"}`;

    const iconCode = data.weather?.[0]?.icon;
    if (iconCode) {
      iconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      iconEl.alt = data.weather?.[0]?.main || "Weather";
      iconEl.style.display = "block";
    } else {
      iconEl.style.display = "none";
    }

    resultEl.classList.remove("hidden");
    statusEl.textContent = "";

  } catch (err) {
    statusEl.textContent = err.message;
    resultEl.classList.add("hidden");
  }
});

