export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close");


  dialogueUI.style.display = "block";


  let index = 0;
  let currentText = "";

  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 1);


  function onClose() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onClose);
    window.close(); // Automatically closes the tab
  }

  closeBtn.addEventListener("click", onClose);

  // Detect any answer selection and automatically close the tab
  document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener("click", () => {
      const selectedAnswer = input.value; // Store this for further processing if needed
      onClose(); // Close the tab after capturing the answer
    });
  });

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);

  addEventListener("keypress", (key) => {
    if (key.code === "Enter") {
      closeBtn.click();
    }
  });
}

export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}


export function displayQuestions(questions, onAnswersSubmit) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  const closeBtn = document.getElementById("close");
  
  dialogueUI.style.display = "block";
  
  let index = 0;
  let userAnswers = Array(questions.length).fill(null);

  function renderQuestion() {
    dialogue.innerHTML = `
      <p>${questions[index].question}</p>
      <input type="text" id="answerInput" placeholder="Enter your answer" />
      <p>${index + 1} of ${questions.length}</p>
    `;
  }

  renderQuestion();

  function onNextQuestion() {
    const answerInput = document.getElementById("answerInput");
    userAnswers[index] = answerInput.value;

    index++;
    if (index < questions.length) {
      renderQuestion();
    } else {
      onAnswersSubmit(userAnswers);
      dialogueUI.style.display = "none";
      dialogue.innerHTML = "";
      closeBtn.removeEventListener("click", onNextQuestion);
    }
  }

  closeBtn.addEventListener("click", onNextQuestion);
}
document.getElementById("start-game-btn").addEventListener("click", () => {
  const grade = document.getElementById("grade-select").value;
  const subject = document.getElementById("subject-select").value;
  const topic = document.getElementById("topic-select").value;

  if (grade && subject && topic) {
    // Hide the selection form and show the game canvas and dialogue box
    document.getElementById("selection-form").style.display = "none";
    document.getElementById("game").style.display = "block";
    document.getElementById("textbox-container").style.display = "block";

    console.log(`Starting game for: Grade ${grade}, Subject ${subject}, Topic ${topic}`);
    // Initialize or load your game logic here if needed
  } else {
    alert("Please select all options before starting the game.");
  }
});

// Close the dialogue box when the "Close" button is clicked
document.getElementById("close").addEventListener("click", () => {
  document.getElementById("textbox-container").style.display = "none";
});

const premiumGameBtn = document.getElementById("premium-game-btn");
    const paymentModal = document.getElementById("payment-modal");

    // Function to open the payment modal
    premiumGameBtn.addEventListener("click", () => {
      paymentModal.style.display = "block";
    });

    // Function to close the payment modal
    function closePaymentModal() {
      paymentModal.style.display = "none";
    }