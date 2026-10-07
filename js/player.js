/**
 * Player Controller
 * Manages timeline playback, play/pause state, speed adjustment, and keyboard controls.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FibreMST = root.FibreMST || {};
    root.FibreMST.Player = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  class Player {
    constructor(appState, elements = {}) {
      this.state = appState;
      this.elements = elements;

      this.bindControls();
      this.bindKeyboardShortcuts();

      // Subscribe to state updates
      this.state.subscribe((state, eventType) => {
        this.updateUiState(state);
      });
    }

    bindControls() {
      const {
        btnCalculate,
        btnPlayerCalc,
        btnEditMode,
        btnFirst,
        btnPrev,
        btnPlay,
        btnNext,
        btnLast,
        btnReset,
        sliderStep,
        sliderSpeed,
        speedLabel
      } = this.elements;

      const triggerCalc = () => {
        const runFn = (window.FibreMST && window.FibreMST.runPrimsAlgorithm) ?
          window.FibreMST.runPrimsAlgorithm : null;
        if (runFn) {
          this.state.startSimulation(runFn);
        }
      };

      if (btnCalculate) {
        btnCalculate.addEventListener('click', triggerCalc);
      }

      if (btnPlayerCalc) {
        btnPlayerCalc.addEventListener('click', triggerCalc);
      }

      if (btnEditMode) {
        btnEditMode.addEventListener('click', () => {
          this.state.exitSimulation();
        });
      }

      if (btnPlay) {
        btnPlay.addEventListener('click', () => {
          this.state.togglePlayPause();
        });
      }

      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          this.state.stepPrev();
        });
      }

      if (btnNext) {
        btnNext.addEventListener('click', () => {
          this.state.stepNext();
        });
      }

      if (btnFirst) {
        btnFirst.addEventListener('click', () => {
          this.state.goToStep(0);
        });
      }

      if (btnLast) {
        btnLast.addEventListener('click', () => {
          const snapshots = this.state.snapshots;
          if (snapshots.length > 0) {
            this.state.goToStep(snapshots.length - 1);
          }
        });
      }

      if (btnReset) {
        btnReset.addEventListener('click', () => {
          this.state.goToStep(0);
        });
      }

      if (sliderStep) {
        sliderStep.addEventListener('input', (e) => {
          const stepIndex = parseInt(e.target.value, 10);
          this.state.goToStep(stepIndex);
        });
      }

      if (sliderSpeed) {
        sliderSpeed.addEventListener('input', (e) => {
          // Inverted or linear scale: 200ms (fast) to 2000ms (slow)
          const val = parseInt(e.target.value, 10);
          this.state.setPlaybackSpeed(val);
          if (speedLabel) {
            const sec = (val / 1000).toFixed(1);
            speedLabel.textContent = `${sec}s/step`;
          }
        });
      }
    }

    bindKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Only active during visualization mode and outside inputs
        if (this.state.mode !== 'visualize') return;
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        if (e.code === 'Space') {
          e.preventDefault();
          this.state.togglePlayPause();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          this.state.stepNext();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          this.state.stepPrev();
        } else if (e.code === 'Home') {
          e.preventDefault();
          this.state.goToStep(0);
        } else if (e.code === 'End') {
          e.preventDefault();
          const snaps = this.state.snapshots;
          if (snaps.length > 0) this.state.goToStep(snaps.length - 1);
        }
      });
    }

    updateUiState(state) {
      const isViz = state.mode === 'visualize';
      const snaps = state.snapshots;
      const count = snaps.length;
      const curr = state.currentStepIndex;

      const {
        panelEditorToolbar,
        panelPlaybackControls,
        btnPlay,
        sliderStep,
        stepCounterBadge,
        btnPrev,
        btnNext,
        btnFirst,
        btnLast
      } = this.elements;

      if (panelEditorToolbar) {
        panelEditorToolbar.style.display = isViz ? 'none' : 'flex';
      }

      if (panelPlaybackControls) {
        panelPlaybackControls.style.display = isViz ? 'flex' : 'none';
      }

      if (sliderStep && count > 0) {
        sliderStep.max = count - 1;
        sliderStep.value = curr;
        sliderStep.disabled = !isViz;
      }

      if (stepCounterBadge) {
        stepCounterBadge.textContent = isViz && count > 0 ?
          `Step ${curr + 1} / ${count}` : `Ready to Calculate`;
      }

      if (btnPlay) {
        btnPlay.innerHTML = state.isPlaying ?
          '<span class="icon-pause">⏸</span> Pause' :
          '<span class="icon-play">▶</span> Play';
        btnPlay.classList.toggle('is-playing', state.isPlaying);
      }

      if (btnPrev) btnPrev.disabled = !isViz || curr <= 0;
      if (btnFirst) btnFirst.disabled = !isViz || curr <= 0;
      if (btnNext) btnNext.disabled = !isViz || curr >= count - 1;
      if (btnLast) btnLast.disabled = !isViz || curr >= count - 1;

      if (this.elements.btnEditMode) {
        this.elements.btnEditMode.style.display = isViz ? 'inline-flex' : 'none';
      }
      if (this.elements.btnPlayerCalc) {
        this.elements.btnPlayerCalc.style.display = isViz ? 'none' : 'inline-flex';
      }
    }
  }

  return Player;
});

