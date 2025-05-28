// Ganti bagian inisialisasi peta dan tile layer dengan kode berikut:

// Inisialisasi peta
const map = L.map('map').setView([-7.2575, 112.7521], 12);

// Daftar layer peta yang tersedia
const baseLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    
    "Satelit (Google)": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Satellite'
    }),
    
    "Satelit (ESRI)": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
    }),
    
    "Topografi": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    })
};

// Tambahkan layer default (OpenStreetMap) ke peta
baseLayers["OpenStreetMap"].addTo(map);

// Tambahkan kontrol layer untuk mengganti tampilan peta
L.control.layers(baseLayers).addTo(map);

// Icon untuk berbagai jenis lokasi
const iconMasjid = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fas fa-mosque" style="color: #2c7a51; font-size: 20px;"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const iconSekolah = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fas fa-school" style="color: #3182ce; font-size: 20px;"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const iconYayasan = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fas fa-hands-helping" style="color: #805ad5; font-size: 20px;"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const iconWakaf = L.divIcon({
    className: 'custom-icon',
    html: '<i class="fas fa-landmark" style="color: #d69e2e; font-size: 20px;"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Simpan semua marker dalam array
let markers = [];
let locations = [];

// Fungsi untuk mendapatkan icon berdasarkan jenis lokasi
function getIconByType(type) {
    switch(type) {
        case 'masjid': return iconMasjid;
        case 'sekolah': return iconSekolah;
        case 'yayasan': return iconYayasan;
        case 'wakaf': return iconWakaf;
        default: return iconMasjid;
    }
}

// Fungsi untuk menambahkan marker ke peta
function addMarkerToMap(location) {
    const marker = L.marker([location.lat, location.lng], {
        icon: getIconByType(location.type)
    }).addTo(map);
    
    // Tambahkan popup informasi
    marker.bindPopup(`
        <b>${location.name}</b><br>
        <small>${getTypeName(location.type)}</small><br>
        ${location.address}<br>
        <small>Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}</small>
    `);
    
    // Simpan marker dengan referensi ke lokasi
    marker.locationId = location.id;
    markers.push(marker);
}

// Fungsi untuk mendapatkan nama jenis lokasi
function getTypeName(type) {
    const types = {
        'masjid': 'Masjid',
        'sekolah': 'Sekolah Islam',
        'yayasan': 'Yayasan Islam',
        'wakaf': 'Aset Wakaf'
    };
    return types[type] || type;
}

// Fungsi untuk menambahkan lokasi baru
function addLocation() {
    const type = document.getElementById('location-type').value;
    const name = document.getElementById('location-name').value.trim();
    const address = document.getElementById('location-address').value.trim();
    const lat = parseFloat(document.getElementById('location-lat').value);
    const lng = parseFloat(document.getElementById('location-lng').value);
    
    if (!name || isNaN(lat) || isNaN(lng)) {
        alert('Harap isi nama lokasi dan koordinat yang valid!');
        return;
    }
    
    const newLocation = {
        id: Date.now(), // ID unik berdasarkan timestamp
        type,
        name,
        address,
        lat,
        lng
    };
    
    locations.push(newLocation);
    addMarkerToMap(newLocation);
    updateLocationsList();
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('location-name').value = '';
    document.getElementById('location-address').value = '';
}

// Fungsi untuk memperbarui daftar lokasi di sidebar
function updateLocationsList() {
    const listContainer = document.getElementById('locations-list');
    listContainer.innerHTML = '';
    
    locations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <div class="location-title">${location.name}</div>
            <div>
                <span class="location-type">${getTypeName(location.type)}</span>
                <small>${location.address}</small>
            </div>
        `;
        
        item.addEventListener('click', () => {
            map.setView([location.lat, location.lng], 15);
            // Buka popup marker yang sesuai
            markers.find(m => m.locationId === location.id).openPopup();
        });
        
        listContainer.appendChild(item);
    });
}

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            document.getElementById('location-lat').value = position.coords.latitude;
            document.getElementById('location-lng').value = position.coords.longitude;
            
            // Tambahkan marker lokasi pengguna
            L.marker([position.coords.latitude, position.coords.longitude], {
                icon: L.divIcon({
                    className: 'custom-icon',
                    html: '<i class="fas fa-user" style="color: #e53e3e; font-size: 20px;"></i>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map).bindPopup('Lokasi Anda saat ini').openPopup();
            
            // Zoom ke lokasi pengguna
            map.setView([position.coords.latitude, position.coords.longitude], 15);
        }, error => {
            alert('Tidak dapat mendapatkan lokasi: ' + error.message);
        });
    } else {
        alert('Geolokasi tidak didukung oleh browser Anda.');
    }
}

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
    localStorage.setItem('islamicLocations', JSON.stringify(locations));
}

// Fungsi untuk memuat data dari localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('islamicLocations');
    if (savedData) {
        locations = JSON.parse(savedData);
        locations.forEach(location => {
            addMarkerToMap(location);
        });
        updateLocationsList();
    }
}

// Fungsi untuk memfilter marker berdasarkan jenis
function filterMarkers() {
    const checkedTypes = Array.from(document.querySelectorAll('.filter-type:checked')).map(el => el.value);
    
    markers.forEach(marker => {
        const location = locations.find(loc => loc.id === marker.locationId);
        if (checkedTypes.includes(location.type)) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}

// Event listeners
document.getElementById('add-location').addEventListener('click', addLocation);
document.getElementById('get-location').addEventListener('click', getUserLocation);

// Filter event listeners
document.querySelectorAll('.filter-type').forEach(checkbox => {
    checkbox.addEventListener('change', filterMarkers);
});

// Tambahkan legenda
const legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = `
        <h4>Keterangan:</h4>
        <div><i class="fas fa-mosque" style="color: #2c7a51;"></i> Masjid</div>
        <div><i class="fas fa-school" style="color: #3182ce;"></i> Sekolah Islam</div>
        <div><i class="fas fa-hands-helping" style="color: #805ad5;"></i> Yayasan</div>
        <div><i class="fas fa-landmark" style="color: #d69e2e;"></i> Aset Wakaf</div>
    `;
    return div;
};
legend.addTo(map);

// Muat data saat pertama kali dijalankan
loadFromLocalStorage();

// Contoh data awal jika localStorage kosong
if (locations.length === 0) {
    const sampleData = [
        {
            id: 1,
            type: 'masjid',
            name: 'Masjid Agung Surabaya',
            address: 'Jl. Masjid Agung Tim. No.1, Alun-alun Contong, Kec. Bubutan, Kota SBY, Jawa Timur',
            lat: -7.2458,
            lng: 112.7378
        },
        {
            id: 2,
            type: 'sekolah',
            name: 'SD Islam Al-Azhar',
            address: 'Jl. Raya Manyar No.2, Gubeng, Kota SBY, Jawa Timur',
            lat: -7.2653,
            lng: 112.7536
        },
        {
            id: 3,
            type: 'yayasan',
            name: 'Yayasan Dana Sosial Al Falah',
            address: 'Jl. Raya Darmo Permai III No.26, Surabaya',
            lat: -7.2865,
            lng: 112.7354
        },
        {
            id: 4,
            type: 'wakaf',
            name: 'Tanah Wakaf Al-Hidayah',
            address: 'Jl. Raya Kendangsari No.45, Surabaya',
            lat: -7.3128,
            lng: 112.7221
        }
    ];
    
    sampleData.forEach(location => {
        locations.push(location);
        addMarkerToMap(location);
    });
    updateLocationsList();
    saveToLocalStorage();
}