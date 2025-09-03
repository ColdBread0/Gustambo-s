document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Validación básica
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const tipo = document.getElementById('tipo').value;
    const asunto = document.getElementById('asunto').value;
    const mensaje = document.getElementById('mensaje').value;

    if (!nombre || !email || !tipo || !asunto || !mensaje) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }

    // Validación de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Por favor ingresa un correo electrónico válido.');
        return;
    }

    // Simulación de envío exitoso
    alert('¡Gracias por contactarnos! Tu mensaje ha sido enviado correctamente. Nos pondremos en contacto contigo pronto.');

    // Resetear formulario
    document.getElementById('contactForm').reset();
});