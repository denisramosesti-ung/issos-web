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

  // ================= EDITOR VISUAL =================
  const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Escribí la noticia…"
  });

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
    console.error(error);
    list.innerHTML = "<p>Error al cargar noticias</p>";
    return;
  }


    if (!data.length) {
      list.innerHTML = "<p>No hay noticias aún.</p>";
      return;
    }

    list.innerHTML = data.map(n => `
  <div class="news-row" style="
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
  ">
    <div>
      <strong>${n.titulo}</strong><br>
      <small>${new Date(n.fecha).toLocaleDateString("es-PY")}</small>
      <br>
      <small style="color:${n.publicado ? 'green' : 'gray'}">
        ${n.publicado ? 'Publicado' : 'Borrador'}
      </small>
    </div>

    <div style="display:flex; gap:8px;">
      <button class="btn-toggle" data-id="${n.id}" data-publicado="${n.publicado}">
        ${n.publicado ? "Ocultar" : "Publicar"}
      </button>
      <button class="btn-delete" data-id="${n.id}">
        Eliminar
      </button>
    </div>
  </div>
  <hr>
`).join("");


    // ===== PUBLICAR / OCULTAR =====
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

    // ===== ELIMINAR =====
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
    const imageInput = document.getElementById("news-image");
    const imageFile = imageInput.files[0];

    const fecha = document.getElementById("news-date").value;
    const contenido = quill.root.innerHTML;

   msg.textContent = "Guardando noticia...";

let imagen_url = null;

if (imageFile) {
  // nombre único para evitar choques
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExt}`;
  const filePath = `noticias/${fileName}`;

  // subir al bucket "noticias"
  const { error: uploadError } = await sb.storage
    .from("noticias")
    .upload(filePath, imageFile, { upsert: true });

  if (uploadError) {
  console.error("UPLOAD ERROR:", uploadError);
  msg.textContent = uploadError.message || "Error al subir imagen";
  return;
}


  // obtener URL pública
  const { data: publicData } = sb.storage
    .from("noticias")
    .getPublicUrl(filePath);

  imagen_url = publicData.publicUrl;
}

const { error } = await sb.from("noticias").insert({
  titulo,
  contenido,
  imagen_url,   // <-- guardamos URL final aquí
  fecha,
  publicado: false
});



    if (error) {
      msg.textContent = "Error al guardar";
      return;
    }

    form.reset();
    quill.setText("");
    msg.textContent = "Noticia guardada (borrador)";
    cargarNoticias();
  });

  // INIT
  cargarNoticias();
});
