(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/5dbbacbc7cb948debbf8952366f637ad/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=f3wF-ipqfNKZ3DRoQwi1UKHr55--i3lF-FYyZZZCQwQ";

  let fp;

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

  const consultarPeticiones = async () => {

    const fecha = $("#fechaConsulta").value;
console.log("VALOR FECHA:", fecha);
console.log("TIPO:", typeof fecha);
    if (!fecha) {
      mostrarMsg("❌ Selecciona una fecha.");
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


      const htmlTabla = `
        <table class="tabla-solicitudes">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Número nómina</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.fechaSolicitud}</td>
              <td>${data.numeroNomina}</td>
            </tr>
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
      dateFormat: "Y-m-d",   // formato backend
      altInput: true,
      altFormat: "d/m/Y",    // visual
      locale: flatpickr.l10ns.es,
      allowInput: true,
      maxDate: "2026-12-31"
    });

    $("#btnConsultar").addEventListener("click", consultarPeticiones);

  });
})();
