var app = {
    umbral: 10,
    diametro: 50,
    alto: 0, ancho: 0, vx: 1, vy: 1,
    puntos: 0, punText: null,
    bola: null, target: null,
    keys: null, force: 10, cursors:null,
    inicio: function () {
        app.alto = document.documentElement.clientHeight;
        app.ancho = document.documentElement.clientWidth;
        app.iniciaJuego();
        app.vigilaSensores();
    },
    iniciaJuego: function () {
        function preload() {
            game.physics.startSystem(Phaser.ARCADE);
            game.stage.backgroundColor = '#f27d0c';
            game.load.image('bola', 'img/bola.png');
            game.load.image('target', 'img/target.png');
            //game.load.image('bola2', 'img/bola.png');
            
        }
        function create() {
            //var sprite = game.add.sprite(app.inicioX(), app.inicioY(), 'bola');
            //var sprite2 = game.add.sprite(app.inicioX()+30, app.inicioY()+30, 'bola2');
            app.punText = game.add.text(app.ancho-40, 10, app.puntos, { fontSize: '2em', fill: '#767676' });
            app.bola = game.add.sprite(app.inicioX(), app.inicioY(), 'bola');
            app.target = game.add.sprite(app.inicioX(), app.inicioY(), 'target');
            game.physics.arcade.enable(app.bola);
            game.physics.arcade.enable(app.target);
            app.bola.body.collideWorldBounds = true;
            app.bola.body.onWorldBounds = new Phaser.Signal();
            //app.bola.body.onWorldBounds.add(app.updPuntos, this);
            app.bola.body.onWorldBounds.add(app.menosPuntos, this);

            //  This sets the image bounce energy for the horizontal  and vertical vectors (as an x,y point). "1" is 100% energy return
            //  This gets it moving
           //app.bola.allowGravity = true;
            app.bola.body.velocity.setTo(200, 200);
            app.bola.body.bounce.set(0.8);
            //app.bola.body.gravity.set(100, 500);
            app.bola.body.gravity.set(0, 500);

            cursors = game.input.keyboard.createCursorKeys();

        }
        function update() {
           // app.bola.body.velocity.x = app.vx * -50;
            //app.bola.body.velocity.y = app.vy * 50;
            game.physics.arcade.overlap(app.bola, app.target, app.masPuntos, null, this);

            if (cursors.left.isDown) {
                app.bola.body.velocity.x = -200;
            }
            if (cursors.right.isDown) {
                app.bola.body.velocity.x = 200;
            }
            if (cursors.up.isDown) {
                app.bola.body.velocity.y = -200;
            }
            if (cursors.down.isDown) {
                app.bola.body.velocity.y = 200;
            }

        }
        function render() {
            //debug helper
            game.debug.spriteInfo(app.bola, 25, 25);

        }
        

        var estados = { preload: preload, create: create, update: update, render:render};
        var game = new Phaser.Game(app.ancho, app.alto, Phaser.AUTO, 'phaser', estados)
    },
    masPuntos: function () {
        app.puntos++;
        app.punText.text = app.puntos;
    },
    menosPuntos: function () {
        app.puntos--;
        app.punText.text = app.puntos;

        //Rebotamos
        //app.vx = -app.vx;
        //app.bola.body.velocity.x = app.vx * -50;
        //app.vy = app.vy;
        //app.bola.body.velocity.y = app.vy * 50;
    },
    inicioX: function () {
        return app.aleatorio(app.ancho - app.diametro);
    },
    inicioY: function () {
        return app.aleatorio(app.alto - app.diametro);
    },
    aleatorio: function (numero) {
        return Math.floor(Math.random() * numero);
    },
    vigilaSensores: function () {
        var opciones = { frequency: 1000 };
        function onError() {
            console.log('Error');
        }
        function onSuccess(datosAceleracion) {
            app.detectaAgitacion(datosAceleracion);
            app.registraMovimiento(datosAceleracion);
        }
        navigator.accelerometer.watchAcceleration(onSuccess, onError, opciones);
    },
    registraMovimiento: function (datosAceleracion) {
        app.vx = datosAceleracion.x;
        app.vy = datosAceleracion.y;
    },
    detectaAgitacion: function (datosAceleracion) {
        var acX = datosAceleracion.x > app.umbral;
        var acY = datosAceleracion.y > app.umbral;
        if (acX || acY) {
            console.log('agitacion');
        }
    }
}

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function () {
        app.inicio();
    }, false);
}