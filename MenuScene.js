class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");

    }

    preload(){
        this.load.image('menuBackground', './assets/menubackground.jpg');
        
          // load coins animation
        this.load.spritesheet('playercoins', './assets/Full Coins.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image('exitbtn', './assets/exitsign.png');

    }

    create(){
        // create background for main menu
        this.backDrop = this.add.image(225, 400, 'menuBackground');
        this.backDrop.setScale(.80);
       // add exit button to screen for user to press
        this.exitBtn = this.add.image(400, 50, 'exitbtn');
        this.exitBtn.setScale(.5);
        this.exitBtn.setInteractive();
        this.exitBtn.on('pointerdown', () => {
            this.scene.start('TitleScene');
        })

        this.playercoins = this.add.sprite(210, 295, 0.6, 'playercoins');
        //this.playercoins = this.add.sprite(200, 270, 0.6, 'playercoins');
        this.playercoins.setScale(2);

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

          this.playercoins = this.add.sprite(210, 370, 0.6, 'playercoins');
        //this.playercoins = this.add.sprite(200, 270, 0.6, 'playercoins');
        this.playercoins.setScale(2);

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

          this.playercoins = this.add.sprite(210, 450, 0.6, 'playercoins');
        //this.playercoins = this.add.sprite(200, 270, 0.6, 'playercoins');
        this.playercoins.setScale(2);

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
}