// ================= SUPABASE =================
const SUPABASE_URL = "https://hbjiaacngivpjdsxppwv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiamlhYWNuZ2l2cGpkc3hwcHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTcyOTcsImV4cCI6MjA4Mzg5MzI5N30.bRwi5itih7foAfyniyRnfqcNU0WI6t3c5JUeP_Zzmxc";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const qs = (s) => document.querySelector(s);

// ================= LOGIN =================
async function login(e) {
    e.preventDefault();

    const msg = qs("#login-msg");
    msg.textContent = "Ingresando...";

    const email = qs("#login-email").value;
    const password = qs("#login-password").value;

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
        msg.textContent = "Credenciales incorrectas.";
        return;
    }

    qs("#login-section").style.display = "none";
    qs("#admin-section").style.display = "block";

    cargarNoticias();
    cargarProgramas();
}

// ================= NOTICIAS =================
async function cargarNoticias() {
    const list = qs("#news-list");

    const { data } = await sb
        .from("noticias")
        .select("*")
        .order("fecha", { ascending: false });

    list.innerHTML = data.map(n => `
        <div class="admin-row">
            <div>
                <strong>${n.titulo}</strong><br>
                <small>${n.fecha} · ${n.publicado ? "Publicado" : "Borrador"}</small>
            </div>
            <div class="admin-actions">
                <button onclick="editarNoticia('${n.id}')" class="btn btn-text">Editar</button>
                <button onclick="eliminarNoticia('${n.id}')" class="btn btn-text danger">Eliminar</button>
            </div>
        </div>
    `).join("");
}

async function guardarNoticia(e) {
    e.preventDefault();

    const id = qs("#news-id").value;

    const payload = {
        titulo: qs("#news-title").value,
        resumen: qs("#news-summary").value,
        fecha: qs("#news-date").value,
        publicado: qs("#news-published").checked
    };

    if (id) {
        await sb.from("noticias").update(payload).eq("id", id);
    } else {
        await sb.from("noticias").insert(payload);
    }

    qs("#news-form").reset();
    qs("#news-id").value = "";
    qs("#news-msg").textContent = "Guardado correctamente";

    cargarNoticias();
}

async function editarNoticia(id) {
    const { data } = await sb.from("noticias").select("*").eq("id", id).single();

    qs("#news-id").value = data.id;
    qs("#news-title").value = data.titulo;
    qs("#news-summary").value = data.resumen;
    qs("#news-date").value = data.fecha;
    qs("#news-published").checked = data.publicado;
}

async function eliminarNoticia(id) {
    if (!confirm("¿Eliminar esta noticia?")) return;
    await sb.from("noticias").delete().eq("id", id);
    cargarNoticias();
}

// ================= PROGRAMAS =================
async function cargarProgramas() {
    const list = qs("#program-list");

    const { data } = await sb
        .from("programas")
        .select("*")
        .order("orden");

    list.innerHTML = data.map(p => `
        <div class="admin-row">
            <div>
                <strong>${p.titulo}</strong><br>
                <small>${p.activo ? "Activo" : "Inactivo"}</small>
            </div>
            <div class="admin-actions">
                <button onclick="editarPrograma('${p.id}')" class="btn btn-text">Editar</button>
                <button onclick="eliminarPrograma('${p.id}')" class="btn btn-text danger">Eliminar</button>
            </div>
        </div>
    `).join("");
}

async function guardarPrograma(e) {
    e.preventDefault();

    const id = qs("#program-id").value;

    const payload = {
        titulo: qs("#program-title").value,
        descripcion: qs("#program-description").value,
        activo: qs("#program-active").checked
    };

    if (id) {
        await sb.from("programas").update(payload).eq("id", id);
    } else {
        await sb.from("programas").insert(payload);
    }

    qs("#program-form").reset();
    qs("#program-id").value = "";
    qs("#program-msg").textContent = "Guardado correctamente";

    cargarProgramas();
}

async function editarPrograma(id) {
    const { data } = await sb.from("programas").select("*").eq("id", id).single();

    qs("#program-id").value = data.id;
    qs("#program-title").value = data.titulo;
    qs("#program-description").value = data.descripcion;
    qs("#program-active").checked = data.activo;
}

async function eliminarPrograma(id) {
    if (!confirm("¿Eliminar este programa?")) return;
    await sb.from("programas").delete().eq("id", id);
    cargarProgramas();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
    qs("#login-form").addEventListener("submit", login);
    qs("#news-form").addEventListener("submit", guardarNoticia);
    qs("#program-form").addEventListener("submit", guardarPrograma);

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        qs("#login-section").style.display = "none";
        qs("#admin-section").style.display = "block";
        cargarNoticias();
        cargarProgramas();
    }
});
