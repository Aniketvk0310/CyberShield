/* Quiz logic for the CyberShield awareness test */
(() => {
  const form = document.getElementById("quiz-form");
  const result = document.getElementById("quiz-result");
  const scoreText = document.getElementById("quiz-score");
  if (!form || !result || !scoreText) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const questions = form.querySelectorAll(".quiz-question");
    let score = 0;
    let answered = 0;

    questions.forEach((question) => {
      const selected = question.querySelector("input[type=radio]:checked");
      if (selected) {
        answered += 1;
        if (selected.dataset.correct === "true") score += 1;
      }
    });

    if (answered !== questions.length) {
      result.className = "alert alert-warning";
      result.textContent = "Please answer all questions before submitting.";
      result.removeAttribute("hidden");
      return;
    }

    const percent = Math.round((score / questions.length) * 100);
    scoreText.textContent = `${score}/${questions.length} (${percent}%)`;

    result.className = percent >= 80 ? "alert alert-success" : percent >= 60 ? "alert alert-info" : "alert alert-danger";
    result.textContent = percent >= 80
      ? "Excellent! You are cyber aware."
      : percent >= 60
        ? "Good job! Review the tips to get even safer."
        : "Time to review the safety sections and try again.";
    result.removeAttribute("hidden");
  });
})();
