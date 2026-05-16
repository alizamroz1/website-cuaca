const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m";

const tableBody = document.querySelector("#forecast-table-body");
const statusMessage = document.querySelector("#status-message");
const refreshButton = document.querySelector("#refresh-button");
const rowCount = document.querySelector("#row-count");
const temperatureUnit = document.querySelector("#temperature-unit");

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

function renderForecast(hourly, unit) {
  const times = hourly.time ?? [];
  const temperatures = hourly.temperature_2m ?? [];

  tableBody.innerHTML = times
    .map((time, index) => {
      const temperature = temperatures[index];
      const displayTemperature = Number.isFinite(temperature)
        ? `${temperature.toFixed(1)} ${unit}`
        : "-";

      return `
        <tr>
          <td>${formatForecastTime(time)}</td>
          <td>${displayTemperature}</td>
        </tr>
      `;
    })
    .join("");

  rowCount.textContent = `${times.length} baris`;
}

async function loadForecast() {
  refreshButton.disabled = true;
  rowCount.textContent = "Memuat...";
  setStatus("Mengambil data prakiraan cuaca...");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API mengembalikan status ${response.status}`);
    }

    const data = await response.json();
    const unit = data.hourly_units?.temperature_2m ?? "°C";

    temperatureUnit.textContent = unit;
    renderForecast(data.hourly ?? {}, unit);
    hideStatus();
  } catch (error) {
    tableBody.innerHTML = "";
    rowCount.textContent = "Gagal dimuat";
    setStatus(
      `Data cuaca gagal dimuat. Periksa koneksi internet lalu coba lagi. (${error.message})`,
      "error",
    );
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadForecast);
loadForecast();
