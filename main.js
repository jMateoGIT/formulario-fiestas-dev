(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const PETICION_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2035cd8f81154fcc9743ba4b231a1a3f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hnisqrnQWFowIURJQ_tSUxRSrVDvWZbjqCF9jR9XHbA";
  const VALIDACION_ENDPOINT = "https://defaulte75a677e41004431b89ee574d8d990.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/ed2a2c35aabe4e49924cea99b944b27c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mk7U39gRRcKGJ97_Y6yJPT-QDWaz4UIecrtF28U1pEI";

  let fp;
  let empleadoValido = false;

  const toggleLoading = (loading = true) => {
    const btn = $("#btnEnviar");
    btn.disabled = loading;
    btn.classList.toggle("loading", loading);
  };

const validarEmpleadoConClave = async (numero, clave) => {
  const info = $("#nombreEmpleado");
  empleadoValido = false;

  if (!/^\d{6}$/.test(numero)) {
    info.textContent = "❌ Número inválido";
    info.className = "info-box";
    return;
  }

  if (!clave) {
    info.textContent = "❌ Debes introducir la clave";
    info.className = "info-box";
    return;
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
      return;
    }

    const datos = await res.json();
    if (datos.valido) {
      info.textContent = "✅ Acceso validado";
      info.className = "info-box";
      empleadoValido = true;
    } else {
      info.textContent = "❌ Usuario o clave incorrecta";
      info.className = "info-box";
    }
  } catch (err) {
    console.error(err);
    info.textContent = "⚠️ Error de conexión";
    info.className = "info-box";
  }
};


function throttle(fn, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

  document.addEventListener("DOMContentLoaded", () => {


  const min = new Date();
  min.setDate(min.getDate() + 7);

    fp = flatpickr("#fechas", {
      mode: "multiple",
      dateFormat: "Y-m-d",   // formato backend
      altFormat: "d/m/Y",    // visual
      locale: flatpickr.l10ns.es,
      allowInput: true,
      conjunction: ", ",
      minDate: min, 
      maxDate: "2026-12-31"
    });

    const inputNumero = $("#numeroJDE");
    const inputEmail = $("#email");
    const inputClave = $("#claveAcceso");

    inputNumero.addEventListener("blur", () => {
      const numero = inputNumero.value.trim();
      const clave = inputClave.value.trim();
      validarEmpleadoConClave(numero, clave);
    });

    inputClave.addEventListener("blur", () => {
      const numero = inputNumero.value.trim();
      const clave = inputClave.value.trim();
      validarEmpleadoConClave(numero, clave);
    });

    $("#formFiestas").addEventListener("submit", async (e) => {
      e.preventDefault();

      const numeroEmpleado = inputNumero.value.trim();
      const fechas = $("#fechas").value.trim();
      const correo = inputEmail.value.trim();
      const clave = $("#claveAcceso").value.trim();

      if (!/^\d{6}$/.test(numeroEmpleado)) {
        inputNumero.setCustomValidity("Formato inválido");
        inputNumero.reportValidity();
        return;
      } else {
        inputNumero.setCustomValidity("");
      }

      await validarEmpleadoConClave(numeroEmpleado, clave);

      if (!empleadoValido) {
        mostrarMensaje("❌ Número de empleado o clave no válidos.", "error");
       return;
      }

      if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        inputEmail.setCustomValidity("Formato de correo inválido");
        inputEmail.reportValidity();
        return;
      } else {
        inputEmail.setCustomValidity("");
      }
      

      if (!fechas) {
        mostrarMensaje("❌ Debes seleccionar una o más fechas.", "error");
        return;
      }

      $("#fechasSolicitadas").value = fechas;

      const body = {
        empleado: numeroEmpleado,
        email: correo,
        fechasSolicitadas: fechas,
        comentario: $("#comentario").value.trim()
      };

      try {
        toggleLoading(true);
        const res = await fetch(PETICION_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        if (res.status === 200 || res.status === 202) {
          mostrarMensaje("✅ Solicitud enviada correctamente.");
          e.target.reset();
          inputClave.value = "";
          fp.clear();
          $("#nombreEmpleado").textContent = "";
          empleadoValido = false;
        } else {
          mostrarMensaje(`❌ Error al enviar la solicitud (${res.status}).`, "error");
        }
      } catch (err) {
        console.error(err);
        mostrarMensaje("⚠️ Error de conexión.", "error");
      } finally {
        toggleLoading(false);
      }
    });
  });
})();

