(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  // Pon aquí TU endpoint para consultar peticiones por fecha
  const NPETICIONES_ENDPOINT = "TU_ENDPOINT_AQUI";

  let fp;

  const mostrarMsg = (texto = "") => {
    const el = $("#msgFecha");
    if (!el) return;
    el.textContent = texto;
    el.className = "info-box";
  };

  const mostrarTabla = (htmlTabla) => {
    $("#tablaPeticiones").innerHTML = htmlTabla; // aquí inyectas tu <table class="tabla-solicitudes">...</table>
    $("#resultadosBox").style.display = "block";
  };

  const ocultarTabla = () => {
    $("#resultadosBox").style.display = "none";
    $("#tablaPeticiones").innerHTML = "";
  };

  const consultarPeticiones = async (fechaISO) => {
    // fechaISO en formato YYYY-MM-DD (perfecto para backend)
    mostrarMsg("🔄 Consultando...");

    try {
      const res = await fetch(NPETICIONES_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha: fechaISO })
      });

      if (!res.ok) {
        mostrarMsg(`❌ Error al consultar (${res.status}).`);
        ocultarTabla();
        return;
      }

      // Ejemplo: si tu backend devuelve directamente HTML ya listo:
      // const htmlTabla = await res.text();

      // Ejemplo: si tu backend devuelve JSON y tú montas la tabla:
      const data = await res.json();
      // -> aquí tú crearías la tabla con data
      // Por ahora te dejo un placeholder:
      const htmlTabla = `
        <table class="tabla-solicitudes">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nº peticiones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${data.fecha ?? fechaISO}</td>
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
      ocultarTabla();
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    // Por si acaso el locale no está cargado aún, esto suele funcionar bien:
    // (en tu index usas flatpickr.l10ns.es directamente)
    const localeES = flatpickr?.l10ns?.es ?? "es";

    fp = flatpickr("#fechaConsulta", {
      mode: "single",              // ✅ selección única
      dateFormat: "Y-m-d",         // ✅ valor base en ISO (mejor para backend)
      altInput: true,              // ✅ input bonito
      altFormat: "d/m/Y",          // ✅ visual como tu web
      locale: localeES,
      allowInput: true,
      disableMobile: true,
      maxDate: "31/12/2026",

      onChange: (selectedDates, dateStr) => {
        if (!selectedDates || selectedDates.length === 0) return;

        // Como dateFormat es "Y-m-d", dateStr ya es ISO (YYYY-MM-DD)
        consultarPeticiones(dateStr);
      }
    });
  });
})();
