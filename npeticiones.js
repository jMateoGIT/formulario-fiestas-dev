document.getElementById("btnConsultar").addEventListener("click", async () => {
  const numero = document.getElementById("numEmpleado").value.trim();
  const clave = document.getElementById("claveAcceso").value.trim();
  const fecha = document.getElementById("fechaConsulta").value.trim();

  const msg = document.getElementById("msgFecha");
  const resultadosBox = document.getElementById("resultadosBox");

  const NPETICIONES_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5dbbacbc7cb948debbf8952366f637ad/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f3wF-ipqfNKZ3DRoQwi1UKHr55--i3lF-FYyZZZCQwQ";
  const VALIDACION_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ed2a2c35aabe4e49924cea99b944b27c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mk7U39gRRcKGJ97_Y6yJPT-QDWaz4UIecrtF28U1pEI";

  // Validaciones básicas
  if (!/^\d{6}$/.test(numero)) {
    msg.textContent = "❌ Número inválido";
    return;
  }

  if (!clave) {
    msg.textContent = "❌ Debes introducir la clave";
    return;
  }

  if (!fecha) {
    msg.textContent = "❌ Selecciona una fecha.";
    return;
  }

  msg.textContent = "🔐 Validando acceso...";

  try {
    // 1) Validación
    const validacion = await fetch(VALIDACION_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroEmpleado: numero, clave })
    });

    if (!validacion.ok) {
      msg.textContent = "❌ Clave incorrecta o usuario no válido";
      return;
    }

    const resVal = await validacion.json();
    if (!resVal.valido) {
      msg.textContent = "❌ Usuario o clave incorrecta";
      return;
    }

    msg.textContent = "📄 Obteniendo peticiones...";

    // 2) Consulta peticiones por fecha
    const peticiones = await fetch(NPETICIONES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha })
    });

    if (!peticiones.ok) {
      msg.textContent = "❌ Error al obtener las peticiones";
      return;
    }

    const datos = await peticiones.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      msg.textContent = "⚠️ No hay peticiones registradas para esa fecha.";
      resultadosBox.style.display = "none";
      document.getElementById("tablaPeticiones").innerHTML = "";
      return;
    }

    msg.textContent = "";
    resultadosBox.style.display = "block";
    renderizarTabla(datos);

  } catch (err) {
    console.error(err);
    msg.textContent = "⚠️ Error de conexión";
  }
});

// Tabla para npeticiones
function renderizarTabla(peticiones) {
  const contenedor = document.getElementById("tablaPeticiones");

  contenedor.innerHTML = `
    <table class="tabla-solicitudes tabla-npeticiones">
      <thead>
        <tr>
          <th style="text-align:center;">Posición</th>
          <th style="text-align:center;">Fecha</th>
          <th style="text-align:center;">Número nómina</th>
        </tr>
      </thead>
      <tbody>
        ${peticiones.map(p => `
          <tr>
            <td style="text-align:center;">${p.posicionFecha ?? "-"}</td>
            <td style="text-align:center;">${p.fechaSolicitud ?? "-"}</td>
            <td style="text-align:center;">${p.numeroNomina ?? "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  flatpickr("#fechaConsulta", {
    mode: "single",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d/m/Y",
    locale: flatpickr.l10ns.es,
    allowInput: true,
    maxDate: "2026-12-31"
  });
});
