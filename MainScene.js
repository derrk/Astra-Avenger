// /**
//  * 
//  * @param {Phaser.Scene} scene 
//  * @param {number} count 
//  * @param {string} texture 
//  * @param {number} scrollFactor 
//  */

//  const createAligned = (scene, count, texture, scrollFactor) => {
//     let x = 0;
//     for (let i = 0; i < count; ++i) {
//     const m = scene.add.image(0, scene.scale.height, texture)
//     .setOrigin(0,1).setScrollFactor(scrollFactor);

//     x += m.height;
//     }
// };


class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");

        // const width = this.scene.scale.width;
        // const height = this.scene.scale.height;
       

        // Username, implement later
        this.username = "";
        // Player object
        this.player = null;
        // Speed of the player
        this.plySpd = 400;
        // shoot speed 
        this.shootSpd = 600;
        // player coins
        this.coins = 0;
        // player level
        this.level = 1;
        // Joystick object
        this.joystick = null;
        // Shooting variables
        this.shooting = false;
        this.lastShot = 0;
        // Time between player shots in ms
        this.shotTimeout = 250;
        // Lists of stuff
        this.enemies = [];
        this.bullets = [];
        this.bulletEnemyCollider = null;
        this.bulletPlayerCollider = null;
        this.enemyPlayerCollider = null;

        
        // Timing of enemy spawns
        this.lastSpawned = 0;
        this.spawnTime = 5000;
        this.minSpawnTime = 100;
        // Variable to mark if the game is over
        this.gameOver = false;
        // Score counter
        this.score = 0;
        this.scoreText = null;
        // coin counter
        this.coinText = null;
        // Firebase stuff
        this.database = firebase.firestore();
        this.scoreTable = this.database.collection('scores');
    }

    init(data) {
        // Get the username from the title screen
        this.username = data.username;
        if (this.username == "") {
            // No username was provided
            this.username = "MORON";
        }
    }

    preload() {
        this.load.image('background', './assets/BlackSpace.png');
        this.load.image('thirdlayer','./assets/Parallax60.png');
        this.load.image('secondlayer','./assets/Parallax80.png');
        this.load.image('firstlayer', './assets/Parallax100.png');
        this.load.image('stars', './assets/StarsTransparent.png');

        this.load.audio('expsound', './assets/explode2.wav');
        this.load.audio('shootsound', './assets/lasershootsound.mp3');

        // load coins animation
        this.load.spritesheet('playercoins', './assets/Full Coins.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        //load shoot button
        this.load.image('shootbutton', './assets/shootbutton.png');
        // load upgrade button
        this.load.image('upgrader', './assets/upgradeship.png');

        // Spritesheets must also include width and height of frames when loading
        this.load.spritesheet('explosion', './assets/explosion-1.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        // Load the spaceship
        this.load.spritesheet('player', './assets/playership.png', {
            frameWidth: 160,
            frameHeight: 222
        });
        // Load the lasers
        this.load.spritesheet('lasers', './assets/laser-bolts.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        // Loading enemy ships
        this.load.spritesheet('ggrunt', './assets/greengrunt.png', {
            frameWidth: 480,
            frameHeight: 1024
        });
        // load purple grunt
        this.load.spritesheet('pgrunt', './assets/purplegrunt.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        // load elite
        this.load.spritesheet('gurilla', './assets/gurilla.png', {
            frameWidth: 256,
            frameHeight: 256
        });
        // load scarab 
        this.load.spritesheet('scarab', './assets/scarab.png', {
            frameWidth: 256,
            frameHeight: 256
        });
    }

    create() {

        this.backdrop = this.add.tileSprite(200, 400, 450, 800, "background");
        this.firstlayer = this.add.tileSprite(200, 400, 450, 800, "firstlayer");
        this.secondlayer = this.add.tileSprite(200, 400, 450, 800, "secondlayer");
        this.thirdlayer = this.add.tileSprite(200, 400, 450, 800, "thirdlayer");
        this.stars = this.add.tileSprite(200, 400, 450, 800, "stars");
        
        // Create the text for keeping track of score
        this.scoreText = this.add.text(225, 10, `${this.score}`, {
            fontSize: '40px'
        });
        // Create player object
        this.createPlayer();
        // A virtual joystick for moving the player
        this.joystick = new VirtualJoystick(this, 60, 740, 50);
        // Set up the shooting controls
        this.createShootingControls();
        // add upgrde button
        let upgradebtn = this.add.image(60, 580, 'upgrader');
        upgradebtn.setInteractive();
        upgradebtn.setScale(.15);
        upgradebtn.on('pointerdown', () => {
            if (this.coins > 50) {
                this.shootSpd *= 1.025;
                this.coins -= 50;
            }
        });

        // Setup collisions for bullet objects
        this.setCollideBullet();

        this.playercoins = this.add.sprite(30, 30, 0.6, 'playercoins');
        this.playercoins.setScale(2.25);
        this.coinText = this.add.text(51, 30, `${this.coins}`, {
            fontSize: '24px'
        });

        // Create the idle animation
        this.playercoins.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('playercoins', {
                start: 0,
                end: 7
            
            }),
            frameRate: 8,
            repeat: -1
        });
        this.playercoins.anims.play('spin');

       

        
    }


    update() {
        this.backdrop.tilePositionY -=0;
        this.thirdlayer.tilePositionY -= 1.5;
        this.secondlayer.tilePositionY -= 6;
        this.firstlayer.tilePositionY -= 2.5;
        this.stars.tilePositionY -= 4;

        // Update the score text
        this.scoreText.setText(`${this.score}`);
        // update the coin text
        this.coinText.setText(`${this.coins}`);
        // Handle player movement
        this.player.setVelocity(this.joystick.joyX() * this.plySpd, 0);
        // If the player is holding the button, shoot
        if (this.shooting && this.now() > this.lastShot + this.shotTimeout) {
            this.createBullet(this.player.x, this.player.y - 80);
            this.sound.play('shootsound');
            this.lastShot = this.now();
        }

        // Check for spawning enemies
        if (this.now() >= this.lastSpawned + this.spawnTime) {
            this.spawnEnemy();
        }
        // Control the enemy ships
        for (let enemy of this.enemies) {
            enemy.ai.update();
            
        }
        for(let pgrunt of this.enemies){
            pgrunt.ai.update();
        }
        for (let gurilla of this.enemies){
            gurilla.ai.update();
        }
        for (let scarab of this.enemies){
            scarab.ai.update();
        }
        // End the game if necessary
        if (this.gameOver) {
            this.onGameOver();
        }

        
       
    }

    createPlayer() {
        this.player = this.physics.add.sprite(225, 700, 0.4, 'player');
        this.player.setScale(.35);
        this.player.setDepth(2);
        console.log("player created");
        // Create aniamtions for the player
        this.generatePlayerAnimations();
        // Collide the player with world bounds
        this.player.setCollideWorldBounds(true);
        // Start the player in idle
        this.player.anims.play('idle');
    }

    createShootingControls() {
        // Handle shooting on desktop using spacebar
        this.input.keyboard.on('keydown-SPACE', () => {
            this.shooting = true;
        });
        this.input.keyboard.on('keyup-SPACE', () => {
            this.shooting = false;
        });
        // Create a button to shoot with on mobile
        let shootButton = this.add.image(390, 740, 'shootbutton');
        shootButton.setInteractive();
        shootButton.setScale(.25);
        shootButton.setDepth(1);
        // When the player hits the button, start shooting
        shootButton.on('pointerdown', () => {
            this.shooting = true;
        });
        // If the player stops clicking, or moves the pointer out of the
        // button, stop shooting
        shootButton.on('pointerup', () => {
            this.shooting = false;
        });
        shootButton.on('pointerout', () => {
            this.shooting = false;
        });
    }

    createBullet(x, y, flipped) {
        // Creat the sprite object
        let bullet = this.physics.add.sprite(x, y, 'lasers');
        bullet.setScale(2);
        // Create the animation
        bullet.anims.create({
            // Name of the animation
            key: 'bullet',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('lasers', {
                start: 2,
                end: 3
            }),
            // Animation should be slower than base game framerate
            frameRate: 8,
            repeat: -1
        });
        // Run the animation
        bullet.anims.play('bullet');
        // Set the velocity
        if (flipped) {
            bullet.setVelocity(0, 600);
            bullet.setFlipY(true);
        } else {
            bullet.setVelocity(0, -this.shootSpd);
        }
        bullet.setCollideWorldBounds(true);
        // Turning this on will allow you to listen to the 'worldbounds' event
        bullet.body.onWorldBounds = true;
        // 'worldbounds' event listener
        bullet.body.world.on('worldbounds', (body) => {
            // Check if the body's game object is the sprite you are listening for
            if (body.gameObject === bullet) {
                // Destroy the bullet
                bullet.destroy();
            }
        });
        // Add the bullet to the list of bullets
        this.bullets.push(bullet);
        this.setCollideBullet();
    }

    createEnemy(x, y) {
        let enemy = this.physics.add.sprite(x, y, 'ggrunt');
        enemy.setScale(.125);
        enemy.setFlipY(true);
       
        enemy.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('ggrunt', {
                
            }), 
            frameRate: 8,
            repeat: -1
        });

        // Explosion animation
        enemy.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 8
        });
        // At the end of explosion, die.
        enemy.on('animationcomplete-explode', () => {
            enemy.destroy();
            this.coins++;
            this.score++;
        });

        // Attach an AI controller to this object
        enemy.ai = new EnemyM(this, enemy);
        // Add the bullet to the list of enemies
        this.enemies.push(enemy);
        this.setCollideBullet();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();

    }

    createPurpleGrunt(x, y) {
        
        // second enemy
        let pgrunt = this.physics.add.sprite(x, y, 'pgrunt');
        window.pgrunt = pgrunt;
        pgrunt.setScale(.5);
        pgrunt.setFlipY(true);

        pgrunt.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('pgrunt', {
                
            }), 
            frameRate: 8,
            repeat: -1
        });

        // Explosion animation
        pgrunt.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 8
        });
        // At the end of explosion, die.
        pgrunt.on('animationcomplete-explode', () => {
            this.coins++;
            this.score += 2;
            pgrunt.destroy();
        });

        // Attach an AI controller to this object
        pgrunt.ai = new EnemyM(this, pgrunt);
        // Add the bullet to the list of enemies
        this.enemies.push(pgrunt);
        this.setCollideBullet();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();
    }

    creategurilla(x, y) {
        
        // second enemy
        let gurilla = this.physics.add.sprite(x, y, 'gurilla');
        gurilla.setScale(.4);
        gurilla.setFlipY(true);

        gurilla.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('gurilla', {
                
            }), 
            frameRate: 8,
            repeat: -1
        });

        // Explosion animation
        gurilla.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 12
        });
        // At the end of explosion, die.
        gurilla.on('animationcomplete-explode', () => {
            gurilla.destroy();
            this.score += 5;
            this.coins += 3;
        });

        // Attach an AI controller to this object
        gurilla.ai = new Gurilla(this, gurilla);
        // Add the bullet to the list of enemies
        this.enemies.push(gurilla);
        this.setCollideBullet();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();
    }

    createScarab(x, y) {
        
        // second enemy
        let scarab = this.physics.add.sprite(x, y, 'scarab');
        scarab.setScale(.8);
        scarab.setFlipY(true);

        scarab.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('scarab', {
                
            }), 
            frameRate: 8,
            repeat: -1
        });

        // Explosion animation
        scarab.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 12
        });
        // At the end of explosion, die.
        scarab.on('animationcomplete-explode', () => {
            scarab.destroy();
            this.score += 20;
            this.coins += 10;
        });

        // Attach an AI controller to this object
        scarab.ai = new Scarab(this, scarab);
        // Add the bullet to the list of enemies
        this.enemies.push(scarab);
        this.setCollideBullet();
        // Rebuild the enemy and player collider
        this.setCollidePlayerEnemy();
    }

    createExplosion(x, y) {
        // Creat the sprite object
        let explosion = this.add.sprite(x, y, 'explosion');
        explosion.setScale(15);
        // Create the animation
        explosion.anims.create({
            // Name of the animation
            key: 'boom',
            // Generate all frame numbers between 0 and 7
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            // Animation should be slower than base game framerate
            frameRate: 8
        });
        // Run the animation
        explosion.anims.play('boom');
        
        // Create a callback for animation
        explosion.on('animationcomplete-boom', () => {
            explosion.destroy();
        });
    }

    generatePlayerAnimations() {
        // Create the idle animation
        this.player.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', {
                
            
            }),
            frameRate: 8,
            repeat: -1
        });
        
        // Explosion animation
        this.player.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 7
            }),
            frameRate: 8
        });
        // After the player is done exploding, we should have a callback
        this.player.on('animationcomplete-explode', () => {
            this.onPlayerExploded();
        });
    }

    /**
     * @returns The current time as a ms timestamp
     */
    now() {
        return new Date().getTime();
    }

    /**
     * Runs during update() if the "gameOver" flag has been set.
     * Resets the game.
     */
    onGameOver() {
        // Restart the game
        this.scene.start('TitleScene');
         // Destroy all the stuff
         this.player.destroy();
        // Save the score
        this.saveScore();
        // Reset timers for enemy spawn
        this.lastSpawned = 0;
        this.spawnTime = 5000;
       
        for (let e of this.enemies) {
            e.destroy();
        }
        for (let b of this.bullets) {
            b.destroy();
        }
        // Stop running updates on enemies
        this.enemies = [];
        // Reset the bullets
        this.bullets = [];
        // Reset game over variable
        this.gameOver = false;
        // Reset score
        this.score = 0;
        // reset coins
        this.coins = 0;
        // reset level
        this.level = 1;
        
    }

    onPlayerExploded() {
        // The game will reset immediately when the player is done exploding.
        // Change this if you want multiple lives...
        this.gameOver = true;
    }

    /**
     * Saves the player's score to the firestore database
     */
    async saveScore() {
        let result = await this.scoreTable.add({
            name: this.username,
            score: this.score
        });
        if (result) console.log("Score saved successfully!");
        else console.log("Score failed to save!");
    }

    setCollideBullet() {
        // Destroy any existing colliders
        if (this.bulletEnemyCollider != null) {
            this.bulletEnemyCollider.destroy();
        }
        if (this.bulletPlayerCollider != null) {
            this.bulletPlayerCollider.destroy();
        }
        // Add collision with all existing bullets
        this.bulletEnemyCollider =
            this.physics.add.overlap(this.enemies, this.bullets,
                (en, bu) => {
                   
                    // Destroy the bullet
                    bu.destroy();
                    // Make the enemy explode
                    en.anims.play('explode');
                    this.sound.play('expsound', {
                        volume: 0.5
                    });
                    
                    console.log("Coins: " + this.coins);
                    // Make the enemy "float" down
                    en.setVelocity(0, this.plySpd / 3.5);
                    // Remove the bullet from the list of bullets
                    this.bullets = this.bullets.filter((b) => {
                        return b !== bu;
                    });
                    // Remove the enemy from the list of enemies
                    this.enemies = this.enemies.filter((e) => {
                        return e !== en;
                    });
                
                });
        // Add collision with player to all bullets
        this.bulletPlayerCollider =
            this.physics.add.overlap(this.bullets, this.player,
                (bullet, player) => {
                    // Destroy the bullet
                    bullet.destroy();
                    // Blow up the player
                    player.anims.play('explode');
                    // Remove the bullet from the list of bullets
                    this.bullets = this.bullets.filter((b) => {
                        return b !== bullet;
                    });
                }
            );
    }

    setCollidePlayerEnemy() {
        // Destroy any existing collision handler
        if (this.enemyPlayerCollider != null) {
            this.enemyPlayerCollider.destroy();
        }
        // Create a new collision handler
        this.enemyPlayerCollider =
            this.physics.add.overlap(this.enemies, this.player,
                (en, ply) => {
                    // Explode player and enemy
                    en.anims.play('explode');
                    ply.anims.play('explode');
                    // Set the enemy velocity to "float" down
                    en.setVelocity(0, this.plySpd / 2);
                    // Remove the enemy from the list of enemies
                    this.enemies = this.enemies.filter((e) => {
                        return e !== en;
                    });
                }
            );
    }

    

    /**
     * Spawns an enemy at a random location and sets spawn timer.
     * Different from createEnemy(), which only creates an enemy.
     */
    spawnEnemy() {
        // Pick a random x coordinate without set bounds
        // x will be between 25 and 425
        const x = (Math.random() * 400) + 25;
        // decides which grunt to spawn
        const coinflip = (Math.floor(Math.random() * 2) + 1);
        console.log(coinflip);

        
        for (let i = 0; i < this.level; i++) {

        // Creates the actual enemy object at the given position
        if (this.score < 30) {
        if (coinflip == 1){
        this.createEnemy(x, 0);
        }
        else if (coinflip == 2){
            this.createPurpleGrunt(x, 0);
        }
    }
        else if (this.score >= 30) {
            this.creategurilla(x, 0);
        }

        else if(this.score % 50 == 0) {
            this.createScarab(x, 0);   
        }
    }   
        
        
       
        // Set the spawn timer and time between spawns
        this.lastSpawned = this.now();
        this.spawnTime *= .975;
        // Puts a hard limit on how small spawn time can get
        if (this.spawnTime < this.minSpawnTime) {
            this.spawnTime = this.minSpawnTime;
        }
    }
}