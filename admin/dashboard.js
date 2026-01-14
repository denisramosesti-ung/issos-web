document.addEventListener("DOMContentLoaded", async () => {

  // ===== PROTECCIÓN =====
  const { data } = await sb.auth.getSession();

  if (!data.session) {
    window.location.href = "./index.html";
    return;
  }

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await sb.auth.signOut();
      window.location.href = "./index.html";
    });
  }

});

