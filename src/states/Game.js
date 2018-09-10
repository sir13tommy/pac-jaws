/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import { Game } from 'phaser-ce';

export default class PacJawsGame extends Phaser.State {
  init() { }
  preload() { }

  create(game) {
    game.physics.startSystem(Phaser.Physics.P2JS)
    game.physics.p2.restitution = 1
        
    game.input.enabled = true

    game.stage.disableVisibilityChange = true

    this.game.stage.backgroundColor = '#e4cff6'

    this.background = this.game.add.image(game.world.centerX, game.world.centerY, 'background')
    this.background.anchor.set(0.5)
    this.game.scale.scaleSprite(this.background, this.game.width, this.game.height, false)

    this.spawnPoints = []
    let spawnPointLeft = {
      image: this.game.add.image(0, 0, 'spawn_point_left'),
      align: Phaser.TOP_LEFT
    }
    this.spawnPoints.push(spawnPointLeft)
    
    let spawnPointRight = {
      image: this.game.add.image(0, 0, 'spawn_point_right'),
      align: Phaser.TOP_RIGHT
    }
    this.spawnPoints.push(spawnPointRight)

    this.spawnPoints.forEach(point => {
      point.image.alignIn(this.game.camera.view, point.align, 0, 0)
    })

    let player = game.add.sprite(game.world.centerX, game.world.centerY, 'char')
    player.anchor.set(0.5)
    player.animations.add('om-nom-nom', Phaser.Animation.generateFrameNames('Character', 1, 10, '.png', 2))
    player.animations.play('om-nom-nom', 30, true)

    game.physics.p2.enableBody(player)
    player.body.setCircle(player.width / 2)
    player.body.fixedRotation = true
    player.body.collideWorldBounds = true

    this.player = player

    // add enemies
    this.enemies = game.add.group(game.world, 'enemies')
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.P2JS

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
    this.fullScreenBtn = game.add.button(null, null, 'fullscreen', () => {
      if (!game.scale.isFullScreen) {
        game.scale.startFullScreen()
      } else {
        game.scale.stopFullScreen()
      }
    }, this)
    this.fullScreenBtn.alignIn(game.camera.view, Phaser.BOTTOM_RIGHT, -10, -10)
  }

  resize (width, height) {
    this.game.scale.scaleSprite(this.background, width, height, false)
    this.background.alignIn(this.game.camera.view, Phaser.CENTER, 0, 0)

    this.spawnPoints.forEach(point => {
      point.image.alignIn(this.game.camera.view, point.align, 0, 0)
    })

    this.fullScreenBtn.alignIn(game.camera.view, Phaser.BOTTOM_RIGHT, -10, -10)
  }

  update (game) {
    // player movement
    if (game.input.activePointer.isDown) {
      let rotationStep = 0.07
      if (game.input.activePointer.x < game.width / 2) {
        this.player.rotation -= rotationStep
      } else {
        this.player.rotation += rotationStep
      }
    }
    let velocity = game.physics.arcade.velocityFromRotation(this.player.rotation, 150)
    this.player.body.velocity.x = velocity.x
    this.player.body.velocity.y = velocity.y
  }

  spawnPoint (type = PacJawsGame.Types.RED, direction = PacJawsGame.Types.LEFT) {
    let key
    let collisionGroup
    switch (type) {
      case PacJawsGame.Types.RED:
        key = 'red'
        break
      case PacJawsGame.Types.EMPTY:
        key = 'empty'
        break
      case PacJawsGame.Types.NUMBER:
        key = 'number'
      default:
        break;
    }
    let y = 10 + 32
    let velY = 50
    let x, velX
    if (direction === PacJawsGame.Types.LEFT) {
      x = 32
      velX = 50
    } else {
      x = this.game.width - 32
      velX = -50
    }

    let sprite = this.game.add.sprite(x, y, key)
    sprite.data.type = type
    this.game.physics.p2.enable(sprite)
    sprite.body.setCircle(sprite.width / 2)
    sprite.body.velocity.x = velX
    sprite.body.velocity.y = velY
  }

  static get Directions () {
    return {
      LEFT: 0,
      RIGHT: 1
    }
  }
  
  static get Types () {
    return {
      RED: 0,
      EMPTY: 1,
      NUMBER: 2
    }
  }

  render () {
    if (__DEV__) {
      
    }
  }
}
