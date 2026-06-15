/**
 * 急救先锋 - 本地存储封装
 * 管理用户进度、排行榜、段位数据
 */

const STORAGE_KEY = 'firstaid_hero_data';

const DEFAULT_DATA = {
  nickname: '',
  flowers: 0,
  completedLevels: [],
  bestScores: {}, // { levelId: { score, stars, time, date } }
  leaderboard: [],
  handbookRead: [],
  firstVisit: true
};

function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {
    console.warn('Storage load failed:', e);
  }
  return { ...DEFAULT_DATA };
}

function saveData(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('Storage save failed:', e);
    return false;
  }
}

function getTier(flowers) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (flowers >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

function getNextTier(flowers) {
  const current = getTier(flowers);
  const idx = TIERS.indexOf(current);
  return TIERS[idx + 1] || null;
}

function getTierProgress(flowers) {
  const current = getTier(flowers);
  const idx = TIERS.indexOf(current);
  const next = TIERS[idx + 1];
  if (!next) return { current, next: null, percent: 100 };
  const range = next.min - current.min;
  const progress = flowers - current.min;
  const percent = Math.min(100, Math.floor((progress / range) * 100));
  return { current, next, percent };
}

function addFlowers(amount) {
  const data = loadData();
  const oldTier = getTier(data.flowers);
  data.flowers += amount;
  const newTier = getTier(data.flowers);
  saveData(data);
  return { data, oldTier, newTier, upgraded: oldTier.name !== newTier.name };
}

function recordLevelScore(levelId, score, correctCount, totalTime, comboMax) {
  const data = loadData();
  const stars = calculateStars(correctCount, GAME_CONFIG.questionsPerLevel, totalTime);
  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels.push(levelId);
  }
  const prev = data.bestScores[levelId];
  if (!prev || score > prev.score) {
    data.bestScores[levelId] = {
      score,
      stars,
      time: totalTime,
      date: Date.now(),
      correctCount
    };
  }
  saveData(data);
  return { data, stars, isNewRecord: !prev || score > prev.score };
}

function calculateStars(correctCount, totalQuestions, timeLeft) {
  const rate = correctCount / totalQuestions;
  if (rate === 1 && timeLeft > 30) return 3;
  if (rate >= 0.8) return 2;
  if (rate >= 0.6) return 1;
  return 0;
}

function isLevelUnlocked(levelId) {
  if (levelId === 1) return true;
  const data = loadData();
  return data.completedLevels.includes(levelId - 1);
}

function getLevelStars(levelId) {
  const data = loadData();
  return data.bestScores[levelId]?.stars || 0;
}

function addLeaderboardEntry(nickname, flowers, completedLevels) {
  const data = loadData();
  const entry = {
    nickname: nickname || '匿名急救员',
    flowers,
    completedLevels: completedLevels.length,
    date: Date.now(),
    tier: getTier(flowers).name
  };
  data.leaderboard.push(entry);
  data.leaderboard.sort((a, b) => b.flowers - a.flowers);
  data.leaderboard = data.leaderboard.slice(0, 20);
  saveData(data);
  return data.leaderboard;
}

function getLeaderboard() {
  return loadData().leaderboard;
}

function resetProgress() {
  saveData({ ...DEFAULT_DATA });
}

function setNickname(name) {
  const data = loadData();
  data.nickname = name;
  saveData(data);
}

function getNickname() {
  return loadData().nickname;
}

// 导出
if (typeof window !== 'undefined') {
  window.Storage = {
    loadData,
    saveData,
    getTier,
    getNextTier,
    getTierProgress,
    addFlowers,
    recordLevelScore,
    calculateStars,
    isLevelUnlocked,
    getLevelStars,
    addLeaderboardEntry,
    getLeaderboard,
    resetProgress,
    setNickname,
    getNickname
  };
}
