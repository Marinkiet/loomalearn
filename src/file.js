import { dialogueData, scaleFactor, quizData } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

function displayQuizQuestion(questionData, onAnswer) {
  // Check if question type is multiple-choice or true/false
  if (questionData.type === "multiple-choice") {
    displayDialogue(
      `${questionData.question}\n\nOptions:\n1. ${questionData.options[0]}\n2. ${questionData.options[1]}\n3. ${questionData.options[2]}\n4. ${questionData.options[3]}`,
      () => {
        const userAnswer = prompt("Enter the number of your answer:");
        const selectedAnswer = questionData.options[userAnswer - 1];
        const isCorrect = selectedAnswer === questionData.answer;

        if (isCorrect) {
          displayDialogue("Correct! You've earned a point!", onAnswer);
        } else {
          displayDialogue(`Incorrect. The correct answer was: ${questionData.answer}`, onAnswer);
        }
      }
    );
  } else if (questionData.type === "true-false") {
    displayDialogue(
      `${questionData.question}\n\nOptions:\n1. True\n2. False`,
      () => {
        const userAnswer = prompt("Enter 1 for True or 2 for False:");
        const isCorrect = (userAnswer === "1" && questionData.answer === true) || 
                          (userAnswer === "2" && questionData.answer === false);

        if (isCorrect) {
          displayDialogue("Correct! You've earned a point!", onAnswer);
        } else {
          displayDialogue(`Incorrect. The correct answer was: ${questionData.answer ? "True" : "False"}`, onAnswer);
        }
      }
    );
  }
}

// Load sprites
k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map3.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map3.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    { speed: 250, direction: "down", isInDialogue: false },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name && boundary.name !== "wall" && boundary.name !== "outsidewall") {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
          
            // Check if the boundary should trigger a quiz question
            const dialogueEntry = dialogueData[boundary.name];
            
            if (dialogueEntry && dialogueEntry.type) {
              // If dialogueEntry is a quiz question, trigger it
              displayQuizQuestion(dialogueEntry, () => {
                player.isInDialogue = false;
              });
            } else {
              // If it's a standard dialogue entry, show the dialogue text
              const dialogueMessage = typeof dialogueEntry === 'function' ? dialogueEntry() : dialogueEntry;
              
              displayDialogue(
                dialogueMessage,
                () => {
                  player.isInDialogue = false;
                }
              );
            }
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
    
          // Display the 'welcome' dialogue when the player spawns
          player.isInDialogue = true;
          displayDialogue(dialogueData.welcome, () => {
            player.isInDialogue = false;
          });
    
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => setCamScale(k));

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);
    const lowerBound = 50;
    const upperBound = 125;

    if (mouseAngle > lowerBound && mouseAngle < upperBound) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
    } else if (mouseAngle < -lowerBound && mouseAngle > -upperBound) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
    } else if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
    } else {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
    }
  });

  function stopAnims() {
    player.play(`idle-${player.direction}`);
  }

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);
  k.onKeyDown((key) => {
    if (player.isInDialogue) return;
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    if (keyMap[0]) player.move(player.speed, 0);
    if (keyMap[1]) player.move(-player.speed, 0);
    if (keyMap[2]) player.move(0, -player.speed);
    if (keyMap[3]) player.move(0, player.speed);
  });
});

k.go("main");
