const SUPABASE_URL = "https://hbjiaacngivpjdsxppwv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiamlhYWNuZ2l2cGpkc3hwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTcyOTcsImV4cCI6MjA4Mzg5MzI5N30.bRwi5itih7foAfyniyRnfqcNU0WI6t3c5JUeP_Zzmxc";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
// Cargar textos institucionales
// ===============================
async function cargarConfiguracion() {
  const { data, error } = await supabase
    .from("configuracion")
    .select("*");

  if (error) {
    console.error("Error config:", error);
    return;
  }

  const map = {};
  data.forEach(item => {
    map[item.clave] = item.contenido;
  });

  document.getElementById("home-texto").innerText = map.home_texto || "";
  document.getElementById("quienes-somos").innerText = map.quienes_somos || "";
  document.getElementById("porque-issos").innerText = map.porque_issos || "";
  document.getElementById("mision").innerText = map.mision || "";
  document.getElementById("vision").innerText = map.vision || "";
  document.getElementById("valores").innerText = map.valores || "";
}

// ===============================
// Cargar noticias
// ===============================
async function cargarNoticias() {
  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .eq("publicado", true)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error noticias:", error);
    return;
  }

  const contenedor = document.getElementById("lista-noticias");
  contenedor.innerHTML = "";

  data.forEach(noticia => {
    const article = document.createElement("article");

    article.innerHTML = `
      <h3>${noticia.titulo}</h3>
      <small>${noticia.fecha}</small>
      <p>${noticia.contenido}</p>
    `;

    contenedor.appendChild(article);
  });
}

// ===============================
// Inicializar
// ===============================
cargarConfiguracion();
cargarNoticias();
