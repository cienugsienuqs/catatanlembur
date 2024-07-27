// Fungsi untuk memperbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    document.getElementById("calendar").textContent = dateString;
    document.getElementById("clock").textContent = timeString;
}

// Memperbarui tanggal dan waktu setiap detik
setInterval(updateDateTime, 1000);

// Memperbarui tanggal dan waktu saat halaman pertama kali dimuat
updateDateTime();

// Sisanya tetap sama seperti sebelumnya
document.addEventListener("DOMContentLoaded", function () {
    const savedOvertime = JSON.parse(localStorage.getItem("overtimeData")) || [];

    const tableBody = document.querySelector("#overtimeTable tbody");

    savedOvertime.forEach((data) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.date}</td>
            <td>${data.startTime}</td>
            <td>${data.endTime}</td>
            <td>${data.totalHours}</td>
            <td>${data.hourlyRate}</td>
            <td>${data.totalSalary}</td>
            <td>${data.notes}</td>
            <td><button onclick="removeRow(this)">Hapus</button></td>
        `;
        tableBody.appendChild(row);
    });

    updateTotalOvertime();
    updateTotalSalary();
});

function addOvertime() {
    const date = document.getElementById("dateInput").value;
    const startTime = document.getElementById("startTimeInput").value;
    const endTime = document.getElementById("endTimeInput").value;
    const hourlyRate = document.getElementById("hourlyRateInput").value;
    const notes = document.getElementById("notesInput").value;

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const totalHours = (end - start) / (1000 * 60 * 60);
    const totalSalary = totalHours * parseFloat(hourlyRate);

    const newData = {
        date: date,
        startTime: startTime,
        endTime: endTime,
        totalHours: totalHours.toFixed(2),
        hourlyRate: hourlyRate,
        totalSalary: totalSalary.toFixed(2),
        notes: notes
    };

    const overtimeData = JSON.parse(localStorage.getItem("overtimeData")) || [];
    overtimeData.push(newData);
    localStorage.setItem("overtimeData", JSON.stringify(overtimeData));

    // Tambahkan baris baru ke tabel tanpa memuat ulang halaman
    const tableBody = document.querySelector("#overtimeTable tbody");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${date}</td>
        <td>${startTime}</td>
        <td>${endTime}</td>
        <td>${totalHours.toFixed(2)}</td>
        <td>${hourlyRate}</td>
        <td>${totalSalary.toFixed(2)}</td>
        <td>${notes}</td>
        <td><button onclick="removeRow(this)">Hapus</button></td>
    `;
    tableBody.appendChild(row);

    // Reset form
    document.getElementById("dateInput").value = "";
    document.getElementById("startTimeInput").value = "";
    document.getElementById("endTimeInput").value = "";
    document.getElementById("notesInput").value = "";

    // Perbarui total lembur dan total gaji
    updateTotalOvertime();
    updateTotalSalary();
}

function removeRow(button) {
    const row = button.closest("tr");
    const index = row.rowIndex - 1; // Index array dimulai dari 0

    let overtimeData = JSON.parse(localStorage.getItem("overtimeData")) || [];
    overtimeData.splice(index, 1);
    localStorage.setItem("overtimeData", JSON.stringify(overtimeData));

    // Hapus baris dari tabel
    row.remove();

    // Perbarui total lembur dan total gaji
    updateTotalOvertime();
    updateTotalSalary();
}

function removeAllOvertime() {
    localStorage.removeItem("overtimeData");

    // Hapus semua baris dari tabel
    const tableBody = document.querySelector("#overtimeTable tbody");
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Perbarui total lembur dan total gaji
    updateTotalOvertime();
    updateTotalSalary();
}

function updateTotalOvertime() {
    const overtimeData = JSON.parse(localStorage.getItem("overtimeData")) || [];
    const totalHours = overtimeData.reduce((acc, curr) => acc + parseFloat(curr.totalHours), 0);
    document.getElementById("totalOvertime").textContent = totalHours.toFixed(2);
}

function updateTotalSalary() {
    const overtimeData = JSON.parse(localStorage.getItem("overtimeData")) || [];
    const totalSalary = overtimeData.reduce((acc, curr) => acc + parseFloat(curr.totalSalary), 0);
    document.getElementById("totalSalary").textContent = totalSalary.toFixed(2);
}
function saveAsPDF() {
    const element = document.getElementById("overtimeTable");
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;
        const newHeight = pdfWidth / ratio;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, newHeight);
        pdf.save('overtime_records.pdf');
    });
}

function sendToWhatsApp() {
    const element = document.getElementById("overtimeTable");
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(imgData)}`;
        window.open(whatsappUrl, '_blank');
    });
}
// Fungsi untuk menyimpan tabel ke dalam format PDF dan mengizinkan pengguna untuk menyimpannya di smartphone
function saveToDevice() {
    const element = document.getElementById("overtimeTable");
    html2canvas(element).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;
        const newHeight = pdfWidth / ratio;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, newHeight);
        pdf.save('overtime_records.pdf');
    });
}
let lastLanguage = 'id'; // Default language is Indonesian

// Fungsi untuk mengubah bahasa
function toggleLanguage(lang) {
    lastLanguage = lang; // Update the last selected language
    const elements = document.querySelectorAll('h1, button, label, p, td, th');
    elements.forEach(element => {
        const text = element.textContent;
        switch (lang) {
            case 'id':
                element.textContent = translateToIndonesian(text);
                break;
            case 'en':
                element.textContent = translateToEnglish(text);
                break;
            case 'jp':
                element.textContent = translateToJapanese(text);
                break;
            default:
                // Handle other elements or leave as is
                break;
        }
    });
}

// Fungsi untuk menerjemahkan ke bahasa Indonesia
function translateToIndonesian(text) {
    switch (text) {
        case 'Overtime Notes':
            return 'Catatan Lembur';
        case 'Add Overtime':
            return 'Tambah Lembur';
        case 'Remove All':
            return 'Hapus Semua';
        case 'Save as PDF':
            return 'Simpan sebagai PDF';
        case 'Send to WhatsApp':
            return 'Kirim ke WhatsApp';
        case 'Save to Smartphone':
            return 'Simpan ke Smartphone';
        case 'Date':
            return 'Tanggal';
        case 'Start Time':
            return 'Jam Mulai';
        case 'End Time':
            return 'Jam Selesai';
        case 'Hourly Rate':
            return 'Gaji per Jam';
        case 'Notes':
            return 'Catatan';
        case 'Total Overtime':
            return 'Total Lembur Keseluruhan';
        case 'Total Salary':
            return 'Total Gaji Keseluruhan';
        case 'Total Lembur (Jam)':
            return 'Total Lembur (Jam)';
        case 'Total Gaji':
            return 'Total Gaji';
        case 'Aksi':
            return 'Aksi';
        case 'Delete':
            return 'Hapus';
        default:
            return text;
    }
}
// Fungsi untuk menerjemahkan ke bahasa Inggris
function translateToEnglish(text) {
    switch (text) {
        case 'Catatan Lembur':
            return 'Overtime Notes';
        case 'Tambah Lembur':
            return 'Add Overtime';
        case 'Hapus Semua':
            return 'Remove All';
        case 'Simpan sebagai PDF':
            return 'Save as PDF';
        case 'Kirim ke WhatsApp':
            return 'Send to WhatsApp';
        case 'Simpan ke Smartphone':
            return 'Save to Smartphone';
        case 'Tanggal':
            return 'Date';
        case 'Jam Mulai':
            return 'Start Time';
        case 'Jam Selesai':
            return 'End Time';
        case 'Gaji per Jam':
            return 'Hourly Rate';
        case 'Catatan':
            return 'Notes';
        case 'Total Lembur Keseluruhan':
            return 'Total Overtime';
        case 'Total Gaji Keseluruhan':
            return 'Total Salary';
        case 'Total Lembur (Jam)':
            return 'Total Overtime (Hours)';
        case 'Total Gaji':
            return 'Total Salary';
        case 'Aksi':
            return 'Action';
        case 'Hapus':
            return 'Delete';
        default:
            return text;
    }
}
// Fungsi untuk menghapus baris dari tabel
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    // Perbarui total lembur dan total gaji
    updateTotals();
}

// Fungsi untuk menambahkan lembur
function addOvertime() {
    // Implementasi untuk menambahkan lembur
}

// Fungsi untuk menghapus semua lembur
function removeAllOvertime() {
    // Implementasi untuk menghapus semua lembur
}

// Fungsi untuk menyimpan sebagai PDF
function saveAsPDF() {
    // Implementasi untuk menyimpan sebagai PDF
}

// Fungsi untuk mengirim ke WhatsApp
function sendToWhatsApp() {
    // Implementasi untuk mengirim ke WhatsApp
}

// Fungsi untuk menyimpan ke perangkat
function saveToDevice() {
    // Implementasi untuk menyimpan ke perangkat
}

// Fungsi untuk memperbarui total lembur dan total gaji
function updateTotals() {
    // Implementasi untuk memperbarui total lembur dan total gaji
}
