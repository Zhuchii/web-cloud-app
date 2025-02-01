FilePond.registerPlugin();



FilePond.create(document.querySelector('.filepond'), {
    server: {
        url: '/upload_file', 
        process: {
            url: '',
            method: 'POST',
            onload: (response) => {
                return response;
            },
            onerror: (error) => {
                document.getElementById("error_message").innerText = `Error al subir el archivo: ${error}`;
                var tl = new TimelineLite();
                tl.to(".upload_message_error", 0.7, {
                    transform: "translateY(0px)"
                })
            },
            ondata: (formData) => {
                var rutaactual = document.getElementById("mostrar_ruta").getAttribute("data-ruta");
                formData.append('ruta', rutaactual);  
                return formData; 
            }
        }
    },
    allowMultiple: true,
    maxFileSize: '10MB',
    labelIdle: 'Arrastra y suelta tus archivos o <span class="filepond--label-action">Explora</span>',
    labelFileProcessing: 'Subiendo archivo...',
    labelFileProcessingComplete: 'Subida exitosa!',
    labelFileProcessingError: 'Error al subir el archivo',
    labelTapToCancel: 'Toca para cancelar'
});


function formatoLegible(bytes) {
    if (bytes<0){
        return "0 B"
    }
    if (bytes >= Math.pow(1024, 3)) {
        return (bytes / Math.pow(1024, 3)).toFixed(2) + ' GB';
    } else if (bytes >= Math.pow(1024, 2)) {
        return (bytes / Math.pow(1024, 2)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' B';
}



    var nav_control = 1;

    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        lineNumbers: true,
        mode: "javascript",
        theme: "default",
    });
    editor.setSize(null, "65vh");
    document.querySelectorAll('p[data-codificado]').forEach(function(li) {
        let carpetaDecodificada = atob(li.getAttribute('data-codificado'));
        let archivo_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
        li.textContent = archivo_formateado;
    });
    document.querySelectorAll('.barra_menu li').forEach(function(li) {
        li.addEventListener('click', function(event) {
            const clickeado = event.currentTarget;
            const anterior = clickeado.previousElementSibling;
            const siguiente = clickeado.nextElementSibling;
            
            if (clickeado.getAttribute("data-click")!="NOCLICKEABLE"){
            document.querySelectorAll('.barra_menu li').forEach(function(otherLi) {
                otherLi.classList.remove('activo');
                otherLi.classList.remove("effect_arriba");
                otherLi.classList.remove("effect_abajo");
                otherLi.classList.remove("effect_arriba_cerrado");
                otherLi.classList.remove("effect_abajo_cerrado");
            });
            if (nav_control==1){
            
            anterior.classList.add("effect_arriba");
            siguiente.classList.add("effect_abajo");
            clickeado.classList.add('activo');
            }
            else if(nav_control==0){
                anterior.classList.add("effect_arriba_cerrado");
                siguiente.classList.add("effect_abajo_cerrado");
                clickeado.classList.add('activo');
            }
        }
        });
    });

    function nav_alternar(){
        var nav = document.getElementById("barra_lateral");
        var tl = new TimelineLite();
        if (nav_control==1){
            nav.style.width = "63px"
            document.querySelectorAll('.barra_menu li').forEach(function(li) {
                paco = li.getAttribute("class");
                if (paco == "effect_arriba"){
                    li.classList.remove("effect_arriba");
                    li.classList.add("effect_arriba_cerrado");
                }
                else if (paco == "effect_abajo"){
                    li.classList.remove("effect_abajo");
                    li.classList.add("effect_abajo_cerrado");
                }
            });
            nav_control=0;
        }
        else if (nav_control==0){
            nav.style.width = "260px"
            nav_control=1
        }
    }

    function manejarClicCarpeta(folder) {
        const folderNameElement = folder.querySelector(".folder_name");
        console.log(folderNameElement);
        const dataCodificado = folderNameElement.getAttribute("data-codificado");
        let decodificado = atob(dataCodificado);
        var userr = "{{ user }}"
        var ruta = document.getElementById("mostrar_ruta");
        console.log("ruta",ruta)
        console.log(dataCodificado)
        console.log("Valor de data-codificado:", decodificado);
        
        var datos = {
            "nombre": decodificado,
        }
    
        fetch("/entrar_carpeta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Carpetas:", data.carpetas);
            console.log("Archivos:", data.archivos);
            
            userr = data.user
            const storageContainer = document.getElementById("storage_container");
            storageContainer.innerHTML = "";
            ruta.innerText = "";
            ruta.innerText = String(data.ruta).replace(userr, "Home");
            ruta.setAttribute("data-ruta", data.ruta);
    
            data.carpetas.forEach(carpeta => {
                const folderDiv = document.createElement("div");
                folderDiv.classList.add("folder");
                folderDiv.setAttribute("data-codificado", carpeta);
                let carpetaDecodificada = atob(carpeta);
                let carpeta_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;

                folderDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/folder_icon.webp" alt="Folder_image">
                    <p class="folder_name" data-codificado="${carpeta}">${carpeta_formateado}</p>
                `;
                storageContainer.appendChild(folderDiv);
                folderDiv.addEventListener("click", () => manejarClicCarpeta(folderDiv));
            });
            data.archivos.forEach(archivo => {
                const fileDiv = document.createElement("div");
                fileDiv.classList.add("file");
                fileDiv.setAttribute("data-codificado", archivo);
                let carpetaDecodificada = atob(archivo);
                let archivo_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
                fileDiv.setAttribute("onclick", "click_archivo()")
                fileDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/file.webp" alt="Folder_image">
                    <p class="file_name" data-codificado="${archivo}">${archivo_formateado}</p>
                `;
                storageContainer.appendChild(fileDiv);
            });
        })
        .catch(error => console.error("Error:", error));
    }
    document.querySelectorAll(".folder").forEach(folder => {
        folder.addEventListener("click", () => manejarClicCarpeta(folder));
    });
    function ir_atras() {
        var rutaactual = (document.getElementById("mostrar_ruta")).getAttribute("data-ruta");
        let decodificado = "atras";
        var userr = "{{ user }}"
        var ruta = document.getElementById("mostrar_ruta");
        console.log("Valor de data-codificado:", decodificado);
        
        var datos = {
            "nombre": decodificado,
            "rutaactual":rutaactual,
        }
    
        fetch("/entrar_carpeta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Carpetas:", data.carpetas);
            console.log("Archivos:", data.archivos);
            userr = data.user
            const storageContainer = document.getElementById("storage_container");
            storageContainer.innerHTML = "";
            ruta.innerText = "";
            ruta.innerText = String(data.ruta).replace(userr, "Home");
            ruta.setAttribute("data-ruta", data.ruta);
    
            data.carpetas.forEach(carpeta => {
                const folderDiv = document.createElement("div");
                folderDiv.classList.add("folder");
                folderDiv.setAttribute("data-codificado", carpeta);
                let carpetaDecodificada = atob(carpeta);
                let carpeta_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
                folderDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/folder_icon.webp" alt="Folder_image">
                    <p class="folder_name" data-codificado="${carpeta}">${carpeta_formateado}</p>
                `;
                storageContainer.appendChild(folderDiv);
    
                folderDiv.addEventListener("click", () => manejarClicCarpeta(folderDiv));
            });
    
            data.archivos.forEach(archivo => {
                const fileDiv = document.createElement("div");
                fileDiv.classList.add("file");
                let carpetaDecodificada = atob(archivo);
                let archivo_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
                fileDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/file.webp" alt="Folder_image">
                    <p class="file_name" data-codificado="${archivo}">${archivo_formateado}</p>
                `;
                storageContainer.appendChild(fileDiv);

                fileDiv.addEventListener("click", () => manejarClicarchivo(fileDiv));

            });
        })
        .catch(error => console.error("Error:", error));
    }
    function manejarClicarchivo(file) {
        var rutaactual = (document.getElementById("mostrar_ruta")).getAttribute("data-ruta");
        console.log(file)
        var fileNameElement = file.querySelector(".file_name");
        console.log(fileNameElement);
        var dataCodificado = fileNameElement.getAttribute("data-codificado");
        let decodificado = atob(dataCodificado);
        var userr = "{{ user }}"
        var ruta = document.getElementById("mostrar_ruta");
        console.log("ruta",ruta)
        console.log(dataCodificado)
        console.log("Valor de data-codificado:", decodificado);
        
        var datos = {
            "nombre": decodificado,
            "rutaactual":rutaactual,
        }
    
        fetch("/entrar_archivo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            click_archivo(data.contenido, decodificado);
            
        })
        .catch(error => console.error("Error:", error));
    }
    document.querySelectorAll(".file").forEach(file => {
        file.addEventListener("click", () => manejarClicarchivo(file));
    });
    
    function click_archivo(contenido, nombre_archivo){
        document.getElementById("popup").style.display = "flex";
        texto = document.getElementById("editor");
        editor.setValue(contenido);
        titulo = document.getElementById('nombre_archivo');
        titulo.innerText = nombre_archivo
        texto.innerText = contenido
    }

    function cerrarPopup() {
        document.getElementById("popup").style.display = "none";
      }

    function guardarArchivo() {
    var contenido = editor.getValue();
    var nombreArchivo = document.getElementById('nombre_archivo').innerText;
    var rutaactual = (document.getElementById("mostrar_ruta")).getAttribute("data-ruta");

    var datos = {
        "nombre": nombreArchivo,
        "contenido": contenido,
        "ruta": rutaactual,
    };

    fetch("/guardar_archivo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
    })
    .then(response => {
        if (response.ok) {
            alert("Archivo guardado");
        }
    })
    .catch(error => console.error("Error:", error));
    }

    function mostrar_upload(){
        document.querySelector(".upload_popup").style.display = "flex";
    }

    function cerrar_upload(){
        var rutaactual = (document.getElementById("mostrar_ruta")).getAttribute("data-ruta");
        var ruta = document.getElementById("mostrar_ruta");
        const userr = 'Zhuchii'; 
        document.querySelector(".upload_popup").style.display = "none";
        datos = {
            "rutaactual" : rutaactual,
        }
        fetch("/recargar_carpeta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            const storageContainer = document.getElementById("storage_container");
            storageContainer.innerHTML = "";
            ruta.innerText = "";
            ruta.innerText = String(data.ruta).replace(userr, "Home");
            ruta.setAttribute("data-ruta", data.ruta);
    
            data.carpetas.forEach(carpeta => {
                const folderDiv = document.createElement("div");
                folderDiv.classList.add("folder");
                folderDiv.setAttribute("data-codificado", carpeta);
                let carpetaDecodificada = atob(carpeta);
                let carpeta_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
                folderDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/folder_icon.webp" alt="Folder_image">
                    <p class="folder_name" data-codificado="${carpeta}">${carpeta_formateado}</p>
                `;
                storageContainer.appendChild(folderDiv);
    
                folderDiv.addEventListener("click", () => manejarClicCarpeta(folderDiv));
            });
    
            data.archivos.forEach(archivo => {
                const fileDiv = document.createElement("div");
                fileDiv.classList.add("file");
                let carpetaDecodificada = atob(archivo);
                let archivo_formateado = carpetaDecodificada.length > 15 ? carpetaDecodificada.substring(0, 15) + "..." : carpetaDecodificada;
                fileDiv.innerHTML = `
                    <img class="folder_image" src="/static/images/file.webp" alt="Folder_image">
                    <p class="file_name" data-codificado="${archivo}">${archivo_formateado}</p>
                `;
                storageContainer.appendChild(fileDiv);
                fileDiv.addEventListener("click", () => manejarClicarchivo(fileDiv));

            });
        })
        .catch(error => console.error("Error:", error));
        var tl = new TimelineLite();
                tl.to(".upload_message_error", 0.4, {
                    transform: "translateY(-90px)"
                })
        document.getElementById("error_message").innerText = "";
        update_space();
    }

    function crear_carpeta(){
        document.getElementById("crear_carpeta_popup").style.display = "flex";

    }
    function cerrar_carpeta(){
        document.getElementById("crear_carpeta_popup").style.display = "none";
    }
    function crear_carpeta_envio(){
        var rutaactual = (document.getElementById("mostrar_ruta")).getAttribute("data-ruta");
        var nombre = (document.getElementById("nombre_carpeta")).value;
        console.log(nombre);
        datos = {
            "rutaactual" : rutaactual,
            "nombre": nombre,
        }
        fetch("/crear_carpeta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.response == "OK"){
                cerrar_upload();
                document.getElementById("crear_carpeta_popup").style.display = "none";
                (document.getElementById("nombre_carpeta")).value = "";
            }
        });
    }
    const contextMenu = document.getElementById('contextMenu');
    let currentFolderId = null; 
    let clickeable_ahora = true;

    document.getElementById('storage_container').addEventListener('contextmenu', (event) => {
        const target = event.target.closest('.folder');
        if (target) {
            event.preventDefault();
            currentFolderId = target.querySelector('.folder_name').getAttribute('data-codificado');
            document.getElementById('download').classList.add('apagado');
            const { clientX: mouseX, clientY: mouseY } = event;
            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;
            contextMenu.style.display = 'block';
        }
    });

    document.getElementById('storage_container').addEventListener('contextmenu', (event) => {
        const target = event.target.closest('.file');
        if (target) {
            event.preventDefault();
            currentFolderId = target.querySelector('.file_name').getAttribute('data-codificado');

            const { clientX: mouseX, clientY: mouseY } = event;
            contextMenu.style.top = `${mouseY}px`;
            contextMenu.style.left = `${mouseX}px`;
            contextMenu.style.display = 'block';
        }
    });

    function abrir_renombrar() {
        const decodedName = atob(currentFolderId);
        document.getElementById('nuevo_nombre_carpeta').value = decodedName;
        document.getElementById('renombrar_carpeta_popup').style.display = 'flex'; 
    }

    function cerrar_renombrar() {
        document.getElementById('renombrar_carpeta_popup').style.display = 'none';
    }

    function renombrar_carpeta_envio() {
        const nuevoNombre = document.getElementById('nuevo_nombre_carpeta').value;
        const decodedName = atob(currentFolderId); 
        var rutaactual = document.getElementById("mostrar_ruta").getAttribute("data-ruta");

        if (nuevoNombre && nuevoNombre !== decodedName) {
            fetch('/renombrar_carpeta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    "rutaactual": rutaactual,
                    "nombre": decodedName,
                    "nuevo_nombre": nuevoNombre
                    })
            })
            .then(response => response.json())
            .then(data => {
                cerrar_upload();
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('El nuevo nombre no puede estar vacío o ser igual al actual');
        }
        cerrar_renombrar();
    }

    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
        document.getElementById('download').classList.remove('apagado');
    });


    document.getElementById('rename').addEventListener('click', () => {
        abrir_renombrar(); 
        contextMenu.style.display = 'none'; 
    });

    document.getElementById('share').addEventListener('click', () => {
        const decodedName = atob(currentFolderId);
        var rutaactual = document.getElementById("mostrar_ruta").getAttribute("data-ruta");
        console.log((encodeURIComponent(rutaactual)+ "/" + encodeURIComponent(decodedName)))
        fetch('/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                 "rutaactual": (encodeURIComponent(rutaactual)+ "/" + encodeURIComponent(decodedName)),
                })
        })
        .then(response => response.json())
        .then(data => {
            var enlace = data.link
            navigator.clipboard.writeText(enlace)
            cerrar_upload();
        });
    });

    document.getElementById('delete').addEventListener('click', () => {
        const decodedName = atob(currentFolderId);
        var rutaactual = document.getElementById("mostrar_ruta").getAttribute("data-ruta");
        if (confirm(`¿Eliminar: ${decodedName}?`)) {
            fetch('/eliminar_carpeta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                     "nombre": decodedName ,
                     "rutaactual": rutaactual,
                    })
            })
            .then(response => response.json())
            .then(data => {
                cerrar_upload();
            });
        }
        update_space();
        contextMenu.style.display = 'none';
    });
    document.getElementById('download').addEventListener('click', () => {
        const decodedName = atob(currentFolderId);
        var rutaactual = document.getElementById("mostrar_ruta").getAttribute("data-ruta");

        const url = `/download?nombre=${encodeURIComponent(decodedName)}&rutaactual=${encodeURIComponent(rutaactual)}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = decodedName;
        document.body.appendChild(link);
        link.click(); 
        document.body.removeChild(link);
        contextMenu.style.display = 'none';
    });
    function update_space(){
        var espacio = document.getElementById("espacio_disponible");
        var progressBar = document.getElementById("progress-bar");

        fetch(`/user_space`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(data => {
            var used_space = data.used_space;
            var quota = data.quota;

            espacio.innerText = `Espacio usado: ${formatoLegible(used_space)}/${formatoLegible(quota)}`;

            
            var percentageUsed = (used_space / quota) * 100;   
            progressBar.style.width = `${percentageUsed}%`;


            if (percentageUsed > 75) {
                progressBar.style.backgroundColor = "#f39c12"; 
            }
            if (percentageUsed > 90) {
                progressBar.style.backgroundColor = "#e74c3c"; 
            }
        })
        .catch(error => console.error("Error al obtener el espacio: ", error));
    }

    
    function swap_store(){
        elemento = document.getElementById("contenedor_targetas");
        elemento.style.display = "flex"
        document.getElementById("storage_container").style.display = "none"
    }
    function swap_dash(){
        elemento = document.getElementById("contenedor_targetas");
        elemento.style.display = "none"
        document.getElementById("storage_container").style.display = "flex"
    }
    
    update_space();