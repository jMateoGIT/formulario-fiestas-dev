(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5dbbacbc7cb948debbf8952366f637ad/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f3wF-ipqfNKZ3DRoQwi1UKHr55--i3lF-FYyZZZCQwQ";
  const VALIDACION_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ed2a2c35aabe4e49924cea99b944b27c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mk7U39gRRcKGJ97_Y6yJPT-QDWaz4UIecrtF28U1pEI";

  let fp;
  let empleadoValido = false;

  const mostrarMsg = (txt = "") => {
    $("#msgFecha").textContent = txt;
  };

  const toggleLoading = (loading = true) => {
    const btn = $("#btnConsultar");
    btn.disabled = loading;
    btn.classList.toggle("loading", loading);
  };

  const mostrarTabla = (html) => {
    $("#tablaPeticiones").innerHTML = html;
    $("#resultadosBox").style.display = "block";
  };

const validarEmpleadoConClave = async (numero, clave) => {
    const info = $("#nombreEmpleado");
    empleadoValido = false;

    if (!/^\d{6}$/.test(numero)) {
      info.textContent = "❌ Número inválido";
      info.className = "info-box";
      return false;
    }

    if (!clave) {
      info.textContent = "❌ Debes introducir la clave";
      info.className = "info-box";
      return false;
    }

    info.textContent = "🔐 Validando acceso...";
    info.className = "info-box";

    try {
      const res = await fetch(VALIDACION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroEmpleado: numero, clave })
      });

      if (!res.ok) {
        info.textContent = "❌ Clave incorrecta o usuario no válido";
        return false;
      }

      const datos = await res.json();

      if (datos.valido) {
        info.textContent = "✅ Acceso validado";
        info.className = "info-box";
        empleadoValido = true;
        return true;
      }

      info.textContent = "❌ Usuario o clave incorrecta";
      info.className = "info-box";
      return false;

    } catch (err) {
      console.error(err);
      info.textContent = "⚠️ Error de conexión";
      info.className = "info-box";
      return false;
    }
  };
const consultarPeticiones = async () => {
    const fecha = $("#fechaConsulta").value;
    const numeroEmpleado = $("#numEmpleado")?.value?.trim() ?? "";
    const clave = $("#claveAcceso")?.value?.trim() ?? "";

    if (!fecha) {
      mostrarMsg("❌ Selecciona una fecha.");
      return;
    }

    const ok = await validarEmpleadoConClave(numeroEmpleado, clave);
    if (!ok) {
      mostrarMsg("❌ Número de empleado o clave no válidos.");
      return;
    }

    try {
      toggleLoading(true);
      mostrarMsg("🔄 Consultando...");

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha })
      });

      if (!res.ok) {
        mostrarMsg(`❌ Error (${res.status})`);
        return;
      }

      const data = await res.json();

      const filas = data.map((item) => `
        <tr>
          <td>${item.posicionFecha ?? "-"}</td>
          <td>${item.fechaSolicitud ?? "-"}</td>
          <td>${item.numeroNomina ?? "-"}</td>
        </tr>
      `).join("");

      const htmlTabla = `
        <table class="tabla-solicitudes tabla-npeticiones">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Fecha</th>
              <th>Número nómina</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>
      `;

      mostrarMsg("");
      mostrarTabla(htmlTabla);

    } catch (err) {
      console.error(err);
      mostrarMsg("⚠️ Error de conexión.");
    } finally {
      toggleLoading(false);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    fp = flatpickr("#fechaConsulta", {
      mode: "single",
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "d/m/Y",
      locale: flatpickr.l10ns.es,
      allowInput: true,
      maxDate: "2026-12-31"
    });

    $("#btnConsultar").addEventListener("click", consultarPeticiones);
  });
})();