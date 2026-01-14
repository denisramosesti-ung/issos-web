// ================= SUPABASE =================
const SUPABASE_URL = "https://hbjiaacngivpjdsxppwv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiamlhYWNuZ2l2cGpkc3hwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTcyOTcsImV4cCI6MjA4Mzg5MzI5N30.bRwi5itih7foAfyniyRnfqcNU0WI6t3c5JUeP_Zzmxc";

// 👉 cliente único (NO usar nombre "supabase")
const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// helper
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
      <div class="program-content">
        <h3>${p.titulo}</h3>
        <p>${p.descripcion}</p>
      </div>
    </article>
  `).join("");
}

// ================= NOTICIAS =================
async function cargarNoticias() {
  const grid = qs("#noticias-grid");
  if (!grid) return;

  const { data, error } = await sb
    .from("noticias")
    .select("titulo,contenido,created_at")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    grid.innerHTML = "<p>No hay noticias publicadas.</p>";
    return;
  }

  grid.innerHTML = data.map(n => `
    <article class="news-card">
      <h3>${n.titulo}</h3>
      <p>${n.contenido}</p>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProgramas();
  cargarNoticias();
});
