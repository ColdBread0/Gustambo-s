document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost/proyectopia/gustambos/backend/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    console.log(res.status);
    
    const data = await res.json();
  document.getElementById("msg").innerText = data.message;
    console.log(data)

    if (data.success) {

      document.getElementById("msg").style.color = "green";
      sessionStorage.setItem("usuario", "admin");
      window.location.href = "../panel_admin/panel.html";
    } else {
      document.getElementById("msg").style.color = "red";
    }
  } catch (error) {
  document.getElementById("msg").innerText = "Error de conexión con el servidor.";
  document.getElementById("msg").style.color = "red";
  }
});


