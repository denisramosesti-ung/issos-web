document.addEventListener("DOMContentLoaded", async () => {

  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error-msg");

  // ===== LOGIN =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMsg.textContent = "Ingresando...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorMsg.textContent = "Email o contraseña incorrectos";
      return;
    }

    // Login OK → dashboard
    window.location.href = "./dashboard.html";
  });

});
