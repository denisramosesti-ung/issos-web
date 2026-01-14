document.addEventListener("DOMContentLoaded", async () => {

  // ================= PROTECCIÓN DE SESIÓN =================
  const { data: sessionData, error: sessionError } = await sb.auth.getSession();

  if (sessionError) {
    console.error("Error obteniendo sesión:", sessionError);
    window.location.href = "./index.html";
    return;
  }

  if (!sessionData || !sessionData.session) {
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

  // ================= ELEMENTOS =================
  const form = document.getElementById("news-form");
  const list = document.getElementById("news-list");
  const msg = document.getElementById("news-msg");

  if (!form || !list || !msg) {
    console.error("Elementos del formulario no encontrados");
    return;
  }

  // ================= CARGAR NOTICIAS =================
  async function cargarNoticias() {
    const { data, error } = await sb
      .from("noticias")
      .select("id, titulo, contenido, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando noticias:", error);
      list.innerHTML = "<p>Error al cargar noticias</p>";
      return;
    }

    if (!data || data.length === 0) {
      list.innerHTML = "<p>No hay noticias aún.</p>";
      return;
    }

    list.innerHTML = data.map(n => `
      <div class="news-row">
        <strong>${n.titulo}</strong>
        <small style="display:block;margin:4px 0;">
          ${new Date(n.created_at).toLocaleString("es-PY")}
        </small>
        <p>${n.contenido}</p>
        <button onclick="eliminarNoticia(${n.id})">Eliminar</button>
      </div>
    `).join("");
  }

  // ================= CREAR NOTICIA =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("news-title").value.trim();
    const contenido = document.getElementById("news-content").value.trim();

    console.log("SUBMIT EJECUTADO");
    console.log("DATOS:", titulo, contenido);

    if (!titulo || !contenido) {
      msg.textContent = "Completá todos los campos";
      return;
    }

    msg.textContent = "Publicando...";

    const { data, error } = await sb
      .from("noticias")
      .insert({
        titulo,
        contenido
      });

    if (error) {
      console.error("ERROR SUPABASE INSERT:", error);
      msg.textContent = error.message;
      return;
    }

    console.log("INSERT OK:", data);
    msg.textContent = "Noticia publicada correctamente ✔";

    form.reset();
    cargarNoticias();
  });

  // ================= ELIMINAR NOTICIA =================
 async function eliminarNoticia(id) {
  if (!confirm("¿Eliminar esta noticia?")) return;

  const { error } = await sb
    .from("noticias")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar la noticia");
    console.error(error);
    return;
  }

  cargarNoticias();
}

  // ================= INIT =================
  cargarNoticias();
});
