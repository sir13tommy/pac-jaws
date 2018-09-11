import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('mushroom', 'assets/images/mushroom2.png')
    this.load.image('background', 'assets/images/background.png')
    this.load.image('spawn_point_left', 'assets/images/Spawn_Point_Left.png')
    this.load.image('spawn_point_right', 'assets/images/Spawn_Point_Right.png')
    this.load.atlas('char', 'assets/images/char.png', 'assets/images/char.json')
    this.load.image('fullscreen', 'assets/images/fullscreen.png')
    this.load.image('red', 'assets/images/Red_Ring.png')
    this.load.image('empty', 'assets/images/Empty_Ring.png')
    this.load.image('number', 'assets/images/Ring_With_Number.png')
  }

  create () {
    this.state.start('Game')
  }
}
