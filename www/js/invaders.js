var alto = document.documentElement.clientHeight;
var ancho = document.documentElement.clientWidth;
//var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
var game = new Phaser.Game(ancho, alto, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('bullet', 'assets/games/invaders/bullet.png');
    game.load.image('enemyBullet', 'assets/games/invaders/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/games/invaders/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'assets/games/invaders/player.png');
    game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
    game.load.image('starfield', 'assets/games/invaders/starfield.png');
    game.load.image('background', 'assets/games/starstruck/background2.png');
    
}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
//var alto;
//var ancho;
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, ancho, alto, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function createAliens() {

    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 7; x++) {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [0, 1, 2, 3], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to({ x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupInvader(invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive) {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown) {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown) {
            player.body.velocity.x = 200;
        }

        //  Firing?
        if (fireButton.isDown) {
            fireBullet();
        }

        if (game.time.now > firingTimer) {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

function collisionHandler(bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0) {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill', this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart, this);
    }

}

function enemyHitsPlayer(player, bullet) {

    bullet.kill();

    live = lives.getFirstAlive();

    if (live) {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1) {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text = " GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart, this);
    }

}

function enemyFires() {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length = 0;

    aliens.forEachAlive(function (alien) {

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0) {

        var random = game.rnd.integerInRange(0, livingEnemies.length - 1);

        // randomly select one of them
        var shooter = livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet, player, 120);
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet() {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime) {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet(bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart() {

    //  A new level starts

    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}


////https://github.com/photonstorm/phaser-examples/blob/master/examples/games/invaders.js
////var player;
////var aliens;
////var bullets;
////var bulletTime = 0;
////var cursors;
////var fireButton;
////var explosions;
////var starfield;
////var score = 0;
////var scoreString = '';
////var scoreText;
////var lives;
////var enemyBullet;
////var firingTimer = 0;
////var stateText;
////var livingEnemies = [];

//var app = {
//    umbral: 10,
//    diametro: 50,
//    alto: 0, ancho: 0, vx: 1, vy: 1,
//    puntos: 0, punText: null,
//    bola: null, target: null,
//    keys: null, force: 10, cursors: null,
//    game: null, player: null, aliens: null, bullets: null, bulletTime: 0,
//    fireButton:null,explosions:null, starfield:null, score: 0, scoreString: '', scoreText:null,
//    lives:null, enemyBullet:null,firingTimer :0, stateText:null,livingEnemies : [],
//    inicio: function () {
//        app.alto = document.documentElement.clientHeight;
//        app.ancho = document.documentElement.clientWidth;
//        app.iniciaJuego();
//        //app.vigilaSensores();
//    },
//    iniciaJuego: function () {
//        function preload() {

//            game.load.image('bullet', 'assets/games/invaders/bullet.png');
//            game.load.image('enemyBullet', 'assets/games/invaders/enemy-bullet.png');
//            game.load.spritesheet('invader', 'assets/games/invaders/invader32x32x4.png', 32, 32);
//            game.load.image('ship', 'assets/games/invaders/player.png');
//            game.load.spritesheet('kaboom', 'assets/games/invaders/explode.png', 128, 128);
//            game.load.image('starfield', 'assets/games/invaders/starfield.png');
//            game.load.image('background', 'assets/games/starstruck/background2.png');

//        }
//        function create() {

//            game.physics.startSystem(Phaser.Physics.ARCADE);

//            //  The scrolling starfield background
//            app.starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

//            //  Our bullet group
//            bullets = game.add.group();
//            bullets.enableBody = true;
//            bullets.physicsBodyType = Phaser.Physics.ARCADE;
//            bullets.createMultiple(30, 'bullet');
//            bullets.setAll('anchor.x', 0.5);
//            bullets.setAll('anchor.y', 1);
//            bullets.setAll('outOfBoundsKill', true);
//            bullets.setAll('checkWorldBounds', true);

//            // The enemy's bullets
//            enemyBullets = game.add.group();
//            enemyBullets.enableBody = true;
//            enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
//            enemyBullets.createMultiple(30, 'enemyBullet');
//            enemyBullets.setAll('anchor.x', 0.5);
//            enemyBullets.setAll('anchor.y', 1);
//            enemyBullets.setAll('outOfBoundsKill', true);
//            enemyBullets.setAll('checkWorldBounds', true);

//            //  The hero!
//            player = game.add.sprite(400, 500, 'ship');
//            player.anchor.setTo(0.5, 0.5);
//            game.physics.enable(player, Phaser.Physics.ARCADE);

//            //  The baddies!
//            aliens = game.add.group();
//            aliens.enableBody = true;
//            aliens.physicsBodyType = Phaser.Physics.ARCADE;

//            app.createAliens();

//            //  The score
//            scoreString = 'Score : ';
//            scoreText = game.add.text(10, 10, app.scoreString + app.score, { font: '34px Arial', fill: '#fff' });

//            //  Lives
//            lives = game.add.group();
//            game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

//            //  Text
//            stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', { font: '84px Arial', fill: '#fff' });
//            stateText.anchor.setTo(0.5, 0.5);
//            stateText.visible = false;

//            for (var i = 0; i < 3; i++) {
//                var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
//                ship.anchor.setTo(0.5, 0.5);
//                ship.angle = 90;
//                ship.alpha = 0.4;
//            }

//            //  An explosion pool
//            explosions = game.add.group();
//            explosions.createMultiple(30, 'kaboom');
//            explosions.forEach(app.setupInvader, this);

//            //  And some controls to play the game with
//            cursors = game.input.keyboard.createCursorKeys();
//            fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

//        }

//        function update() {

//            //  Scroll the background
//            app.starfield.tilePosition.y += 2;

//            if (app.player.alive) {
//                //  Reset the player, then check for movement keys
//                app.player.body.velocity.setTo(0, 0);

//                if (cursors.left.isDown) {
//                    app.player.body.velocity.x = -200;
//                }
//                else if (cursors.right.isDown) {
//                    app.player.body.velocity.x = 200;
//                }

//                //  Firing?
//                if (fireButton.isDown) {
//                    app.fireBullet();
//                }

//                if (game.time.now > app.firingTimer) {
//                    app.enemyFires();
//                }

//                //  Run collision
//                app.game.physics.arcade.overlap(app.bullets, app.aliens, app.collisionHandler, null, this);
//                app.game.physics.arcade.overlap(app.enemyBullets, app.player, app.enemyHitsPlayer, null, this);
//            }

//        }

//        function render() {

//            // for (var i = 0; i < aliens.length; i++)
//            // {
//            //     game.debug.body(aliens.children[i]);
//            // }

//        }
        


//        //var estados = { preload: preload, create: create, update: update, render: render };
//        //var game = new Phaser.Game(app.ancho, app.alto, Phaser.AUTO, 'phaser', estados)
//        //var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
//        game = new Phaser.Game(app.ancho, app.alto, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });


//    },
//    createAliens: function () {
//        for (var y = 0; y < 4; y++) {
//            for (var x = 0; x < 10; x++) {
//                var alien = aliens.create(x * 48, y * 50, 'invader');
//                alien.anchor.setTo(0.5, 0.5);
//                alien.animations.add('fly', [0, 1, 2, 3], 20, true);
//                alien.play('fly');
//                alien.body.moves = false;
//            }
//        }

//        aliens.x = 100;
//        aliens.y = 50;

//        //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
//        var tween = game.add.tween(aliens).to({ x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

//        //  When the tween loops it calls descend
//        tween.onLoop.add(app.descend, this);
//    },
//    setupInvader: function (invader) {
//        invader.anchor.x = 0.5;
//        invader.anchor.y = 0.5;
//        invader.animations.add('kaboom');
//    },
//    descend: function () {
//        aliens.y += 10;
//    },
//    collisionHandler : function (bullet,alien){
//        //  When a bullet hits an alien we kill them both
//        bullet.kill();
//        alien.kill();

//        //  Increase the score
//        score += 20;
//        scoreText.text = scoreString + score;

//        //  And create an explosion :)
//        var explosion = explosions.getFirstExists(false);
//        explosion.reset(alien.body.x, alien.body.y);
//        explosion.play('kaboom', 30, false, true);

//        if (aliens.countLiving() == 0) {
//            score += 1000;
//            scoreText.text = scoreString + score;

//            enemyBullets.callAll('kill', this);
//            stateText.text = " You Won, \n Click to restart";
//            stateText.visible = true;

//            //the "click to restart" handler
//            game.input.onTap.addOnce(restart, this);
//        }

//    },
//    enemyHitsPlayer :function(player,bullet){
//        bullet.kill();

//        live = lives.getFirstAlive();

//        if (live) {
//            live.kill();
//        }

//        //  And create an explosion :)
//        var explosion = explosions.getFirstExists(false);
//        explosion.reset(player.body.x, player.body.y);
//        explosion.play('kaboom', 30, false, true);

//        // When the player dies
//        if (lives.countLiving() < 1) {
//            player.kill();
//            enemyBullets.callAll('kill');

//            stateText.text = " GAME OVER \n Click to restart";
//            stateText.visible = true;

//            //the "click to restart" handler
//            game.input.onTap.addOnce(restart, this);
//        }
//    },
//    enemyFires: function(){
//        //  Grab the first bullet we can from the pool
//        enemyBullet = enemyBullets.getFirstExists(false);

//        livingEnemies.length = 0;

//        aliens.forEachAlive(function (alien) {

//            // put every living enemy in an array
//            livingEnemies.push(alien);
//        });


//        if (enemyBullet && livingEnemies.length > 0) {

//            var random = game.rnd.integerInRange(0, livingEnemies.length - 1);

//            // randomly select one of them
//            var shooter = livingEnemies[random];
//            // And fire the bullet from this enemy
//            enemyBullet.reset(shooter.body.x, shooter.body.y);

//            game.physics.arcade.moveToObject(enemyBullet, player, 120);
//            firingTimer = game.time.now + 2000;
//        }

//    },
//    fireBullet: function(){
//        //  To avoid them being allowed to fire too fast we set a time limit
//        if (game.time.now > bulletTime) {
//            //  Grab the first bullet we can from the pool
//            bullet = bullets.getFirstExists(false);

//            if (bullet) {
//                //  And fire it
//                bullet.reset(player.x, player.y + 8);
//                bullet.body.velocity.y = -400;
//                bulletTime = game.time.now + 200;
//            }
//        }
//    },
//    resetBullet: function(){
//        //  Called if the bullet goes out of the screen
//        bullet.kill();
//    },
//    restart: function () {
//        //  A new level starts

//        //resets the life count
//        lives.callAll('revive');
//        //  And brings the aliens back from the dead :)
//        aliens.removeAll();
//        createAliens();

//        //revives the player
//        player.revive();
//        //hides the text
//        stateText.visible = false;
//    },
//    vigilaSensores: function () {
//        var opciones = { frequency: 1000 };
//        function onError() {
//            console.log('Error');
//        }
//        function onSuccess(datosAceleracion) {
//            app.detectaAgitacion(datosAceleracion);
//            app.registraMovimiento(datosAceleracion);
//        }
//        navigator.accelerometer.watchAcceleration(onSuccess, onError, opciones);
//    },
//    registraMovimiento: function (datosAceleracion) {
//        app.vx = datosAceleracion.x;
//        app.vy = datosAceleracion.y;
//    },
//    detectaAgitacion: function (datosAceleracion) {
//        var acX = datosAceleracion.x > app.umbral;
//        var acY = datosAceleracion.y > app.umbral;
//        if (acX || acY) {
//            console.log('agitacion');
//        }
//    }
//}

//if ('addEventListener' in document) {
//    document.addEventListener('deviceready', function () {
//        app.inicio();
//    }, false);
//}