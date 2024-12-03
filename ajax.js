// Variables globales
let paginaActual = 1;
let ultimaBusqueda = "";
let totalResults = 0;
let puedeCargarMas = false;
let cargando = false;
let debounceTimeout; 
let chartInstance;


window.onload = () => {
// Evento para buscar mientras escribes con debounce
 document.getElementById("cajaTexto").addEventListener("input", () => {
 clearTimeout(debounceTimeout);
 debounceTimeout = setTimeout(() => {
 let peliABuscar = document.getElementById("cajaTexto").value.trim();
    if (peliABuscar.length >= 3 && peliABuscar !== ultimaBusqueda) {
     ultimaBusqueda = peliABuscar;
     iniciarNuevaBusqueda(); 
     peticionAJAXModerna();}
        }, 500); // 
    });

 // Evento para el botón de buscar
 document.getElementById("btn").addEventListener("click", () => {
 let peliABuscar = document.getElementById("cajaTexto").value.trim();
  if (peliABuscar.length >= 3) {
  ultimaBusqueda = peliABuscar;
  iniciarNuevaBusqueda(); 
  peticionAJAXModerna(); }
    });
};

// Función para reiniciar variables y limpiar la interfaz al iniciar una nueva búsqueda
function iniciarNuevaBusqueda() {
 paginaActual = 1;
 totalResults = 0;
 puedeCargarMas = false;
 cargando = false;
 document.getElementById("lista").innerHTML = "";
 document.getElementById("numeroResultados").innerHTML = "";
 document.getElementById("crearInforme").style.display = "none";
}

// Función para ocultar la sección de landing (si la tienes)
function ocultarLanding() {
 document.getElementById("landing").style.display = "none";
 document.querySelector("header").style.display = "block";
 document.querySelector("main").style.display = "block";
}

// Función principal para realizar la petición a la API
function peticionAJAXModerna() {
 let peliABuscar = document.getElementById("cajaTexto").value.trim();
 let tipoBusqueda = document.querySelector('input[name="tipoBusqueda"]:checked').value;
 ultimaBusqueda = peliABuscar;

 if (!peliABuscar) {
  cargando = false;
  return; }

 let loading = document.getElementById("loading");
 loading.style.display = "block";
 cargando = true;

 fetch(`https://www.omdbapi.com/?apikey=78f3d167&s=${encodeURIComponent(peliABuscar)}&type=${tipoBusqueda}&page=${paginaActual}`)
 .then((res) => res.json())
 .then((datosRecibidos) => {
  loading.style.display = "none";
  cargando = false;
if (datosRecibidos.Response === "True") {
 manejarResultados(datosRecibidos); 
 } else {
 manejarError("No se encontraron resultados. Por favor, verifica tu búsqueda.");
     }
      })
 .catch((err) => {
  loading.style.display = "none";
  cargando = false;
  console.error("Error en la petición:", err);
  manejarError("Error al realizar la búsqueda. Por favor, intenta de nuevo más tarde.");
    });
}

// Manejar Resultadps
function manejarResultados(datosRecibidos) {
 if (paginaActual === 1) {
  totalResults = parseInt(datosRecibidos.totalResults) || 0; 
   document.getElementById("numeroResultados").innerHTML = `se han encontrado ${totalResults} resultados.`;
  document.getElementById("lista").innerHTML = ""; }

 if (totalResults > 0) {
   document.getElementById("crearInforme").style.display = "block";
   } else {
    document.getElementById("crearInforme").style.display = "none";
  }
  let miLista = document.getElementById("lista");

 // Verificar si Search existe y no está vacío
 if (datosRecibidos.Search && datosRecibidos.Search.length > 0) {
  datosRecibidos.Search.forEach((resultado) => {
  let li = document.createElement("li");
  li.innerHTML = `${resultado.Title} - ${resultado.Year}`;

  let img = document.createElement("img");
  img.src = resultado.Poster !== "N/A" ? resultado.Poster : "img/rollo.png";
  img.alt = `Póster de ${resultado.Title}`;
  img.onerror = () => { img.src = "img/rollo.png";};

  li.appendChild(img);
  li.setAttribute("data-imdbid", resultado.imdbID);

// Evento para mostrar detalle
  li.addEventListener("click", () => detalle(resultado.imdbID));
  miLista.appendChild(li);
});

// Actualizar la posibilidad de cargar más resultados
 puedeCargarMas = paginaActual * 10 < totalResults;
 } else {
  miLista.innerHTML = "<p>No se encontraron resultados para la búsqueda realizada.</p>";
   puedeCargarMas = false; 
  }
}

// Función para manejar errores y mostrar mensajes al usuario
function manejarError(mensaje) {
 document.getElementById("numeroResultados").innerHTML = mensaje;
 document.getElementById("lista").innerHTML = "";
 puedeCargarMas = false;
 document.getElementById("crearInforme").style.display = "none";
}

// Función para cargar más resultados al hacer scroll
window.addEventListener('scroll', () => {
if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)) {
 if (puedeCargarMas && !cargando) { verMas();
  }
   }
});

// Función para cargar más resultados (siguiente página)
function verMas() {
 if (puedeCargarMas && !cargando) {
 paginaActual++;
 peticionAJAXModerna();
  }
}

// Función para mostrar detalles de una película al hacer clic
function detalle(idPelicula) {
 const url = `https://www.omdbapi.com/?apikey=78f3d167&i=${idPelicula}`;
 let loading = document.getElementById("loading");
 loading.style.display = "block";

 fetch(url)
  .then((res) => res.json())
  .then((datosRecibidos) => {
   loading.style.display = "none";

   if (datosRecibidos.Response === "True") {
   mostrarDetalle(datosRecibidos);
   } else {
     manejarError("No se pudo obtener el detalle de la película.");
}
 })
 .catch((err) => {
   loading.style.display = "none";
   console.error("Error al obtener los detalles:", err);
   manejarError("Error al obtener los detalles de la película.");
   });
}

// Función para mostrar el detalle de la película seleccionada
 function mostrarDetalle(datos) {
    document.getElementById("resultado").style.display = "none";
    document.getElementById("detalle").style.display = "block";

 let valoracionesHTML = datos.Ratings
  ? datos.Ratings.map((rating) => `<p><strong>${rating.Source}:</strong> ${rating.Value}</p>`).join("")
  : "<p>No hay valoraciones disponibles.</p>";

 document.getElementById("detalle").innerHTML = `
  <button onclick="volverAlListado()">⬅ Volver</button>
  <h3>${datos.Title}</h3>
  <img src="${datos.Poster !== "N/A" ? datos.Poster : "img/rollo.png"}" alt="Póster de ${datos.Title}" />
  <p><strong>Director:</strong> ${datos.Director}</p>
  <p><strong>Actores:</strong> ${datos.Actors}</p>
  <p><strong>Sinopsis:</strong> ${datos.Plot}</p>
  <p><strong>Año:</strong> ${datos.Year}</p>
  <h4>Valoraciones:</h4>
    ${valoracionesHTML}`;
}

// Función para volver al listado de resultados desde el detalle
function volverAlListado() {
    document.getElementById("resultado").style.display = "block";
    document.getElementById("detalle").style.display = "none";
}

// Función para crear el informe y generar las gráficas
function crearInforme() {
    const listaPeliculas = Array.from(document.querySelectorAll("#lista li"));
    const idsPeliculas = listaPeliculas.map((li) => li.getAttribute("data-imdbid"));
    const idsParaInforme = idsPeliculas.slice(0, 10);

// Mostrar indicador de carga
    const loading = document.getElementById("loading");
    if (loading) loading.style.display = "block";

// Crear un array de promesas para obtener detalles de cada película
 const promesasDetalles = idsParaInforme.map((id) =>
  fetch(`https://www.omdbapi.com/?apikey=78f3d167&i=${id}`)
  .then((res) => res.json())
  .then((detalle) => ({
   title: detalle.Title || "Sin título",
   imdbRating: parseFloat(detalle.imdbRating) || 0,
   Recaudacion: detalle.BoxOffice
   ? parseFloat(detalle.BoxOffice.replace(/[\$,]/g, "")) || 0
   : 0,
   votes: detalle.imdbVotes
   ? parseInt(detalle.imdbVotes.replace(/,/g, "")) || 0
   : 0,
    }))
  .catch((error) => {
     console.error(`Error obteniendo detalles para ID ${id}:`, error);
     return null; 
     })
    );

 Promise.all(promesasDetalles)
 .then((peliculasData) => {
  if (loading) loading.style.display = "none";
  peliculasData = peliculasData.filter((peli) => peli !== null);
  if (peliculasData.length === 0) {
  manejarError("No se pudieron generar los informes debido a errores en los datos.");
    return;
}

 // Ocultar la sección de resultados
 const resultadoSection = document.querySelector("#resultado");
  if (resultadoSection) {
   resultadoSection.style.display = "none";
   } else {
  console.error("La sección #resultado no existe en el DOM.");}

 // Mostrar y limpiar la sección de informes
  const informeSection = document.querySelector("#informe");
  if (!informeSection) {
  console.error("La sección #informe no existe en el DOM.");
  return;}

 informeSection.style.display = "block";
 informeSection.innerHTML = ""; 

 //  informes para cada métrica
 generarInformeIndividual(peliculasData, "imdbRating", "Puntuación IMDb");
   generarInformeIndividual(peliculasData, "Recaudacion", "Recaudación (USD$)");
 generarInformeIndividual(peliculasData, "votes", "Votos (IMDb Votes)");

 // Añadir el botón "Volver a resultados" al final
  const botonVolver = document.createElement("button");
  botonVolver.id = "volverAResultados";
  botonVolver.innerText = "⬅ Volver a resultados";
  botonVolver.onclick = volverAResultados;
  informeSection.appendChild(botonVolver);
    })
 .catch((err) => {
    if (loading) loading.style.display = "none";
   console.error("Error al generar el informe:", err);
   manejarError(
   "Ocurrió un error al generar el informe. Por favor, intenta nuevamente.");
    });

// Función para generar informes individuales
function generarInformeIndividual(peliculas, opcion, etiqueta) {
  // Ordenar las películas según la métrica
  const peliculasOrdenadas = peliculas.sort((a, b) => b[opcion] - a[opcion]);
  const informeContainer = document.createElement("div");
  informeContainer.className = "informe-individual";
  const titulo = document.createElement("h3");
  titulo.innerText = `Informe de ${etiqueta}`;
  informeContainer.appendChild(titulo);
  const listaInforme = document.createElement("ul");
   peliculasOrdenadas.slice(0, 5).forEach((peli) => {
  const valor =
  opcion === "Recaudacion" ? `${peli[opcion]} USD$` : peli[opcion];
 const li = document.createElement("li");
  li.innerText = `${peli.title} - ${etiqueta}: ${valor}`;
  listaInforme.appendChild(li);
});

 informeContainer.appendChild(listaInforme);
    // Crear el canvas para la gráfica
 const canvas = document.createElement("canvas");
 canvas.id = `grafica-${opcion}`;
 informeContainer.appendChild(canvas);
 document.querySelector("#informe").appendChild(informeContainer);
 generarGrafica(canvas.id, peliculasOrdenadas.slice(0, 5), opcion, etiqueta);
}

// Función para generar gráficas con Chart.js
function generarGrafica(canvasId, peliculas, opcion, etiqueta) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) { console.error("Elemento canvas para gráfica no encontrado.");
    return;
}

 const ctx = canvas.getContext("2d");
 const labels = peliculas.map((p) => p.title);
 const data = peliculas.map((p) => p[opcion]);

 new Chart(ctx, {
   type: "bar",
   data: {
    labels: labels,
     datasets: [
       {
      label: `Top 5 películas por ${etiqueta}`,
       data: data,
       backgroundColor: "rgba(229, 9, 20, 0.7)",
       borderColor: "rgba(229, 9, 20, 1)",
      borderWidth: 1,},
            ],
        },
     options: {
     responsive: true,
     scales: {
     y: { beginAtZero: true },
       },
      },
    });
}

function volverAResultados() {
 const resultadoSection = document.querySelector("#resultado");
 if (resultadoSection) {
   resultadoSection.style.display = "block";
  } else {
  console.error("No se encuentra la sección de resultados (#resultado)");
  }
 const informeSection = document.querySelector("#informe");
 if (informeSection) {
     informeSection.style.display = "none";
  } else {
   console.error("No se encuentra la sección de informes (#informe)");
   }
}
}