document.addEventListener("DOMContentLoaded", async () => {

  // ===== PROTECCIÓN =====
  const { data: { session } } = await sb.auth.getSession();

  if (!session) {
    window.location.href = "./index.html";
    return;
  }

  // ===== LOGOUT =====
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await sb.auth.signOut();
    window.location.href = "./index.html";
  });

  const form = document.getElementById("news-form");
  const list = document.getElementById("news-list");
  const msg = document.getElementById("news-msg");

  // ===== CARGAR NOTICIAS =====
  async function cargarNoticias() {
    const { data, error } = await sb
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      list.innerHTML = "<p>Error al cargar noticias</p>";
      return;
    }

    if (!data || !data.length) {
      list.innerHTML = "<p>No hay noticias aún.</p>";
      return;
    }

    list.innerHTML = data.map(n => `
      <div class="news-row">
        <div>
          <strong>${n.titulo}</strong><br>
          <small>${new Date(n.created_at).toLocaleString("es-PY")}</small>
          <p>${n.contenido}</p>
        </div>
        <button data-id="${n.id}">Eliminar</button>
      </div>
    `).join("");

    // botones eliminar
    list.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => eliminarNoticia(btn.dataset.id));
    });
  }

  // ===== CREAR NOTICIA =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("news-title").value.trim();
    const contenido = document.getElementById("news-content").value.trim();

    if (!titulo || !contenido) {
      msg.textContent = "Completa todos los campos";
      return;
    }

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

  // ===== ELIMINAR =====
  async function eliminarNoticia(id) {
    if (!confirm("¿Eliminar esta noticia?")) return;

    await sb.from("noticias").delete().eq("id", id);
    cargarNoticias();
  }

  // INIT
  cargarNoticias();
});
