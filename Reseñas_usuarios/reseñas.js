function enviarResena(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim() || "Anónimo";
    const content  = document.getElementById("content").value.trim();
    const messageDiv = document.getElementById("message"); // ✅ ahora está definida

    messageDiv.textContent = "";
    console.log(content, username);

    if (!content) {
        messageDiv.textContent = "El contenido de la reseña es obligatorio.";
        return;
    }

    fetch("http://localhost/proyectopia/gustambos/backend/crear_resenas.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: username,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            messageDiv.textContent = data.error;
        } else {
            document.getElementById("content").value  = "";
            document.getElementById("username").value = "";
            alert("¡Reseña enviada con éxito!");
        }
    })
    .catch(error => {
        console.error("Error al enviar reseña:", error);
        messageDiv.textContent = "Error al conectar con el servidor.";
    });
}