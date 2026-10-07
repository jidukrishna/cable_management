/**
 * Quiz Engine
 * Interactive question progression, instant feedback, explanation breakdown,
 * score calculation, and persistent high score tracking.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.Quiz = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class Quiz {
    constructor(containerElement, questions, storage) {
      this.container = containerElement;
      this.questions = questions || [];
      this.storage = storage;

      this.currentIndex = 0;
      this.score = 0;
      this.userAnswers = new Array(this.questions.length).fill(null);
      this.answeredCurrent = false;

      this.init();
    }

    init() {
      if (this.questions.length === 0) {
        this.container.innerHTML = `<p class="quiz-empty">No quiz questions available.</p>`;
        return;
      }
      this.renderQuestion();
    }

    renderQuestion() {
      const q = this.questions[this.currentIndex];
      const total = this.questions.length;
      const progressPercent = Math.round(((this.currentIndex) / total) * 100);

      const html = `
        <div class="quiz-card">
          <div class="quiz-header">
            <div class="quiz-progress-text">Question ${this.currentIndex + 1} of ${total}</div>
            <div class="quiz-score-badge">Score: ${this.score}</div>
          </div>
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%"></div>
          </div>

          <h3 class="quiz-question-title">${escapeHtml(q.question)}</h3>

          <div class="quiz-options-list">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option-btn" data-index="${idx}">
                <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="quiz-option-text">${escapeHtml(opt)}</span>
              </button>
            `).join('')}
          </div>

          <div class="quiz-feedback-box" style="display: none;"></div>

          <div class="quiz-actions" style="display: none;">
            <button class="btn-quiz-next">
              ${this.currentIndex < total - 1 ? 'Next Question →' : 'View Results ★'}
            </button>
          </div>
        </div>
      `;

      this.container.innerHTML = html;
      this.answeredCurrent = false;

      // Bind option clicks
      const optionButtons = this.container.querySelectorAll('.quiz-option-btn');
      optionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
          this.handleAnswer(selectedIdx);
        });
      });

      // Bind next button
      const nextBtn = this.container.querySelector('.btn-quiz-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (this.currentIndex < total - 1) {
            this.currentIndex++;
            this.renderQuestion();
          } else {
            this.renderResults();
          }
        });
      }
    }

    handleAnswer(selectedIdx) {
      if (this.answeredCurrent) return;
      this.answeredCurrent = true;

      const q = this.questions[this.currentIndex];
      const isCorrect = (selectedIdx === q.correctIndex);
      this.userAnswers[this.currentIndex] = selectedIdx;

      if (isCorrect) {
        this.score++;
      }

      // Update button visual styles
      const optionButtons = this.container.querySelectorAll('.quiz-option-btn');
      optionButtons.forEach(btn => {
        btn.disabled = true;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx === q.correctIndex) {
          btn.classList.add('option-correct');
        } else if (idx === selectedIdx && !isCorrect) {
          btn.classList.add('option-wrong');
        } else {
          btn.classList.add('option-dimmed');
        }
      });

      // Show feedback card
      const feedbackBox = this.container.querySelector('.quiz-feedback-box');
      if (feedbackBox) {
        feedbackBox.style.display = 'block';
        feedbackBox.className = `quiz-feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
        feedbackBox.innerHTML = `
          <div class="feedback-title">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
          <div class="feedback-body">${escapeHtml(q.explanation)}</div>
        `;
      }

      // Show action next button
      const actionRow = this.container.querySelector('.quiz-actions');
      if (actionRow) {
        actionRow.style.display = 'flex';
      }

      // Update score display in header
      const scoreBadge = this.container.querySelector('.quiz-score-badge');
      if (scoreBadge) scoreBadge.textContent = `Score: ${this.score}`;
    }

    renderResults() {
      const total = this.questions.length;
      const percentage = Math.round((this.score / total) * 100);

      // Save score to local storage
      if (this.storage && this.storage.saveQuizScore) {
        this.storage.saveQuizScore(this.score, total);
      }

      const prevBest = (this.storage && this.storage.loadQuizScore) ?
        this.storage.loadQuizScore() : null;

      let title = "Fibre Optic Apprentice";
      let summaryClass = "rank-apprentice";
      if (percentage >= 90) {
        title = "Chief Optical Network Architect! 🏆";
        summaryClass = "rank-architect";
      } else if (percentage >= 70) {
        title = "Senior Telecom Systems Engineer ⚡";
        summaryClass = "rank-engineer";
      } else if (percentage >= 50) {
        title = "Fibre Technician 📡";
        summaryClass = "rank-technician";
      }

      this.container.innerHTML = `
        <div class="quiz-results-card ${summaryClass}">
          <div class="results-badge">QUIZ COMPLETED</div>
          <h2 class="results-title">${title}</h2>
          <div class="results-score-circle">
            <span class="score-number">${this.score}</span>
            <span class="score-denom">/ ${total}</span>
          </div>
          <p class="results-percentage">${percentage}% Mastery of Prim's Algorithm & Fibre Network Design</p>

          ${prevBest ? `
            <div class="results-saved-record">
              Your record is saved in local browser storage.
            </div>
          ` : ''}

          <div class="results-buttons">
            <button class="btn-quiz-retry">↻ Retake Quiz</button>
            <button class="btn-quiz-back-viz">← Return to Visualizer</button>
          </div>
        </div>
      `;

      const retryBtn = this.container.querySelector('.btn-quiz-retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          this.currentIndex = 0;
          this.score = 0;
          this.userAnswers = new Array(this.questions.length).fill(null);
          this.renderQuestion();
        });
      }

      const backVizBtn = this.container.querySelector('.btn-quiz-back-viz');
      if (backVizBtn) {
        backVizBtn.addEventListener('click', () => {
          const vizTab = document.querySelector('[data-tab="visualizer"]');
          if (vizTab) vizTab.click();
        });
      }
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return Quiz;
});

