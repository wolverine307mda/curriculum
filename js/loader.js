document.addEventListener("DOMContentLoaded", function() {
    // Oculta el loader después de un tiempo
    setTimeout(function() {
        document.getElementById("loader").style.display = "none"; // Oculta el loader
        document.querySelector(".contenido").style.display = "block"; // Muestra el contenido
    }, 1000); // Ajusta el tiempo de espera si necesitas más o menos tiempo
});
