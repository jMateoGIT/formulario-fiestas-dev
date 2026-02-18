document.getElementById("btnAcceder").addEventListener("click", async () => {
  const numero = document.getElementById("numEmpleado").value.trim();
  const clave = document.getElementById("claveAcceso").value.trim();
  const msg = document.getElementById("msgLogin");
  const resultadosBox = document.getElementById("resultadosBox");

  const SOLICITUD_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/229d484cf71c410d96dc286bd3fbdf07/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=h95XkrdCRv0ZLBN4qm2leDEKQ8uOC8y6KEGOq_9RKT0";
  const VALIDACION_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ed2a2c35aabe4e49924cea99b944b27c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mk7U39gRRcKGJ97_Y6yJPT-QDWaz4UIecrtF28U1pEI";

  if (!/^\d{6}$/.test(numero)) {
    msg.textContent = "❌ Número inválido";
    return;
  }

  if (!clave) {
    msg.textContent = "❌ Debes introducir la clave";
    return;
  }

  msg.textContent = "🔐 Validando acceso...";

  try {
    // PRIMER FLUJO: Validar empleado
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

    msg.textContent = "📄 Obteniendo solicitudes...";

    // SEGUNDO FLUJO: Obtener solicitudes
    const solicitudes = await fetch(SOLICITUD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroEmpleado: numero })
    });

    if (!solicitudes.ok) {
      msg.textContent = "❌ Error al obtener las solicitudes";
      return;
    }

    const datos = await solicitudes.json();
    if (datos.length === 0) {
      msg.textContent = "⚠️ No hay solicitudes registradas.";
      return;
    }

    msg.textContent = "";
    document.getElementById("loginBox").style.display = "none";
    resultadosBox.style.display = "block";
    renderizarTabla(datos);
  } catch (err) {
    console.error(err);
    msg.textContent = "⚠️ Error de conexión";
  }
});

function renderizarTabla(solicitudes) {
  const contenedor = document.getElementById("tablaSolicitudes");

  contenedor.innerHTML = `
    <table class="tabla-solicitudes">
      <thead>
        <tr>
          <th style="text-align:center;">Fecha solicitud</th>
          <th style="text-align:center;">Fecha solicitada</th>
          <th style="text-align:center;">Estado</th>
          <th>Comentario</th>
        </tr>
      </thead>
      <tbody>
        ${solicitudes.map(sol => {
          const estado = (sol.estado || "").toLowerCase();
          let claseEstado = "badge badge-pendiente";

          if (estado === "aprobada") claseEstado = "badge badge-aprobado";
          else if (estado === "rechazada") claseEstado = "badge badge-rechazado";

          return `
            <tr>
              <td data-label="Fecha solicitud" style="text-align:center;">${sol.fechaSolicitud}</td>
              <td data-label="Fecha solicitada" style="text-align:center;">${sol.fechasSolicitadas}</td>
              <td data-label="Estado" style="text-align:center;">
                <span class="${claseEstado}">${sol.estado}</span>
              </td>
              <td data-label="Comentario">${sol.comentario || ""}</td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}


