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
async function saveAsPDF() {
    const element = document.getElementById("overtimeTable");
    html2canvas(element).then(async canvas => {
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

        const pdfBlob = pdf.output('blob');

        // Periksa apakah browser mendukung API File System Access
        if (window.showSaveFilePicker) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'overtime_records.pdf',
                    types: [{
                        description: 'PDF file',
                        accept: {'application/pdf': ['.pdf']}
                    }]
                });
                const writableStream = await fileHandle.createWritable();
                await writableStream.write(pdfBlob);
                await writableStream.close();
                alert('File berhasil disimpan.');
            } catch (err) {
                console.error('Gagal menyimpan file:', err);
            }
        } else {
            // Fallback untuk browser yang tidak mendukung API File System Access
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = 'overtime_records.pdf';
            link.click();
            alert('File disimpan menggunakan metode fallback.');
        }
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
