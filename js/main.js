// Palabra clave de activación
const ordenPrefijo = "ALEXA"; 

// Espera a que todo el contenido de la página esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const outputText = document.getElementById("outputText");
  const msgText = document.getElementById("msgText");
  const startBtn = document.getElementById("startBtn");

  let recognition;
  let escuchando = false;

  // Verifica si el navegador soporta reconocimiento de voz
  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;
  } else {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  // Inicia el reconocimiento de voz si no se está escuchando ya
  function iniciarReconocimiento() {
    if (!escuchando) {
      escuchando = true;
      recognition.start();
      outputText.innerHTML = "🎤 Escuchando... Di 'Alexa' seguido de una orden.";
      msgText.innerHTML = "";
    }
  }

  // Detiene el reconocimiento y actualiza estado
  function detenerReconocimiento() {
    recognition.stop();
    escuchando = false;
    outputText.innerHTML = "🛑 Reconocimiento detenido.";
  }

  // Evento cuando se detecta un resultado de voz
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toUpperCase();
    console.log("🔊 Frase reconocida:", transcript);

    // Verifica si se dijo salir
    if (transcript === "SALIR" || transcript.startsWith("ALEXA SALIR")) {
      detenerReconocimiento();
      msgText.innerHTML = "Sesión finalizada por comando de voz.";
      return;
    }

    // Verifica si la frase inicia con el prefijo
    if (transcript.startsWith(ordenPrefijo)) {
      outputText.innerHTML = `🗣️ Frase detectada: <strong>${transcript}</strong>`;
      enviarComando(transcript);
    } else {
      // No mostrar mensaje si no comienza con el prefijo
      console.log("Frase ignorada (sin prefijo al inicio).");
    }
  };

  // Manejo de errores
  recognition.onerror = (event) => {
    console.error("❌ Error:", event.error);
    msgText.innerHTML = "Error en el reconocimiento de voz.";
    setTimeout(iniciarReconocimiento, 2000); 
  };

  // Reinicia la escucha cuando finaliza
  recognition.onend = () => {
    escuchando = false;
    setTimeout(iniciarReconocimiento, 500); 
  };

  // Activa el reconocimiento al hacer clic en el botón
  startBtn.addEventListener("click", iniciarReconocimiento);
});

// Enviar el comando a la API y mostrar la respuesta como texto
function enviarComando(frase) {
  fetch("http://3.233.222.108/api-gpt-php/endpoints/chat.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: frase })
  })
    .then(res => res.json())
    .then(data => {
      const respuesta = data.data.reply || "No se recibió respuesta.";
      console.log("🤖 Respuesta:", respuesta);
      const outputText = document.getElementById("outputText");
      outputText.innerHTML += `<br>🤖 <strong>${respuesta}</strong>`;
    })
    .catch(err => {
      console.error("❌ Error enviando comando:", err);
      document.getElementById("msgText").innerHTML = "No se pudo conectar con la API.";
      setTimeout(() => recognition.start(), 2000);
    });
}
