import 'pixi'
import 'p2'
import Phaser from 'phaser'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'

import config from './config'

class Game extends Phaser.Game {
  constructor () {
    super(config)

    this.state.add('Boot', BootState, false)
    this.state.add('Splash', SplashState, false)
    this.state.add('Game', GameState, false)

    this.state.start('Boot')
  }
}

FBInstant.initializeAsync().then(function() {
  FBInstant.setLoadingProgress(100);
  FBInstant.startGameAsync().then(function() {
    window.game = new Game()
  });
});
