// ========================================
// SISTEMA DE SESIÓN Y NAVEGACIÓN
// ========================================

// Enlazar el botón de regresar al inicio al evento de redirección
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '../Alan/index.html';
        });
    }
});

// Enlazar el botón de cerrar sesión al evento logout
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// ========================================
// LÓGICA PRINCIPAL DE RESEÑAS
// ========================================

let reviewsData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Validación de sesión
    validateSession();
    
    // Cargar reseñas
    fetchReviews();
    
    // Configurar eventos
    setupEventListeners();
});

// Función para validar la sesión
function validateSession() {
    const usuario = sessionStorage.getItem('usuario');
    if (usuario !== 'admin') {
        alert('Acceso no autorizado. Debes iniciar sesión como administrador.');
        window.location.href = 'login.html';
    }
}

// Función para configurar eventos
function setupEventListeners() {
    // Event listener para búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterReviews);
    }
    
    // Event listeners para filtros
    const ratingFilter = document.getElementById('ratingFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (ratingFilter) {
        ratingFilter.addEventListener('change', filterReviews);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', filterReviews);
    }
}

// Función para cerrar sesión
function logout() {
    sessionStorage.removeItem('usuario');
    window.location.href = '../paginas/login.html';
}

// ========================================
// SISTEMA DE VISIBILIDAD DE RESEÑAS
// ========================================

// Variable global para trackear cambios pendientes
let pendingChanges = {};

// Event delegation para dropdowns de visibilidad
document.addEventListener('click', e => {
    // Toggle dropdown
    if (e.target.closest('.visibility-btn')) {
        const btn = e.target.closest('.visibility-btn');
        const drop = btn.nextElementSibling;
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.visibility-btn').forEach(b => b.classList.remove('active'));
        if (!drop.classList.contains('show')) {
            drop.classList.add('show');
            btn.classList.add('active');
        }
        e.stopPropagation();
    }
    // Ocultar/Mostrar reseña
    else if (e.target.closest('.dropdown-item')) {
        const item = e.target.closest('.dropdown-item');
        const card = item.closest('.review-card');
        const btn = card.querySelector('.visibility-btn');
        const text = btn.querySelector('.btn-text');
        const reviewId = card.dataset.reviewId;
        const action = item.dataset.action;
        
        if (action === 'hide') {
            // Ocultar para usuarios (solo marcar cambio - NO ocultar en admin)
            card.dataset.hidden = 'true';
            card.classList.add('hidden-review'); // Clase visual para indicar que está oculta
            text.textContent = 'Mostrar';
            btn.classList.add('showing');
            pendingChanges[reviewId] = 0;
            showMessage('Cambio marcado: Se ocultará para usuarios al guardar (visible en admin)', 'success');
        } else {
            // Mostrar a usuarios (solo marcar cambio)
            card.dataset.hidden = 'false';
            card.classList.remove('hidden-review'); // Quitar clase visual
            text.textContent = 'Visibilidad';
            btn.classList.remove('showing');
            pendingChanges[reviewId] = 1;
            showMessage('Cambio marcado: Se mostrará a usuarios al guardar', 'success');
        }
        
        updateChangesBadge();
        
        item.closest('.dropdown-content').classList.remove('show');
        btn.classList.remove('active');
    }
    // Cerrar dropdowns
    else if (!e.target.closest('.visibility-dropdown')) {
        document.querySelectorAll('.dropdown-content').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.visibility-btn').forEach(b => b.classList.remove('active'));
    }
});

// Función para actualizar visibilidad en el servidor (NO SE USA MÁS - REEMPLAZADA POR GUARDAR CAMBIOS)
function updateReviewVisibility(reviewId, isVisible) {
    // Esta función ya no se usa porque ahora guardamos por lotes
    // Se mantiene por compatibilidad pero no hace nada
    console.log('Esta función fue reemplazada por saveAllChanges()');
}

// ========================================
// FUNCIONES DE CARGA Y RENDERIZADO
// ========================================

function fetchReviews() {
    fetch('http://localhost/proyectopia/gustambos/backend/get_reviews.php')
        .then(response => response.json())
        .then(data => {
            reviewsData = data;
            // IMPORTANTE: Renderizar TODAS las reseñas sin filtrar por visibilidad
            // En el panel de administrador, todas las reseñas deben ser visibles
            renderReviews(reviewsData);
            updateStats();
        })
        .catch(err => {
            document.getElementById('reviewsList').innerHTML = '<p>Error al cargar reseñas.</p>';
        });
}

function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '';
    if (!Array.isArray(reviews) || reviews.length === 0) {
        reviewsList.innerHTML = '<p>No hay reseñas disponibles.</p>';
        return;
    }
    
    // Renderizar TODAS las reseñas (incluyendo las ocultas)
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.id = `review-${review.id}`;
        reviewCard.dataset.reviewId = review.id;
        
        // Determinar si está oculta para usuarios (pero VISIBLE en admin)
        const isHidden = review.visible === 0 || review.visible === '0' || review.hidden;
        reviewCard.dataset.hidden = isHidden ? 'true' : 'false';
        
        // Si está oculta, agregar clase visual para distinguirla
        if (isHidden) {
            reviewCard.classList.add('hidden-review');
        }
        
        const btnText = isHidden ? 'Mostrar' : 'Visibilidad';
        const btnClass = isHidden ? 'showing' : '';
        
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-details">
                        <h3>${review.name || 'Anónimo'}</h3>
                    </div>
                </div>
                <div class="review-meta">
                    <div class="rating-display">
                        ${(review.rating && review.rating > 0) ? '⭐'.repeat(review.rating) : ''}
                    </div>
                    <div class="review-date">📅 ${formatDate(review.created_at)}</div>
                </div>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
            <div class="review-actions">
                <div class="visibility-dropdown">
                    <button class="visibility-btn ${btnClass}">
                        <span class="btn-icon">👁️</span>
                        <span class="btn-text">${btnText}</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="dropdown-content">
                        <div class="dropdown-item" data-action="hide">
                            <span class="icon">🙈</span>
                            <span>Ocultar para usuarios</span>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" data-action="show">
                            <span class="icon">👁️</span>
                            <span>Mostrar a usuarios</span>
                        </div>
                    </div>
                </div>
                <button class="action-btn-small delete-btn btn-delete" onclick="deleteReview(${review.id})" data-id="${review.id}">🗑️ Eliminar</button>
            </div>
        `;
        
        // SIEMPRE agregar la tarjeta al DOM (no importa si está oculta)
        reviewsList.appendChild(reviewCard);
    });
}

// ========================================
// FUNCIONES DE FILTRADO
// ========================================

function filterReviews() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const ratingFilter = document.getElementById('ratingFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    // Filtrar por búsqueda, rating y fecha - PERO NO POR VISIBILIDAD
    let filteredReviews = reviewsData.filter(review => {
        const matchesSearch = (review.name || '').toLowerCase().includes(searchTerm);
        const matchesRating = ratingFilter === 'all' || (review.rating && review.rating.toString() === ratingFilter);
        const matchesDate = dateFilter === 'all' || checkDateFilter(review.created_at, dateFilter);
        // NO filtrar por visibilidad - mostrar todas las reseñas en el admin
        return matchesSearch && matchesRating && matchesDate;
    });
    
    renderReviews(filteredReviews);
}

function checkDateFilter(reviewDate, filter) {
    const today = new Date();
    const reviewDateObj = new Date(reviewDate);
    switch (filter) {
        case 'today':
            return reviewDateObj.toDateString() === today.toDateString();
        case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return reviewDateObj >= weekAgo;
        case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return reviewDateObj >= monthAgo;
        default:
            return true;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateStats() {
    const totalReviews = reviewsData.length;
    const averageRating = (reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / (totalReviews || 1)).toFixed(1);
    
    const totalReviewsElement = document.getElementById('totalReviews');
    const averageRatingElement = document.getElementById('averageRating');
    
    if (totalReviewsElement) {
        totalReviewsElement.textContent = totalReviews;
    }
    if (averageRatingElement) {
        averageRatingElement.textContent = averageRating;
    }
}

// ========================================
// FUNCIÓN PARA ELIMINAR RESEÑA
// ========================================

function deleteReview(reviewId) {
    console.log('=== DEBUG ELIMINAR RESEÑA ===');
    console.log('reviewId recibido:', reviewId);
    console.log('Tipo de reviewId:', typeof reviewId);
    
    if (!reviewId) {
        alert('Error: ID de reseña no válido');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
        return;
    }

    const reviewElement = document.getElementById(`review-${reviewId}`);
    if (!reviewElement) {
        alert('Error: No se encontró el elemento de la reseña');
        return;
    }
    
    reviewElement.classList.add('loading');

    console.log('Enviando datos...');
    
    const formData = new URLSearchParams();
    formData.append('id', String(reviewId));
    
    console.log('FormData creado:', formData.toString());

    fetch('http://localhost/proyectopia/gustambos/backend/delete_review.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(response => {
        console.log('Status de respuesta:', response.status);
        console.log('Headers de respuesta:', response.headers);
        return response.text();
    })
    .then(responseText => {
        console.log('Respuesta cruda del servidor:', responseText);
        
        try {
            const data = JSON.parse(responseText);
            console.log('Datos parseados:', data);
            
            if (data.status === 'success') {
                // Animar la eliminación
                reviewElement.style.transform = 'translateX(-100%)';
                reviewElement.style.transition = 'transform 0.3s ease-out';
                
                setTimeout(() => {
                    reviewElement.remove();
                    // Actualizar los datos locales
                    reviewsData = reviewsData.filter(review => review.id != reviewId);
                    updateStats();
                }, 300);
                
                showMessage('Reseña eliminada correctamente', 'success');
            } else {
                reviewElement.classList.remove('loading');
                showMessage('Error al eliminar la reseña: ' + (data.message || 'Error desconocido'), 'error');
                console.log('Error del servidor:', data);
            }
        } catch (e) {
            console.error('Error al parsear JSON:', e);
            console.log('La respuesta no es JSON válido:', responseText);
            reviewElement.classList.remove('loading');
            showMessage('Error: Respuesta inválida del servidor', 'error');
        }
    })
    .catch(error => {
        reviewElement.classList.remove('loading');
        console.error('Error de fetch:', error);
        showMessage('Error de conexión al eliminar la reseña', 'error');
    });
}

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

// Función para mostrar mensajes de estado
function showMessage(message, type) {
    const messageId = type === 'success' ? 'successMsg' : 'errorMsg';
    let messageElement = document.getElementById(messageId);
    
    // Si no existe, crear el elemento
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = messageId;
        messageElement.className = type === 'success' ? 'success-message' : 'error-message';
        document.body.appendChild(messageElement);
    }
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            messageElement.style.display = 'none';
            messageElement.style.animation = '';
        }, 300);
    }, 3000);
}

function exportReviews() {
    alert('Exportando reseñas...');
    // Aquí puedes agregar la lógica para exportar las reseñas
    // Por ejemplo, generar un CSV o PDF con los datos de reviewsData
}

function goBack() {
    window.location.href = '../Alan/index.html';
}

// ========================================
// FUNCIONES HEREDADAS (Compatibilidad)
// ========================================

// Función para enviar reseña (del HTML original)
function enviarResena() {
    const username = document.getElementById("username").value.trim() || "Anónimo";
    const content = document.getElementById("content").value.trim();
    const messageDiv = document.getElementById("message");

    messageDiv.textContent = "";

    if (!content) {
        messageDiv.textContent = "El contenido de la reseña es obligatorio.";
        return;
    }

    fetch("http://localhost/reviews/backend/crear_resena.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: username,
            content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            messageDiv.textContent = data.error;
        } else {
            document.getElementById("content").value = "";
            document.getElementById("username").value = "";
            alert("¡Reseña enviada con éxito!");
            fetchReviews(); // Recargar las reseñas después de agregar una nueva
        }
    })
    .catch(error => {
        console.error("Error al enviar reseña:", error);
        messageDiv.textContent = "Error al conectar con el servidor.";
    });
}

// ========================================
// SISTEMA DE GUARDAR CAMBIOS (MEJORADO)
// ========================================

// Función para actualizar el badge de cambios pendientes
function updateChangesBadge() {
    const changesCount = Object.keys(pendingChanges).length;
    const saveBtn = document.getElementById('saveChangesBtn');
    
    if (!saveBtn) return;
    
    // Remover badge existente
    const existingBadge = saveBtn.querySelector('.changes-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Agregar badge si hay cambios
    if (changesCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'changes-badge';
        badge.textContent = changesCount;
        saveBtn.appendChild(badge);
        saveBtn.disabled = false;
    } else {
        saveBtn.disabled = true;
    }
}

// Función para guardar todos los cambios (MEJORADA - Sin recargar reseñas)
async function saveAllChanges() {
    const changesCount = Object.keys(pendingChanges).length;
    
    if (changesCount === 0) {
        showMessage('No hay cambios pendientes para guardar', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('saveChangesBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Guardando...';
    
    let successCount = 0;
    let errorCount = 0;
    
    // Procesar cada cambio
    for (const [reviewId, visible] of Object.entries(pendingChanges)) {
        try {
            const endpoint = visible === 0
                ? 'http://localhost/proyectopia/gustambos/backend/hide_review.php'
                : 'http://localhost/proyectopia/gustambos/backend/show_review.php';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(reviewId) })
            });
            
            const data = await response.json();
            
            if (data.success) {
                successCount++;
                console.log(`✅ Reseña ${reviewId} actualizada a visible=${visible}`);
                
                // Actualizar el estado en reviewsData sin recargar
                const review = reviewsData.find(r => r.id == reviewId);
                if (review) {
                    review.visible = visible;
                    review.hidden = visible === 0;
                }
            } else {
                errorCount++;
                console.error(`❌ Error en reseña ${reviewId}:`, data.message);
            }
        } catch (error) {
            errorCount++;
            console.error(`❌ Error de conexión para reseña ${reviewId}:`, error);
        }
    }
    
    // Limpiar cambios pendientes
    pendingChanges = {};
    updateChangesBadge();
    
    // Restaurar botón
    saveBtn.innerHTML = originalText;
    
    // Mostrar resultado
    if (errorCount === 0) {
        showMessage(`✅ ${successCount} cambios guardados correctamente`, 'success');
    } else {
        showMessage(`⚠️ ${successCount} guardados, ${errorCount} fallaron`, 'error');
    }
    
    // NO recargar las reseñas - mantener el estado actual del DOM
    // Las reseñas ocultas seguirán visibles en el panel de admin
}

// Inicializar botón de guardar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveChangesBtn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.addEventListener('click', saveAllChanges);
    }
});