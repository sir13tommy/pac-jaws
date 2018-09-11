/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import lang from '../lang'
import { Game } from 'phaser-ce';

export default class PacJawsGame extends Phaser.State {
  init() { }
  preload() { }

  create(game) {
    // setup physics configs
    game.physics.startSystem(Phaser.Physics.P2JS)
    game.physics.p2.restitution = 1
    game.physics.p2.setImpactEvents(true);

    this.playerCollisionGroup = game.physics.p2.createCollisionGroup()
    this.ballsCollisionGroup = game.physics.p2.createCollisionGroup()

    game.physics.p2.updateBoundsCollisionGroup()

    // update game configs
    game.input.enabled = true

    game.stage.disableVisibilityChange = true

    this.game.stage.backgroundColor = '#e4cff6'

    // add balls spawn angles
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

    // add enemies group
    this.enemies = game.add.group(game.world, 'enemies')
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.P2JS

    // create player
    let player = game.add.sprite(game.world.centerX, game.world.centerY, 'char')
    player.anchor.set(0.5)
    player.animations.add('om-nom-nom', Phaser.Animation.generateFrameNames('Character', 1, 10, '.png', 2))
    player.animations.play('om-nom-nom', 30, true)

    game.physics.p2.enableBody(player)
    player.body.setCircle(player.width / 2)
    player.body.fixedRotation = true
    player.body.setCollisionGroup(this.playerCollisionGroup)
    player.body.collides(this.ballsCollisionGroup, this.playerContactBall, this)

    this.player = player

    // add score text
    this.score = 0
    this.scoreText = game.add.text(game.width / 2, 20, this.score, {
      font: 'bold 35px sans-serif',
      fill: '#553175'
    })

    // Add Fullscreen button
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.RESIZE;
    this.fullScreenBtn = game.add.button(null, null, 'fullscreen', () => {
      if (!game.scale.isFullScreen) {
        game.scale.startFullScreen()
      } else {
        game.scale.stopFullScreen()
      }
    }, this)
    this.fullScreenBtn.alignIn(game.camera.view, Phaser.BOTTOM_RIGHT, -10, -10)

    // loop for point spawn
    game.time.events.loop(Phaser.Timer.SECOND * 4, () => {
      if (this.player.exists) {
        this.spawnRandomBall()
      }
    })
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
    if (this.player.exists) {
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

    // update score
    this.scoreText.text = this.score
  }

  playerContactBall (playerBody, ballBody) {
    let ball = ballBody.sprite
    let player = playerBody.sprite
    let type = ball.data.type
    let types = PacJawsGame.Types
    switch (type) {
      case types.RED:
        this.enemies.forEach(sprite => {
          var spriteBounds = sprite.getBounds()
          var ballBounds = new Phaser.Circle(ball.x, ball.y, ball.alphaBall.width)
          if (sprite.data.type === types.EMPTY && Phaser.Circle.intersectsRectangle(ballBounds, spriteBounds)) {
            sprite.destroy()
          }
        })
        ball.kill()
        break
      case types.NUMBER:
        this.score++
        ball.kill()
        break
      case types.EMPTY:
        let hide = game.add.tween(player.scale)
          .to({x: 0, y: 0}, 1 * Phaser.Timer.SECOND)
          .start()

        hide.onComplete.add(() => {
          player.destroy()

          this.finishGame()
        })
        break
      default:
        break
    }
  }

  finishGame () {
    console.log('Game finished')
  }

  spawnRandomBall () {
    let direction = this.game.rnd.integerInRange(0, 1)
    let type = this.game.rnd.integerInRange(0, 2)
    this.spawnPoint(type, direction)
  }

  spawnPoint (type = PacJawsGame.Types.RED, direction = PacJawsGame.Types.LEFT) {
    let key
    let types = PacJawsGame.Types
    switch (type) {
      case types.RED:
        key = 'red'
        break
      case types.EMPTY:
        key = 'empty'
        break
      case types.NUMBER:
        key = 'number'
      default:
        break;
    }
    let y = 10 + 32
    let velY = 50
    let x, velX
    if (direction === PacJawsGame.Directions.LEFT) {
      x = 32
      velX = 50
    } else {
      x = this.game.width - 32
      velX = -50
    }

    let sprite = this.game.make.sprite(x, y, key)
    this.enemies.add(sprite)
    sprite.data.type = type
    sprite.body.damping = 0
    sprite.body.setCircle(sprite.width / 2)
    sprite.body.velocity.x = velX
    sprite.body.velocity.y = velY

    sprite.body.setCollisionGroup(this.ballsCollisionGroup)
    sprite.body.collides([this.ballsCollisionGroup, this.playerCollisionGroup])

    if (type === types.RED) {
      let alphaBall = this.game.make.graphics(0, 0)
      sprite.alphaBall = alphaBall
      alphaBall.beginFill(0xf1332a)
      alphaBall.drawCircle(0, 0, 400)
      alphaBall.anchor.set(0.1)
      alphaBall.alpha = 0.5
      sprite.addChild(alphaBall)
    }
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
}
