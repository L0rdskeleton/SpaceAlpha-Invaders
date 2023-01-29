const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const player = new Player();
const projectiles = [];
const grids = [];

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500) + 500;

function animate() {
  requestAnimationFrame(animate);
  c.fillStyle = "rgba(0, 0, 0, 1)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  projectiles.forEach((projectile, i) => {
    if (projectile.position.y <= 0) {
      setTimeout(() => {
        projectiles.splice(i, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid) => {
    grid.update();
    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

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
            const invaderFound = grid.invaders.find((invader2) => {
              return invader2 === invader;
            });
            const projectileFound = projectiles.find((projectile2) => {
              return projectile2 === projectile;
            });

            if (invaderFound && projectileFound) {
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);
            }
          }, 0);
        }
      });
    });
  });

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 7;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }
  //   Spawning enemies
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500) + 500;
    frames = 0;
  }

  frames++;
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case " ":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x - player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      break;
  }
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});
