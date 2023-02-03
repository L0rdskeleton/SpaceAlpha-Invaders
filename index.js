const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreEl");
const finalScoreEl = document.getElementById("finalScoreEl");
const powerUpTypes = ["MachineGun", "MultiShot"]

canvas.width = 1366;
canvas.height = 768;

let player = new Player();
let projectiles = [];
let grids = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];
let gameStarted = false;

let keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
  mouse: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 500;
let game = {
  over: false,
  active: true,
};
let score = 0;

let spawnBuffer = 500;
let fps = 60;
let fpsInterval = 1000 / fps;
let msPrev = window.performance.now();

function init() {
  scoreEl.innerHTML = 0;
  player = new Player();
  projectiles = [];
  grids = [];
  invaderProjectiles = [];
  particles = [];
  bombs = [];
  powerUps = [];

  keys = {
    a: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
    ArrowLeft: {
      pressed: false,
    },
    ArrowRight: {
      pressed: false,
    },
    space: {
      pressed: false,
    },
    mouse: {
      pressed: false,
    },
  };

  frames = 0;
  randomInterval = Math.floor(Math.random() * 500) + 500;
  game = {
    over: false,
    active: true,
  };
  score = 0;

  // generate stars
  for (let i = 0; i < 100; i++) {
    particles.push(
      new Particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
        },
        velocity: {
          x: 0,
          y: 0.3,
        },
        radius: Math.random() * 2,
        color: "white",
      })
    );
  }
}

function endGame() {
  audio.gameOver.play();
  // Makes player disappear
  setTimeout(() => {
    player.opacity = 0;
    game.over = true;
  }, 0);

  // Stops the game
  setTimeout(() => {
    game.active = false;
    document.querySelector(".restartScreen").style.display = "grid";
    finalScoreEl.innerHTML = score;
  }, 2000);
  createParticles({ object: player, color: "white", fades: true });
}

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);

  const msNow = window.performance.now();
  const elapsed = msNow - msPrev;

  if (elapsed < fpsInterval) {
    return;
  }
  msPrev = msNow - (elapsed % fpsInterval);

  c.fillStyle = "rgba(0, 0, 0, 1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    if (powerUp.position.x - powerUp.radius >= canvas.width) {
      powerUps.splice(i, 1);
    } else {
      powerUp.update();
    }
  }

  // Spawn powerUps
  if (frames % 500 === 0 && powerUps.length < 3) {
    powerUps.push(
      new PowerUp({
        position: { x: 0, y: Math.random() * 300 + 15 },
        velocity: { x: 5, y: 0 },
      })
    );
  }
  // Spawn bombs
  if (frames % 200 === 0 && bombs.length < 3) {
    bombs.push(
      new Bomb({
        position: {
          x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
          y: randomBetween(Bomb.radius, canvas.height - Bomb.radius),
        },
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
        },
      })
    );
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    if (bomb.opacity <= 0) {
      bombs.splice(i, 1);
    }
    bomb.update();
  }

  player.update();

  for (let i = player.particles.length - 1; i >= 0; i--) {
    const particle = player.particles[i];
    particle.update();

    if (particle.opacity <= 0) {
      player.particles.splice(i, 1);
    }
  }

  particles.forEach((particle, i) => {
    // respawn stars at top
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      });
    } else {
      particle.update();
    }
  });
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }
    // Projectile hit player
    if (
      rectangularCollision({
        rectangle1: invaderProjectile,
        rectangle2: player,
      })
    ) {
      invaderProjectiles.splice(index, 1);
      endGame();
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j];
      // if projectile touches bomb remove projectile
      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
          projectile.radius + bomb.radius &&
        !bomb.active
      ) {
        projectiles.splice(i, 1);
        bomb.explode();
      }
    }
    // if projectile touches powerUp
    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j];
      var randomPowerUp = Math.floor(Math.random() * powerUpTypes.length);
      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) <
        projectile.radius + powerUp.radius
      ) {
        projectiles.splice(i, 1);
        powerUps.splice(j, 1);
        player.powerUp = powerUpTypes[randomPowerUp];
        audio.bonus.play();
        setTimeout(() => {
          player.powerUp = null;
        }, 5000);
      }
    }
    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(i, 1);
    } else {
      projectile.update();
    }
  }

  grids.forEach((grid, gridIndex) => {
    grid.update();
    // Spawn enemy projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i];
      invader.update({ velocity: grid.velocity });

      for (let j = bombs.length - 1; j >= 0; j--) {
        const bomb = bombs[j];
        const invaderRadius = 24;
        // if bomb touches invader remove invader
        if (
          Math.hypot(
            invader.position.x - bomb.position.x,
            invader.position.y - bomb.position.y
          ) <
            invaderRadius + bomb.radius &&
          bomb.active
        ) {
          score += 50;
          scoreEl.innerHTML = score;
          grid.invaders.splice(i, 1);
          createScoreLabel({ object: invader, score: 50 });
          createParticles({ object: invader, color: "orange", fades: true });
        }
      }

      // Projectiles hit enemy
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <=
            invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader2 === invader
            );
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            );

            // Remove invaders and projectiles
            if (invaderFound && projectileFound) {
              score += 100;
              scoreEl.innerHTML = score;
              // Dynamic score labels
              createScoreLabel({ object: invader });
              createParticles({
                object: invader,
                color: "orange",
                fades: true,
              });
              // singular projectile hits an enemy
              audio.explode.play();
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });

      // remove player if invader touches
      if (
        rectangularCollision({
          rectangle1: invader,
          rectangle2: player,
        }) &&
        !game.over
      ) {
        endGame();
      }
    }
  });

  if (
    (keys.a.pressed && player.position.x >= 0) ||
    (keys.ArrowLeft.pressed && player.position.x >= 0)
  ) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (
    (keys.d.pressed && player.position.x + player.width <= canvas.width) ||
    (keys.ArrowRight.pressed &&
      player.position.x + player.width <= canvas.width)
  ) {
    player.velocity.x = 7;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }
  //   spawning enemies
  if (frames % randomInterval === 0) {
    spawnBuffer = spawnBuffer < 0 ? 100 : spawnBuffer;
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500) + spawnBuffer;
    frames = 0;
    spawnBuffer -= 100;
  }

  // start or stop powerups
  if (
    (keys.space.pressed &&
      player.powerUp === "MachineGun" &&
      frames % 4 === 0 &&
      !game.over) ||
    (keys.mouse.pressed &&
      player.powerUp === "MachineGun" &&
      frames % 4 === 0 &&
      !game.over)
  ) {
    audio.shoot.play();

    projectiles.push(
      Projectile.createProjectile(0, -10, "yellow")
    );
  }
  


  frames++;
}
