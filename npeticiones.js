(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const ENDPOINT = "TU_ENDPOINT_AQUI";

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
              <th>Total peticiones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${fecha}</td>
              <td>${data.total ?? "-"}</td>
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
