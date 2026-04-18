const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const statusText = document.getElementById('statusText');

const resultEl = document.getElementById('result');
const emptyEl = document.getElementById('empty');

const placeEl = document.getElementById('place');
const metaEl = document.getElementById('meta');
const iconEl = document.getElementById('icon');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const hourlyEl = document.getElementById('hourly');

function setStatus(message) {
  statusText.textContent = message || '';
}

function showEmpty() {
  emptyEl.hidden = false;
  resultEl.hidden = true;
}

function showResult() {
  emptyEl.hidden = true;
  resultEl.hidden = false;
}

function clearHourly() {
  hourlyEl.innerHTML = '';
}

function formatLocalTime(unixSeconds, timezoneSeconds) {
  const ms = (unixSeconds + timezoneSeconds) * 1000;
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ✅ CALL BACKEND INSTEAD OF OPENWEATHER DIRECTLY
async function fetchWeatherByCity(city) {
  const res = await fetch(`/api/weather?city=${city}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch weather");
  }
  return data;
}

async function fetchForecastByCity(city) {
  const res = await fetch(`/api/forecast?city=${city}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch forecast");
  }
  return data;
}

function formatHourFromUnix(unixSeconds, timezoneSeconds) {
  const ms = (unixSeconds + timezoneSeconds) * 1000;
  const d = new Date(ms);
  const h = d.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12} ${ampm}`;
}

function renderHourlyForecast(forecastData) {
  const tz = Number(forecastData?.city?.timezone ?? 0);
  const list = Array.isArray(forecastData?.list) ? forecastData.list : [];

  clearHourly();

  const next = list.slice(0, 8);
  for (const item of next) {
    const dt = Number(item?.dt ?? 0);
    const main = item?.main ?? {};
    const weather = Array.isArray(item?.weather) ? item.weather[0] : null;
    const temp = typeof main?.temp === 'number' ? Math.round(main.temp) : null;

    const card = document.createElement('div');
    card.className = 'hourCard';

    const time = document.createElement('div');
    time.textContent = dt ? formatHourFromUnix(dt, tz) : '--';

    const tempEl = document.createElement('div');
    tempEl.textContent = temp === null ? '--' : `${temp}°C`;

    card.appendChild(time);
    card.appendChild(tempEl);

    hourlyEl.appendChild(card);
  }
}

function renderWeather(data) {
  const name = data?.name ?? '';
  const country = data?.sys?.country ?? '';
  const weather = Array.isArray(data?.weather) ? data.weather[0] : null;
  const main = data?.main ?? {};
  const wind = data?.wind ?? {};
  const tz = Number(data?.timezone ?? 0);
  const dt = Number(data?.dt ?? 0);

  placeEl.textContent = country ? `${name}, ${country}` : name;
  metaEl.textContent = dt ? `Local time ${formatLocalTime(dt, tz)}` : '';

  tempEl.textContent = Math.round(main.temp);
  descEl.textContent = weather?.description ?? '--';
  feelsLikeEl.textContent = Math.round(main.feels_like);
  humidityEl.textContent = main.humidity;
  windEl.textContent = wind.speed;
  pressureEl.textContent = main.pressure;

  showResult();
}

async function handleSearch(city) {
  setStatus('Loading...');
  clearHourly();

  try {
    const [data, forecast] = await Promise.all([
      fetchWeatherByCity(city),
      fetchForecastByCity(city)
    ]);

    renderWeather(data);
    renderHourlyForecast(forecast);
    setStatus('');
  } catch (err) {
    showEmpty();
    setStatus(err.message);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  handleSearch(city);
});

showEmpty();