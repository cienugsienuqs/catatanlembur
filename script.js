// Data storage
let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
let currentProfile = '';

document.addEventListener('DOMContentLoaded', () => {
    populateProfiles();
    updateTable();
    updateProfileDropdown();
});

function populateProfiles() {
    const select = document.getElementById('userProfileSelect');
    select.innerHTML = '<option value="">Pilih Profil</option>';
    Object.keys(profiles).forEach(profile => {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        select.appendChild(option);
    });
}

function updateProfileDropdown() {
    const select = document.getElementById('userProfileSelect');
    select.value = currentProfile;
}

function createProfile() {
    const profileName = prompt('Masukkan nama profil:');
    if (profileName && !profiles[profileName]) {
        profiles[profileName] = [];
        currentProfile = profileName;
        localStorage.setItem('profiles', JSON.stringify(profiles));
        populateProfiles();
        updateProfileDropdown();
    }
}

function deleteProfile() {
    if (currentProfile) {
        delete profiles[currentProfile];
        localStorage.setItem('profiles', JSON.stringify(profiles));
        currentProfile = '';
        populateProfiles();
        updateProfileDropdown();
        updateTable();
    }
}

function loadProfile() {
    const select = document.getElementById('userProfileSelect');
    currentProfile = select.value;
    updateTable();
}

function addOvertime() {
    if (!currentProfile) {
        alert('Pilih profil terlebih dahulu.');
        return;
    }

    const date = document.getElementById('dateInput').value;
    const startTime = document.getElementById('startTimeInput').value;
    const endTime = document.getElementById('endTimeInput').value;
    const hourlyRate = parseFloat(document.getElementById('hourlyRateInput').value);
    const notes = document.getElementById('notesInput').value;

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    const totalSalary = hours * hourlyRate;

    if (date && startTime && endTime && !isNaN(hours) && hours > 0) {
        const overtimeData = {
            date,
            startTime,
            endTime,
            hours: hours.toFixed(2),
            hourlyRate: hourlyRate.toFixed(2),
            totalSalary: totalSalary.toFixed(2),
            notes
        };

        profiles[currentProfile].push(overtimeData);
        localStorage.setItem('profiles', JSON.stringify(profiles));
        updateTable();
    } else {
        alert('Isi semua data dengan benar.');
    }
}

function updateTable() {
    const tbody = document.querySelector('#overtimeTable tbody');
    tbody.innerHTML = '';
    
    if (currentProfile && profiles[currentProfile]) {
        let totalOvertime = 0;
        let totalSalary = 0;
        
        profiles[currentProfile].forEach((data, index) => {
            totalOvertime += parseFloat(data.hours);
            totalSalary += parseFloat(data.totalSalary);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.date}</td>
                <td>${data.startTime}</td>
                <td>${data.endTime}</td>
                <td>${data.hours}</td>
                <td>${data.hourlyRate}</td>
                <td>${data.totalSalary}</td>
                <td>${data.notes}</td>
                <td><button onclick="deleteEntry(${index})">Hapus</button></td>
            `;
            tbody.appendChild(row);
        });
        
        document.getElementById('totalOvertime').textContent = totalOvertime.toFixed(2);
        document.getElementById('totalSalary').textContent = totalSalary.toFixed(2);
    }
}

function deleteEntry(index) {
    if (currentProfile && profiles[currentProfile]) {
        profiles[currentProfile].splice(index, 1);
        localStorage.setItem('profiles', JSON.stringify(profiles));
        updateTable();
    }
}

function removeAllOvertime() {
    if (currentProfile) {
        profiles[currentProfile] = [];
        localStorage.setItem('profiles', JSON.stringify(profiles));
        updateTable();
    }
}

function saveAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.text('Catatan Lembur', 10, 10);
    
    const table = document.getElementById('overtimeTable');
    html2canvas(table).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 20);
        doc.save('catatan-lembur.pdf');
    });
}

function sendToWhatsApp() {
    if (currentProfile) {
        let message = `Catatan Lembur ${currentProfile}:\n`;
        profiles[currentProfile].forEach(data => {
            message += `Tanggal: ${data.date}, Jam Mulai: ${data.startTime}, Jam Selesai: ${data.endTime}, Total Lembur: ${data.hours} jam, Total Gaji: ${data.totalSalary} \n`;
        });
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
    } else {
        alert('Pilih profil terlebih dahulu.');
    }
}

function saveToDevice() {
    if (currentProfile) {
        const blob = new Blob([JSON.stringify(profiles[currentProfile], null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProfile}-data.json`;
        a.click();
        URL.revokeObjectURL(url);
    } else {
        alert('Pilih profil terlebih dahulu.');
    }
}
document.addEventListener("DOMContentLoaded", function () {
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function updateDateTime() {
    const now = new Date();
    
    // Format tanggal
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}/${month}/${year}`;
    
    // Format waktu
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById("calendarView").textContent = dateString;
    document.getElementById("clock").textContent = timeString;
}
