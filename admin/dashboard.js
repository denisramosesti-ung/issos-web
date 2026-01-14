document.addEventListener("DOMContentLoaded", async () => {

  // ================= PROTECCIÓN =================
  const { data } = await sb.auth.getSession();

  if (!data.session) {
    window.location.href = "./index.html";
    return;
  }

  // ================= LOGOUT =================
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await sb.auth.signOut();
      window.location.href = "./index.html";
    });
  }

  const form = document.getElementById("news-form");
  const list = document.getElementById("news-list");
  const msg = document.getElementById("news-msg");

  // ================= CARGAR NOTICIAS =================
  async function cargarNoticias() {
    const { data, error } = await sb
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      list.innerHTML = "<p>Error al cargar noticias</p>";
      return;
    }

    if (!data.length) {
      list.innerHTML = "<p>No hay noticias aún.</p>";
      return;
    }

    list.innerHTML = data.map(n => `
  <div class="news-row">
    <strong>${n.titulo}</strong><br>
    <small>${new Date(n.created_at).toLocaleString("es-PY")}</small>
    <p>${n.contenido}</p>

    <button class="btn-toggle" data-id="${n.id}" data-publicado="${n.publicado}">
      ${n.publicado ? "Ocultar" : "Publicar"}
    </button>

    <button class="btn-delete" data-id="${n.id}">Eliminar</button>
    <hr>
  </div>
`).join("");

document.querySelectorAll(".btn-toggle").forEach(btn => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const publicado = btn.dataset.publicado === "true";

    const { error } = await sb
      .from("noticias")
      .update({ publicado: !publicado })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar estado");
      return;
    }

    cargarNoticias();
  });
});


    // 👉 enlazar botones luego de renderizar
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;

        if (!confirm("¿Eliminar esta noticia?")) return;

        const { error } = await sb
          .from("noticias")
          .delete()
          .eq("id", id);

        if (error) {
          alert("Error al eliminar");
          return;
        }

        cargarNoticias();
      });
    });
  }

  // ================= CREAR NOTICIA =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("news-title").value.trim();
    const contenido = document.getElementById("news-content").value.trim();

    msg.textContent = "Publicando...";

    const { error } = await sb
      .from("noticias")
      .insert({ titulo, contenido });

    if (error) {
      msg.textContent = "Error al publicar";
      return;
    }

    form.reset();
    msg.textContent = "Noticia publicada";
    cargarNoticias();
  });

  // INIT
  cargarNoticias();
});
