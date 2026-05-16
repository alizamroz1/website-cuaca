# Website Cuaca Jakarta

Aplikasi web sederhana untuk menampilkan data prakiraan suhu per jam Jakarta dari Open-Meteo API.

API yang digunakan:

```text
https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&hourly=temperature_2m
```

## Fitur

- Mengambil data cuaca langsung dari API online.
- Menampilkan field `time` dan `temperature_2m` dalam tabel responsif.
- Tombol **Muat ulang** untuk mengambil ulang data terbaru.
- Tampilan modern, bersih, dan mudah dibaca.

## Menjalankan Proyek

Karena proyek ini menggunakan HTML, CSS, dan JavaScript murni, Anda bisa menjalankannya dengan membuka `index.html` di browser atau memakai server statis lokal:

```bash
python3 -m http.server 4173
```

Lalu buka:

```text
http://localhost:4173
```
