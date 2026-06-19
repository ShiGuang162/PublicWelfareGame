/**
 * 急救先锋 - UI 渲染与交互
 * 页面切换、事件绑定、动画控制
 */

const App = {
  currentSection: 'home',
  game: null,
  tipIndex: 0,

  tips: [
    '心脏骤停后4分钟内开始CPR，存活率可提高2-3倍！',
    '止血带每隔40-60分钟要放松1-2分钟，防止肢体坏死。',
    '火灾时烟气上升，低姿匍匐可大幅提高生存率。',
    '溺水者救上岸后不要控水！立即进行人工呼吸或CPR。',
    '热射病10分钟内降温是关键，致死率与降温速度成正比。',
    '1岁以下婴儿异物卡喉，不能用腹部冲击，要用拍背压胸法。',
    '地震时切勿使用电梯！疏散楼梯是唯一选择。',
    '发现触电者，第一步永远是切断电源，切勿直接用手拉！'
  ],

  init() {
    this.bindEvents();
    this.renderHome();
    this.startTipCarousel();
    this.showSection('home');
  },

  showSection(id) {
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) {
      target.style.display = 'block';
      requestAnimationFrame(() => target.classList.add('active'));
    }
    this.currentSection = id;
    window.scrollTo(0, 0);
  },

  bindEvents() {
    // 首页
    document.getElementById('btn-start').addEventListener('click', () => {
      this.renderLevels();
      this.showSection('levels');
    });
    document.getElementById('btn-leaderboard').addEventListener('click', () => {
      this.renderLeaderboard();
      this.showSection('leaderboard');
    });
    document.getElementById('btn-handbook').addEventListener('click', () => {
      this.renderHandbook();
      this.showSection('handbook');
    });
    document.getElementById('btn-nickname').addEventListener('click', () => this.editNickname());

    // 选关页
    document.getElementById('btn-levels-back').addEventListener('click', () => this.showSection('home'));

    // 答题页
    document.getElementById('btn-quit').addEventListener('click', () => {
      if (confirm('确定要退出当前关卡吗？进度将不保存。')) {
        if (this.game) this.game.destroy();
        this.showSection('levels');
      }
    });

    // 结算页
    document.getElementById('btn-result-home').addEventListener('click', () => this.showSection('home'));
    document.getElementById('btn-result-review').addEventListener('click', () => this.showReview());
    document.getElementById('btn-result-leaderboard').addEventListener('click', () => {
      this.renderLeaderboard();
      this.showSection('leaderboard');
    });

    // 排行榜
    document.getElementById('btn-leaderboard-back').addEventListener('click', () => this.showSection('home'));
    document.getElementById('btn-submit-score').addEventListener('click', () => this.submitScore());

    // 知识手册
    document.getElementById('btn-handbook-back').addEventListener('click', () => this.showSection('home'));
    document.getElementById('handbook-search').addEventListener('input', (e) => this.filterHandbook(e.target.value));

    // 错题回顾弹窗
    document.getElementById('btn-review-close').addEventListener('click', () => {
      document.getElementById('review-modal').classList.remove('active');
    });
  },

  startTipCarousel() {
    const el = document.getElementById('tip-text');
    if (!el) return;
    setInterval(() => {
      this.tipIndex = (this.tipIndex + 1) % this.tips.length;
      el.style.opacity = 0;
      setTimeout(() => {
        el.textContent = this.tips[this.tipIndex];
        el.style.opacity = 1;
      }, 300);
    }, 5000);
  },

  renderHome() {
    const data = Storage.loadData();
    const tierInfo = Storage.getTierProgress(data.flowers);
    const nickname = data.nickname || '匿名急救员';

    document.getElementById('home-nickname').textContent = nickname;
    document.getElementById('home-tier').textContent = tierInfo.current.emoji + ' ' + tierInfo.current.name;
    document.getElementById('home-tier').style.color = tierInfo.current.color;
    document.getElementById('home-flowers').textContent = data.flowers;
    document.getElementById('tip-text').textContent = this.tips[0];

    // 段位进度条
    const bar = document.getElementById('tier-progress-bar');
    const label = document.getElementById('tier-progress-label');
    if (tierInfo.next) {
      bar.style.width = tierInfo.percent + '%';
      bar.style.backgroundColor = tierInfo.current.color;
      label.textContent = `距离「${tierInfo.next.name}」还需 ${tierInfo.next.min - data.flowers} 朵小红花`;
    } else {
      bar.style.width = '100%';
      bar.style.backgroundColor = tierInfo.current.color;
      label.textContent = '恭喜！您已达到最高段位「急救大师」！';
    }

    // 通关进度
    const completed = data.completedLevels.length;
    const total = GAME_CONFIG.levelsCount;
    document.getElementById('home-progress').textContent = `已通关 ${completed}/${total} 关`;

    // 设置昵称输入框默认值
    const nickInput = document.getElementById('nickname-input');
    if (nickInput) nickInput.value = nickname;
  },

  editNickname() {
    const input = document.getElementById('nickname-input');
    const name = input.value.trim();
    if (!name) {
      alert('请输入昵称！');
      return;
    }
    Storage.setNickname(name);
    this.renderHome();
    alert('昵称已保存！');
  },

  renderLevels() {
    const container = document.getElementById('levels-grid');
    const data = Storage.loadData();
    container.innerHTML = '';

    LEVELS.forEach(level => {
      const unlocked = Storage.isLevelUnlocked(level.id);
      const stars = Storage.getLevelStars(level.id);
      const completed = data.completedLevels.includes(level.id);

      const card = document.createElement('div');
      card.className = `level-card ${unlocked ? '' : 'locked'}`;
      if (unlocked) {
        card.addEventListener('click', () => this.startLevel(level.id));
      }

      let starsHtml = '';
      for (let i = 0; i < 3; i++) {
        starsHtml += `<span class="star ${i < stars ? 'filled' : ''}">★</span>`;
      }

      card.innerHTML = `
        <div class="level-icon">${unlocked ? level.icon : '🔒'}</div>
        <div class="level-title">${level.title}</div>
        <div class="level-desc">${unlocked ? level.desc : '通关上一关解锁'}</div>
        <div class="level-stars">${starsHtml}</div>
        ${completed ? '<div class="level-badge">已通过</div>' : ''}
      `;

      container.appendChild(card);
    });
  },

  startLevel(levelId) {
    if (!Storage.isLevelUnlocked(levelId)) {
      alert('该关卡尚未解锁，请先通关前一关！');
      return;
    }

    this.game = new GameEngine();
    this.game.onTick = (t) => this.updateTimer(t);
    this.game.onQuestionEnd = (r) => this.handleQuestionEnd(r);
    this.game.onLevelEnd = (s) => this.handleLevelEnd(s);
    this.game.onTimeout = () => alert('时间到！本关挑战结束。');

    const q = this.game.startLevel(levelId);
    this.renderQuiz(q);
    this.showSection('quiz');
  },

  renderQuiz(q) {
    document.getElementById('quiz-level-title').textContent = `第${q.level}关：${LEVELS[q.level - 1].title}`;
    document.getElementById('quiz-progress').textContent = `${q.index + 1}/${q.total}`;
    document.getElementById('quiz-progress-bar').style.width = `${((q.index) / q.total) * 100}%`;
    document.getElementById('quiz-timer').textContent = this.game.timeLeft;
    document.getElementById('quiz-timer').className = 'timer';
    document.getElementById('quiz-question').textContent = q.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-label">${String.fromCharCode(65 + idx)}</span><span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => this.selectOption(idx, btn));
      optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback').classList.remove('active');
    document.getElementById('quiz-feedback').innerHTML = '';
    document.getElementById('btn-next').style.display = 'none';
  },

  updateTimer(timeLeft) {
    const el = document.getElementById('quiz-timer');
    el.textContent = timeLeft;
    if (timeLeft <= 10) {
      el.classList.add('warning');
    } else {
      el.classList.remove('warning');
    }
  },

  selectOption(index, btnElement) {
    const options = document.querySelectorAll('.option-btn');
    options.forEach(b => b.disabled = true);

    const result = this.game.answer(index);
    if (!result) return; // 游戏已结束（如时间耗尽），忽略此次点击

    const q = this.game.questions[this.game.currentIndex - 1];

    if (result.isCorrect) {
      btnElement.classList.add('correct');
      this.spawnParticles(btnElement, 'flower');
    } else {
      btnElement.classList.add('wrong');
      options[q.correct].classList.add('correct');
      btnElement.classList.add('shake');
    }

    // 显示反馈
    const feedback = document.getElementById('quiz-feedback');
    feedback.innerHTML = `
      <div class="feedback-${result.isCorrect ? 'correct' : 'wrong'}">
        <div class="feedback-icon">${result.isCorrect ? '✅' : '❌'}</div>
        <div class="feedback-title">${result.isCorrect ? (result.combo >= 3 ? `🎉 连续答对 ${result.combo} 题！` : '回答正确！') : '回答错误'}</div>
        <div class="feedback-explanation">${q.explanation}</div>
      </div>
    `;
    feedback.classList.add('active');

    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = 'block';
    nextBtn.textContent = result.isFinished ? '查看结果' : '下一题';
    nextBtn.onclick = () => {
      try {
        if (result.isFinished) {
          const summary = this.game.finishLevel();
          if (!summary) {
            // 如果游戏已结束（防重入），手动构建结果并显示
            console.warn('finishLevel 返回 null，手动显示结果');
            const fallback = {
              levelId: this.game.levelId,
              score: this.game.score,
              correctCount: this.game.correctCount,
              wrongCount: this.game.wrongCount,
              totalQuestions: this.game.questions.length,
              timeLeft: this.game.timeLeft,
              maxCombo: this.game.maxCombo,
              rate: this.game.correctCount / this.game.questions.length,
              passed: false,
              stars: 0,
              isNewRecord: false,
              upgraded: false,
              newTier: null,
              answers: this.game.answers,
              totalFlowers: Storage.loadData().flowers
            };
            this.handleLevelEnd(fallback);
          }
        } else {
          const nextQ = this.game.getCurrentQuestion();
          this.renderQuiz(nextQ);
        }
      } catch (e) {
        console.error('点击下一题/查看结果按钮出错:', e);
        alert('操作出错，请刷新页面重试');
      }
    };
  },

  handleQuestionEnd(result) {
    // 已在 selectOption 中处理视觉反馈
  },

  handleLevelEnd(summary) {
    console.log('handleLevelEnd called', JSON.stringify(summary));
    try {
      this.renderResult(summary);
      this.showSection('result');
    } catch (e) {
      console.error('结果页渲染异常:', e);
      // 即使渲染失败也强制跳转到结果页
      this.showSection('result');
    }
  },

  renderResult(summary) {
    const level = LEVELS[summary.levelId - 1];
    document.getElementById('result-title').textContent = summary.passed ? '🎉 闯关成功！' : '😢 闯关失败';
    document.getElementById('result-title').className = summary.passed ? 'result-title success' : 'result-title fail';
    document.getElementById('result-level').textContent = `${level.icon} ${level.title}`;

    // 星星
    const starsEl = document.getElementById('result-stars');
    starsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const s = document.createElement('span');
      s.className = `star ${i < summary.stars ? 'filled' : ''}`;
      s.textContent = '★';
      starsEl.appendChild(s);
    }

    document.getElementById('result-score').textContent = summary.score;
    document.getElementById('result-correct').textContent = `${summary.correctCount}/${summary.totalQuestions}`;
    document.getElementById('result-time').textContent = `${GAME_CONFIG.timePerLevel - summary.timeLeft}秒`;
    document.getElementById('result-combo').textContent = summary.maxCombo;

    const tier = Storage.getTier(summary.totalFlowers);
    document.getElementById('result-tier').textContent = `${tier.emoji} ${tier.name}`;
    document.getElementById('result-tier').style.color = tier.color;
    document.getElementById('result-flowers').textContent = summary.totalFlowers;

    // 段位升级特效
    const upgradeEl = document.getElementById('result-upgrade');
    if (summary.upgraded && summary.newTier) {
      upgradeEl.innerHTML = `
        <div class="upgrade-banner">
          <div class="upgrade-icon">🎊</div>
          <div>段位提升！</div>
          <div class="upgrade-tier" style="color:${summary.newTier.color}">${summary.newTier.emoji} ${summary.newTier.name}</div>
        </div>
      `;
      upgradeEl.classList.add('active');
      this.spawnConfetti();
    } else {
      upgradeEl.classList.remove('active');
      upgradeEl.innerHTML = '';
    }

    // 下一关按钮状态
    const nextBtn = document.getElementById('btn-result-next');
    if (summary.passed && summary.levelId < GAME_CONFIG.levelsCount) {
      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = '下一关';
      nextBtn.onclick = () => this.startLevel(summary.levelId + 1);
    } else if (summary.levelId >= GAME_CONFIG.levelsCount && summary.passed) {
      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = '返回首页';
      nextBtn.onclick = () => this.showSection('home');
    } else {
      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = '重新挑战';
      nextBtn.onclick = () => this.startLevel(summary.levelId);
    }

    // 保存到排行榜（仅通关）
    if (summary.passed) {
      const data = Storage.loadData();
      Storage.addLeaderboardEntry(data.nickname, data.flowers, data.completedLevels);
    }
  },

  showReview() {
    const modal = document.getElementById('review-modal');
    const list = document.getElementById('review-list');
    list.innerHTML = '';

    if (!this.game || !this.game.answers.length) {
      list.innerHTML = '<div class="review-empty">暂无答题记录</div>';
      modal.classList.add('active');
      return;
    }

    this.game.answers.forEach((a, i) => {
      const item = document.createElement('div');
      item.className = `review-item ${a.isCorrect ? 'correct' : 'wrong'}`;
      item.innerHTML = `
        <div class="review-header">
          <span class="review-num">${i + 1}</span>
          <span class="review-status">${a.isCorrect ? '✅ 正确' : '❌ 错误'}</span>
        </div>
        <div class="review-question">${a.question}</div>
        <div class="review-answer">
          <div>你的答案：${String.fromCharCode(65 + a.selected)}. ${a.options[a.selected]}</div>
          ${!a.isCorrect ? `<div>正确答案：${String.fromCharCode(65 + a.correct)}. ${a.options[a.correct]}</div>` : ''}
        </div>
        <div class="review-explanation">${a.explanation}</div>
      `;
      list.appendChild(item);
    });

    modal.classList.add('active');
  },

  renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    const board = Storage.getLeaderboard();
    list.innerHTML = '';

    if (!board.length) {
      list.innerHTML = '<div class="leaderboard-empty">暂无记录，快来成为第一个急救先锋吧！</div>';
      return;
    }

    board.forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `<span class="rank-num">${i + 1}</span>`;
      row.innerHTML = `
        <div class="leaderboard-rank">${medal}</div>
        <div class="leaderboard-name">${entry.nickname}</div>
        <div class="leaderboard-tier" style="color:${TIERS.find(t => t.name === entry.tier)?.color || '#666'}">${entry.tier}</div>
        <div class="leaderboard-flowers">${entry.flowers} 🌸</div>
      `;
      list.appendChild(row);
    });
  },

  submitScore() {
    const data = Storage.loadData();
    if (!data.nickname) {
      const name = prompt('请输入您的昵称：')?.trim();
      if (!name) return;
      Storage.setNickname(name);
    }
    Storage.addLeaderboardEntry(data.nickname, data.flowers, data.completedLevels);
    this.renderLeaderboard();
    alert('成绩已提交到排行榜！');
  },

  renderHandbook() {
    const list = document.getElementById('handbook-list');
    list.innerHTML = '';

    LEVELS.forEach(level => {
      const section = document.createElement('div');
      section.className = 'handbook-section';
      section.dataset.category = level.title;

      const header = document.createElement('div');
      header.className = 'handbook-header';
      header.innerHTML = `<span class="handbook-icon">${level.icon}</span> ${level.title}`;
      section.appendChild(header);

      const questions = ALL_QUESTIONS.filter(q => q.level === level.id);
      questions.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = 'handbook-item';
        item.dataset.search = `${q.question} ${q.explanation} ${level.title}`;
        item.innerHTML = `
          <div class="handbook-q">${i + 1}. ${q.question}</div>
          <div class="handbook-a">正确答案：${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}</div>
          <div class="handbook-exp">${q.explanation}</div>
        `;
        section.appendChild(item);
      });

      list.appendChild(section);
    });
  },

  filterHandbook(keyword) {
    const items = document.querySelectorAll('.handbook-item');
    const sections = document.querySelectorAll('.handbook-section');
    const lower = keyword.toLowerCase();

    items.forEach(item => {
      const text = item.dataset.search.toLowerCase();
      item.style.display = text.includes(lower) ? 'block' : 'none';
    });

    sections.forEach(sec => {
      const visible = sec.querySelectorAll('.handbook-item[style*="block"]').length;
      sec.style.display = visible > 0 ? 'block' : 'none';
    });
  },

  spawnParticles(element, type) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = type === 'flower' ? '🌸' : '✨';
      p.style.left = centerX + 'px';
      p.style.top = centerY + 'px';
      p.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
      p.style.setProperty('--ty', (Math.random() - 1) * 100 + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  },

  spawnConfetti() {
    const colors = ['#E53935', '#FFD54F', '#4CAF50', '#26C6DA', '#B39DDB'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.animationDuration = (Math.random() * 2 + 2) + 's';
      c.style.animationDelay = (Math.random() * 0.5) + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }
};

if (typeof window !== 'undefined') {
  window.App = App;
}
