var app = {
    modelo: {'notas': [{'titulo': 'Comprar pan', 'contenido': 'Que sea integral'}]},
    inicio: function () {
        this.iniciaBotones();
        this.refrescarLista();
    },
    iniciaBotones: function () {
        var salvar = document.querySelector('#salvar');
        var anadir = document.querySelector('#anadir');
        anadir.addEventListener('click', this.mostrarEditor, false);
        salvar.addEventListener('click', this.salvarNota, false);
    },
    mostrarEditor: function () {
        document.getElementById('titulo').value = "";
        document.getElementById('comentario').value = "";
        document.getElementById("note-editor").style.display = "block";
        document.getElementById('titulo').focus();
    },
    salvarNota: function () {
        app.construirNota();
        app.ocultarEditor();
        app.refrescarLista();
        app.grabarDatos();
    },
    construirNota: function () {
        var notas = app.modelo.notas;
        notas.push({"titulo": app.extraerTitulo(), "contenido": app.extraerComentario()});
    },
    extraerTitulo: function () {
        return document.getElementById('titulo').value;
    },
    extraerComentario: function () {
        return document.getElementById('comentario').value;
    },
    ocultarEditor: function () {
        document.getElementById("note-editor").style.display = "none";
    },
    refrescarLista: function () {
        var div = document.getElementById('notes-list');
        div.innerHTML = this.anadirNotasALista();
    },
    anadirNotasALista: function () {
        var notas = this.modelo.notas;
        var notasDivs = '';
        for (var i in notas) {
            var titulo = notas[i].titulo;
            var contenido = notas[i].contenido;
            notasDivs = notasDivs + this.anadirNota(i, titulo, contenido);
        }
        return notasDivs;
    },
    anadirNota: function (id, titulo, contenido) {
        return "<div class='note-item' id='notas[" + id + "]'>" + titulo +":<br>"+contenido+ "</br></div>";
    },

    grabarDatos: function () {
        //window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.hayFS, this.fail);
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, this.hayFS, this.fail);
    },
    hayFS: function (fileSystem) {
        fileSystem.getFile("files/" + "model.json", { create: true, exclusive: false }, app.hayFichero, app.fail);
    },
    hayFichero: function (fileEntry) {
        fileEntry.createWriter(app.hayWriter, app.fail);
    },
    hayWriter: function (writer) {
        writer.onwriteend = function (evt) {
            console.log("datos grabados en externalApplicationStorageDirectory o dataDirectory");
        };
        writer.write(JSON.stringify(app.modelo));
    },
    fail: function (error) {
        alert(error.code);
    },

    leerDatos: function () {
        //window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, this.obtenerFS, this.fail);
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, this.obtenerFS, this.fail);
    },
    obtenerFS: function (fileSystem) {
        fileSystem.getFile("files/" + "model.json", null, app.obtenerFileEntry, app.noFile);
    },
    obtenerFileEntry: function (fileEntry) {
        fileEntry.file(app.leerFile, app.fail);
    },
    leerFile: function (file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            var data = evt.target.result;
            if (data !== null)
        {
            app.modelo = JSON.parse(data);
        }
            app.inicio();
        };
        reader.readAsText(file);
    },
    noFile: function (error) {
        app.inicio();
    },
}


if ('addEventListener' in document) {
    document.addEventListener('deviceready', function () {
        app.inicio();
        app.leerDatos();
    }, false);
}