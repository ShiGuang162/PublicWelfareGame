/**
 * 急救先锋 - 游戏核心逻辑
 * 关卡状态、计时、答题流程、得分计算
 */

class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.levelId = 0;
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 0;
    this.timerId = null;
    this.answers = []; // { question, selected, correct, timeSpent }
    this.state = 'idle'; // idle | running | paused | finished
    this.onTick = null;
    this.onTimeout = null;
    this.onQuestionEnd = null;
    this.onLevelEnd = null;
  }

  startLevel(levelId) {
    this.reset();
    this.levelId = levelId;
    this.questions = ALL_QUESTIONS.filter(q => q.level === levelId);
    this.timeLeft = GAME_CONFIG.timePerLevel;
    this.state = 'running';
    this._startTimer();
    return this.getCurrentQuestion();
  }

  getCurrentQuestion() {
    if (this.currentIndex >= this.questions.length) return null;
    return {
      ...this.questions[this.currentIndex],
      index: this.currentIndex,
      total: this.questions.length
    };
  }

  answer(selectedIndex) {
    if (this.state !== 'running') return null;
    const q = this.questions[this.currentIndex];
    const isCorrect = selectedIndex === q.correct;
    const timeSpent = GAME_CONFIG.timePerLevel - this.timeLeft;

    if (isCorrect) {
      this.correctCount++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.score += GAME_CONFIG.baseScore + (this.combo >= 3 ? GAME_CONFIG.comboBonus : 0);
    } else {
      this.wrongCount++;
      this.combo = 0;
      this.timeLeft = Math.max(0, this.timeLeft - GAME_CONFIG.penaltyWrongTime);
    }

    this.answers.push({
      question: q.question,
      options: q.options,
      selected: selectedIndex,
      correct: q.correct,
      isCorrect,
      explanation: q.explanation,
      timeSpent
    });

    this.currentIndex++;

    const result = {
      isCorrect,
      correctIndex: q.correct,
      explanation: q.explanation,
      score: this.score,
      combo: this.combo,
      timeLeft: this.timeLeft,
      isFinished: this.currentIndex >= this.questions.length
    };

    if (this.onQuestionEnd) this.onQuestionEnd(result);

    return result;
  }

  finishLevel() {
    if (this.state === 'finished') return null; // 防重入
    this.state = 'finished';
    this._stopTimer();
    const timeBonus = this.timeLeft * GAME_CONFIG.timeBonusMultiplier;
    const totalScore = this.score + timeBonus;
    const maxComboBonus = this.maxCombo * GAME_CONFIG.comboBonus;
    const finalScore = totalScore + maxComboBonus;
    const rate = this.correctCount / this.questions.length;
    const passed = rate >= 0.6 && this.timeLeft > 0;

    const record = window.Storage.recordLevelScore(
      this.levelId,
      finalScore,
      this.correctCount,
      this.timeLeft,
      this.maxCombo
    );

    const flowerResult = passed ? window.Storage.addFlowers(finalScore) : { upgraded: false };

    const summary = {
      levelId: this.levelId,
      score: finalScore,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalQuestions: this.questions.length,
      timeLeft: this.timeLeft,
      maxCombo: this.maxCombo,
      rate,
      passed,
      stars: record.stars,
      isNewRecord: record.isNewRecord,
      upgraded: flowerResult.upgraded,
      newTier: flowerResult.newTier,
      answers: this.answers,
      totalFlowers: flowerResult.data?.flowers || window.Storage.loadData().flowers
    };

    if (this.onLevelEnd) this.onLevelEnd(summary);
    return summary;
  }

  _startTimer() {
    this._stopTimer();
    this.timerId = setInterval(() => {
      if (this.state !== 'running') return;
      this.timeLeft--;
      if (this.onTick) this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) {
        this._stopTimer();
        this.state = 'finished';
        if (this.onTimeout) this.onTimeout();
        this.finishLevel();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  pause() {
    if (this.state === 'running') {
      this.state = 'paused';
      this._stopTimer();
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.state = 'running';
      this._startTimer();
    }
  }

  destroy() {
    this._stopTimer();
    this.state = 'idle';
  }
}

if (typeof window !== 'undefined') {
  window.GameEngine = GameEngine;
}
