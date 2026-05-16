const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m";

const tableBody = document.querySelector("#forecast-table-body");
const statusMessage = document.querySelector("#status-message");
const refreshButton = document.querySelector("#refresh-button");
const hourFilter = document.querySelector("#hour-filter");
const rowCount = document.querySelector("#row-count");
const temperatureUnit = document.querySelector("#temperature-unit");
const dominantCondition = document.querySelector("#dominant-condition");
const heroWeatherBadge = document.querySelector("#hero-weather-badge");
const heroWeatherIcon = document.querySelector("#hero-weather-icon");

let forecastRows = [];
let currentUnit = "°C";

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", type === "error");
  statusMessage.classList.remove("is-hidden");
}

function hideStatus() {
  statusMessage.classList.add("is-hidden");
}

function formatForecastTime(value) {
  return value.replace("T", " ");
}

function getTemperatureVisual(temperature) {
  if (!Number.isFinite(temperature)) {
    return {
      icon: "❔",
      label: "Tidak tersedia",
      description: "Data suhu belum tersedia untuk jam ini.",
      className: "unknown",
    };
  }

  if (temperature <= 24) {
    return {
      icon: "🌧️",
      label: "Sejuk",
      description: "Suhu terasa lebih sejuk, cocok untuk aktivitas santai.",
      className: "cool",
    };
  }

  if (temperature <= 29) {
    return {
      icon: "⛅",
      label: "Nyaman",
      description: "Suhu cukup nyaman untuk beraktivitas di luar ruangan.",
      className: "comfortable",
    };
  }

  if (temperature <= 33) {
    return {
      icon: "☀️",
      label: "Panas",
      description: "Suhu mulai panas, siapkan air minum yang cukup.",
      className: "hot",
    };
  }

  return {
    icon: "🔥",
    label: "Sangat panas",
    description: "Suhu sangat panas, hindari terlalu lama di bawah matahari.",
    className: "very-hot",
  };
}

function getFutureRows(rows) {
  const currentHour = new Date();
  currentHour.setMinutes(0, 0, 0);

  const firstFutureIndex = rows.findIndex((row) => new Date(row.time) >= currentHour);
  return rows.slice(firstFutureIndex === -1 ? 0 : firstFutureIndex);
}

function getDominantCondition(rows) {
  const totals = rows.reduce((counts, row) => {
    const visual = getTemperatureVisual(row.temperature);
    counts[visual.label] = (counts[visual.label] ?? 0) + 1;
    return counts;
  }, {});

  return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
}

function updateHeroVisual(rows) {
  const firstTemperature = rows[0]?.temperature;
  const visual = getTemperatureVisual(firstTemperature);

  heroWeatherIcon.textContent = visual.icon;
  heroWeatherBadge.className = `weather-badge ${visual.className}`;
}

function renderForecast() {
  const selectedHours = Number(hourFilter.value);
  const visibleRows = getFutureRows(forecastRows).slice(0, selectedHours);

  tableBody.innerHTML = visibleRows
    .map((row) => {
      const visual = getTemperatureVisual(row.temperature);
      const displayTemperature = Number.isFinite(row.temperature)
        ? `${row.temperature.toFixed(1)} ${currentUnit}`
        : "-";

      return `
        <tr>
          <td>
            <span class="condition-icon ${visual.className}" aria-label="${visual.label}">${visual.icon}</span>
          </td>
          <td>${formatForecastTime(row.time)}</td>
          <td>${displayTemperature}</td>
          <td>
            <strong>${visual.label}</strong>
            <span>${visual.description}</span>
          </td>
        </tr>
      `;
    })
    .join("");

  rowCount.textContent = `${visibleRows.length} dari ${selectedHours} jam`;
  dominantCondition.textContent = getDominantCondition(visibleRows);
  updateHeroVisual(visibleRows);
}

function normalizeForecastRows(hourly) {
  const times = hourly.time ?? [];
  const temperatures = hourly.temperature_2m ?? [];

  return times.map((time, index) => ({
    time,
    temperature: temperatures[index],
  }));
}

async function loadForecast() {
  refreshButton.disabled = true;
  hourFilter.disabled = true;
  rowCount.textContent = "Memuat...";
  dominantCondition.textContent = "Memuat...";
  setStatus("Mengambil data prakiraan cuaca...");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API mengembalikan status ${response.status}`);
    }

    const data = await response.json();
    currentUnit = data.hourly_units?.temperature_2m ?? "°C";
    forecastRows = normalizeForecastRows(data.hourly ?? {});

    temperatureUnit.textContent = currentUnit;
    renderForecast();
    hideStatus();
  } catch (error) {
    forecastRows = [];
    tableBody.innerHTML = "";
    rowCount.textContent = "Gagal dimuat";
    dominantCondition.textContent = "Tidak tersedia";
    updateHeroVisual([]);
    setStatus(
      `Data cuaca gagal dimuat. Periksa koneksi internet lalu coba lagi. (${error.message})`,
      "error",
    );
  } finally {
    refreshButton.disabled = false;
    hourFilter.disabled = false;
  }
}

refreshButton.addEventListener("click", loadForecast);
hourFilter.addEventListener("change", renderForecast);
loadForecast();
