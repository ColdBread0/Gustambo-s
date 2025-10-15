// Función para regresar al inicio
function goBack() {
    window.location.href = '../Alan/index.html';
}

// Función para enviar reseña
function enviarResena(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim() || "Anónimo";
    const content  = document.getElementById("content").value.trim();
    const messageDiv = document.getElementById("message");

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
            // Recargar las reseñas para mostrar la nueva
            cargarResenas();
        }
    })
    .catch(error => {
        console.error("Error al enviar reseña:", error);
        messageDiv.textContent = "Error al conectar con el servidor.";
    });
}

// FUNCIÓN PARA CARGAR SOLO RESEÑAS VISIBLES (usuarios)
function cargarResenas() {
    const resenasContainer = document.getElementById("resenas");
    const loadingMessage = document.getElementById("loading");

    // Mostrar spinner de carga
    loadingMessage.style.display = "block";
    resenasContainer.innerHTML = "";

    // Hacer petición al servidor para obtener TODAS las reseñas
    fetch("http://localhost/proyectopia/gustambos/backend/get_reviews.php")
    .then(response => response.json())
    .then(data => {
        // DEBUG: Ver qué datos llegan
        console.log("Datos recibidos del servidor:", data);
        
        // Ocultar spinner
        loadingMessage.style.display = "none";

        // Si hay error o no es un array
        if (!Array.isArray(data)) {
            resenasContainer.innerHTML = `
                <div class="empty-message">
                    <p>Error al cargar las reseñas</p>
                    <p class="empty-subtitle">Formato de datos incorrecto</p>
                </div>
            `;
            return;
        }

        // FILTRAR SOLO LAS RESEÑAS VISIBLES (visible = 1)
        const resenasVisibles = data.filter(resena => resena.visible == 1 || resena.visible === '1');
        
        console.log(`Total de reseñas: ${data.length}, Visibles: ${resenasVisibles.length}`);

        // Si no hay reseñas visibles
        if (resenasVisibles.length === 0) {
            resenasContainer.innerHTML = `
                <div class="empty-message">
                    <p>No hay reseñas visibles aún.</p>
                    <p class="empty-subtitle">Sé el primero en compartir tu experiencia.</p>
                </div>
            `;
            return;
        }

        // Mostrar SOLO las reseñas visibles
        let resenasHTML = "";
        resenasVisibles.forEach(resena => {
            const rating = resena.rating ? "⭐".repeat(parseInt(resena.rating)) : "";
            const fecha = resena.created_at ? new Date(resena.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : "";
            
            resenasHTML += `
                <div class="review">
                    <div class="review-header">
                        <span class="review-username">${resena.name}</span>
                        ${rating ? `<span class="review-rating">${rating}</span>` : ""}
                    </div>
                    ${fecha ? `<div class="review-date">${fecha}</div>` : ""}
                    <div class="review-content">${resena.content}</div>
                </div>
            `;
        });

        resenasContainer.innerHTML = resenasHTML;
    })
    .catch(error => {
        console.error("Error al cargar reseñas:", error);
        loadingMessage.style.display = "none";
        resenasContainer.innerHTML = `
            <div class="empty-message">
                <p>Error al conectar con el servidor</p>
                <p class="empty-subtitle">Por favor, intenta nuevamente más tarde.</p>
            </div>
        `;
    });
}

// Cargar reseñas automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarResenas();
});