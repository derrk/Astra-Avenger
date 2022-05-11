import Phaser from 'phaser';



export default class ParallaxScene extends Phaser.scene
{
    constructor()
    {
        super('parallax-scene');
    }

    preload() 
    {
          // background images 
          this.load.image('background', './assets/BlackSpace.png');
          this.load.image('firstlayer', './assets/Parallax60.png');
          this.load.image('secondlayer', './assets/Parallax80.png');
          this.load.image('thirdlayer', './assets/Parallax100.png');
          this.load.image('stars', './assets/StarsTransparent.png');
  
    }

    create()
    {
          
    }




    update() {
        
    }
}