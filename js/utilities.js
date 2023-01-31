function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createScoreLabel({ score = 100, object }) {
  const scoreLabel = document.createElement("label");
  document.querySelector(".container").appendChild(scoreLabel);
  scoreLabel.innerHTML = score;
  scoreLabel.style.position = "absolute";
  scoreLabel.style.top = `${object.position.y + object.height / 2}px`;
  scoreLabel.style.left = `${object.position.x + object.width / 2}px`;
  scoreLabel.style.color = "white";
  scoreLabel.style.userSelect = "none";
  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      document.querySelector(".container").removeChild(scoreLabel);
    },
  });
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color,
        fades,
      })
    );
  }
}
