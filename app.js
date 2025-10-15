import { OPENWEATHER_API_KEY } from './config.js';

const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const unitsSelect = document.getElementById('units-select');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const geoBtn = document.getElementById('geo-btn');

const cityNameEl = document.getElementById('city-name');
const countryEl = document.getElementById('country');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const iconEl = document.getElementById('icon');

function setLoading(isLoading) {
    const btn = document.getElementById('search-btn') || document.querySelector('#search-form button(type="submit"]');
    if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Loading...' : 'Get Weather';
    }
}

async function fetchByCoords(lat, lon, units = 'metric') {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${units}`;
    const res = await fetch(url);
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = (data && (data.message || data.cod))
        ? `${data.cod || res.status}: ${data.message}`
        : `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }  

  function capFirst(s = "") {
    return s ? s[0].toUpperCase() + s.slice(1) : s;
  }
  
  function populateFromData(data, units) {
    cityNameEl.textContent = data.name || "—";
    countryEl.textContent = data.sys?.country || "—";
    temperatureEl.textContent = `Temp: ${Math.round(data.main.temp)}°`;
    conditionEl.textContent = capFirst(data.weather?.[0]?.description || "—");
    humidityEl.textContent  = `${data.main?.humidity ?? "—"}%`;
    windEl.textContent      = `${Math.round((data.wind?.speed ?? 0) * 10) / 10} ${units === "imperial" ? "mph" : "m/s"}`;
  
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
  }  

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
  setLoading(true);

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
    );

    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    populateFromData(data, units);

    cityNameEl.textContent = data.name;
    countryEl.textContent = data.sys.country;
    temperatureEl.textContent = `Temp: ${Math.round(data.main.temp)}°`;
    conditionEl.textContent = data.weather[0].description;
    humidityEl.textContent  = `${data.main.humidity}%`;
    windEl.textContent      = `${data.wind.speed} ${units === "imperial" ? "mph" : "m/s"}`;

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
  } finally {
    setLoading(false);
  }
});

geoBtn?.addEventListener('click', () => {
    const units = unitsSelect.value || 'metric';
    if (!navigator.geolocation) {
      statusEl.textContent = 'Geolocation not supported by your browser.';
      return;
    }
    statusEl.textContent = 'Getting your location…';
    setLoading(true);
    resultEl.classList.add('hidden');
  
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const data = await fetchByCoords(latitude, longitude, units);
          populateFromData(data, units);
        } catch (err) {
          console.error(err);
          statusEl.textContent = err.message || 'Could not fetch weather for your location.';
          resultEl.classList.add('hidden');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        const msg =
          err.code === 1 ? 'Location permission denied.' :
          err.code === 2 ? 'Location unavailable.' :
          err.code === 3 ? 'Location request timed out.' :
          'Could not get your location.';
        statusEl.textContent = msg;
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });