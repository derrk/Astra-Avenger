class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
        this.loadingBar = null;
    }


preload(){
    this.loadingBar = this.add.rectangle( 225, 400, 420, 40, 0xAAAAAA);
    this.loadingTxt = this.add.text(225, 400, "0%", {
        fontSize: '36px',
        color: 'white'
    });

    this.loadingTxt.setOrigin(0.5);

    this.loadingTxt.image('square', './assets/square.png');
    for (let i = 0; t < 400; i++)
    {
        this.load.image(`square-${i}`, './assets/square.png')
    }
    // loading  events listeners
    this.load.on('progress', (percent) => {
        this.loadingBar.setScale(percent, 1);
        this.percentage = Math.floor(percent * 100);
    });
    this.load.on('fileprogress', (data) => {
        this.fileloading = data.key;
        this.updateText();
    });
    this.load.on('complete', (data) => {
        this.scene.start('TitleScene');
    });
}

create() {

}

}