

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses son de 0 a 11
    const year = now.getFullYear();

    const formattedTime = `${hours}:${minutes}:${seconds}`;
    const formattedDate = `${day}/${month}/${year}`;

    document.getElementById('clock').textContent = `${formattedDate} ${formattedTime}`;
}

setInterval(updateClock, 1000);
updateClock(); // Llamar inmediatamente para evitar el retraso de 1 segundo
