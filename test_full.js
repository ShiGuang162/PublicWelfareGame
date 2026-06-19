const vm = require('vm');
const fs = require('fs');

// 构建一个更完整的浏览器模拟环境
const dom = {};
function $(id) {
  if (!dom[id]) {
    dom[id] = {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      classList: { add: ()=>{}, remove: ()=>{} },
      addEventListener: ()=>{},
      onclick: null,
      disabled: false,
      appendChild: (c) => {},
      querySelectorAll: () => []
    };
  }
  return dom[id];
}

const context = {
  window: {},
  document: {
    getElementById: $,
    querySelectorAll: (sel) => {
      if (sel === '.option-btn') return [];
      return [];
    },
    querySelector: () => null,
    body: { appendChild: ()=>{}, style: {} }
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  console: { log: (...a) => console.log(...a), error: (...a) => console.error(...a), warn: (...a) => console.warn(...a) },
  setInterval: (fn) => { setTimeout(fn, 10); return 1; },
  clearInterval: () => {},
  setTimeout: (fn, t) => { if (t <= 10) fn(); },
  requestAnimationFrame: (fn) => fn(),
  alert: (m) => console.log('ALERT:', m),
  confirm: () => true,
  prompt: () => null,
  Math, Date, JSON, Array, Object, String, Number, parseInt, parseFloat, isNaN, isFinite, Infinity, NaN, undefined,
  Error, TypeError, ReferenceError, SyntaxError, RegExp, Promise, Set, Map
};
context.window.localStorage = context.localStorage;
context.window.scrollTo = () => {};

vm.createContext(context);

const dataJs = fs.readFileSync('js/data.js', 'utf-8');
const storageJs = fs.readFileSync('js/storage.js', 'utf-8');
const gameJs = fs.readFileSync('js/game.js', 'utf-8');
const appJs = fs.readFileSync('js/app.js', 'utf-8');

vm.runInContext(dataJs, context);
vm.runInContext(storageJs, context);
vm.runInContext(gameJs, context);
vm.runInContext(appJs, context);

const App = context.window.App;

// 模拟 showSection 记录跳转
let currentSection = 'home';
App.showSection = function(id) {
  currentSection = id;
  console.log('>>> showSection:', id);
};

App.renderResult = function(summary) {
  console.log('>>> renderResult called, passed=' + summary.passed);
};

App.spawnConfetti = () => {};

console.log('=== 模拟完整答题流程 ===');
App.game = new context.window.GameEngine();
App.game.onLevelEnd = (s) => App.handleLevelEnd(s);
App.game.onTick = (t) => {};
App.game.onQuestionEnd = (r) => {};
App.game.onTimeout = () => console.log('>>> onTimeout');

App.game.startLevel(1);
console.log('游戏状态:', App.game.state, '题目数:', App.game.questions.length);

// 模拟答5题
for (let i = 0; i < 5; i++) {
  const result = App.game.answer(0);
  console.log(`第${i+1}题: isCorrect=${result.isCorrect}, isFinished=${result.isFinished}`);
  
  if (result.isFinished) {
    console.log('--- 模拟点击"查看结果"按钮 ---');
    console.log('btn-next onclick:', dom['btn-next'].onclick ? '已绑定' : '未绑定');
    
    if (dom['btn-next'].onclick) {
      dom['btn-next'].onclick();
    } else {
      console.log('错误: btn-next 没有 onclick!');
    }
    
    console.log('当前页面:', currentSection);
    console.log('Test:', currentSection === 'result' ? 'PASS' : 'FAIL');
  }
}
