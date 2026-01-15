// ================= SUPABASE =================
console.log("supabase.js cargado correctamente");

const SUPABASE_URL = "https://hbjiaacngivpjdsxppwv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiamlhYWNuZ2l2cGpkc3hwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTcyOTcsImV4cCI6MjA4Mzg5MzI5N30.bRwi5itih7foAfyniyRnfqcNU0WI6t3c5JUeP_Zzmxc";

// cliente único
const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const qs = (s) => document.querySelector(s);

// ================= PROGRAMAS =================
async function cargarProgramas() {
  const grid = qs("#programas-grid");
  if (!grid) return;

  const { data, error } = await sb
    .from("programas")
    .select("titulo,descripcion")
    .eq("activo", true)
    .order("orden");

  if (error || !data?.length) {
    grid.innerHTML = "<p>Programas en preparación.</p>";
    return;
  }

  grid.innerHTML = data.map(p => `
    <article class="program-card">
      <h3>${p.titulo}</h3>
      <p>${p.descripcion}</p>
    </article>
  `).join("");
}

// ================= NOTICIAS (INDEX) =================
async function cargarNoticias() {
  const grid = qs("#noticias-grid");
  if (!grid) return;

  const { data, error } = await sb
    .from("noticias")
    .select("titulo,contenido,created_at,imagen_url")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data?.length) {
    grid.innerHTML = "<p>No hay noticias publicadas.</p>";
    return;
  }

  grid.innerHTML = data.map(n => `
    <article class="news-card" onclick='abrirNoticia(${JSON.stringify(n)})'>
      
      ${n.imagen_url ? `<img src="${n.imagen_url}" alt="${n.titulo}">` : ""}

      <span class="news-date">
        ${new Date(n.created_at).toLocaleDateString("es-PY", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })}
      </span>

      <h3>${n.titulo}</h3>

      <p>
        ${n.contenido.replace(/<[^>]*>/g, "").slice(0,120)}...
      </p>
    </article>
  `).join("");
}

// ================= NOTICIAS (TODAS - NOTICIAS.HTML) =================
async function cargarNoticiasTodas() {
  const grid = qs("#noticias-grid");
  if (!grid) return;

  const { data, error } = await sb
    .from("noticias")
    .select("titulo,contenido,created_at,imagen_url")
    .eq("publicado", true)
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    grid.innerHTML = "<p>No hay noticias publicadas.</p>";
    return;
  }

  grid.innerHTML = data.map(n => `
    <article class="news-card" onclick='abrirNoticia(${JSON.stringify(n)})'>
      
      ${n.imagen_url ? `<img src="${n.imagen_url}" alt="${n.titulo}">` : ""}

      <span class="news-date">
        ${new Date(n.created_at).toLocaleDateString("es-PY", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })}
      </span>

      <h3>${n.titulo}</h3>

      <p>
        ${n.contenido.replace(/<[^>]*>/g, "").slice(0,220)}...
      </p>
    </article>
  `).join("");
}

// ================= MODAL NOTICIA COMPLETA =================
window.abrirNoticia = function(noticia) {
  qs("#modal-title").innerText = noticia.titulo;
  qs("#modal-content").innerHTML = noticia.contenido;

  qs("#modal-date").innerText =
    new Date(noticia.created_at).toLocaleDateString("es-PY", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

  const img = qs("#modal-image");
  if (noticia.imagen_url) {
    img.src = noticia.imagen_url;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  // 🔒 bloquear scroll del fondo
  document.body.style.overflow = "hidden";

  qs("#news-overlay").classList.add("active");
};

// Cerrar con botón
qs("#closeNews")?.addEventListener("click", cerrarModal);

// Cerrar tocando fondo
qs("#news-overlay")?.addEventListener("click", (e) => {
  if (e.target.id === "news-overlay") {
    cerrarModal();
  }
});

function cerrarModal() {
  qs("#news-overlay").classList.remove("active");
  document.body.style.overflow = "";
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  cargarProgramas();
  cargarNoticias();
});
