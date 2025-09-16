
// Lógica para cargar, filtrar, ocultar y eliminar reseñas en el panel de administrador

let reviewsData = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchReviews();
});

function fetchReviews() {
    fetch('http://localhost/ProyectoPIA/gustambos/backend/get_reviews.php')
        .then(response => response.json())
        .then(data => {
            reviewsData = data;
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
    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
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
                <button class="action-btn-small hide-btn" onclick="hideReview(${review.id})">🙈 Ocultar</button>
                <button class="action-btn-small delete-btn" onclick="deleteReview(${review.id})">🗑️ Eliminar</button>
            </div>
        `;
        reviewsList.appendChild(reviewCard);
    });
}

function filterReviews() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const ratingFilter = document.getElementById('ratingFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredReviews = reviewsData.filter(review => {
        const matchesSearch = (review.name || '').toLowerCase().includes(searchTerm);
        const matchesRating = ratingFilter === 'all' || (review.rating && review.rating.toString() === ratingFilter);
        const matchesDate = dateFilter === 'all' || checkDateFilter(review.created_at, dateFilter);
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
    document.getElementById('totalReviews').textContent = totalReviews;
    document.getElementById('averageRating').textContent = averageRating;
    // Puedes agregar más estadísticas si lo deseas
}

function deleteReview(reviewId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        fetch('http://localhost/ProyectoPIA/gustambos/backend/delete_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Reseña eliminada correctamente');
                fetchReviews();
            } else {
                alert('Error al eliminar: ' + (data.message || ''));
            }
        })
        .catch(() => alert('Error de conexión con el servidor.'));
    }
}

function hideReview(reviewId) {
    if (confirm('¿Seguro que quieres ocultar esta reseña?')) {
        fetch('http://localhost/ProyectoPIA/gustambos/backend/hide_review.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: reviewId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Reseña ocultada correctamente');
                fetchReviews();
            } else {
                alert('Error al ocultar: ' + (data.message || ''));
            }
        })
        .catch(() => alert('Error de conexión con el servidor.'));
    }
}

function exportReviews() {
    alert('Exportando reseñas...');
}

function goBack() {
    window.location.href = '../Alan/index.html';
}
