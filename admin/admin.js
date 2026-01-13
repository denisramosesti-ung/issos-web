document.addEventListener("DOMContentLoaded", async () => {

  // Detectar sesión
  const { data: { session } } = await supabase.auth.getSession();

  const isLoginPage = location.pathname.endsWith("/admin/") ||
                      location.pathname.endsWith("/admin/index.html");

  const isDashboard = location.pathname.includes("dashboard.html");

  // PROTECCIÓN DE DASHBOARD
  if (isDashboard && !session) {
    window.location.href = "./";
    return;
  }

  // SI YA ESTÁ LOGUEADO → DASHBOARD
  if (isLoginPage && session) {
    window.location.href = "dashboard.html";
    return;
  }

  // LOGIN
  const form = document.getElementById("login-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("error-msg");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        errorMsg.textContent = "Credenciales incorrectas";
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "./";
    });
  }

});
