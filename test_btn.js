const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const filePath = path.join(__dirname, 'index.html');
  await page.goto('file://' + filePath);

  // 等待页面加载
  await page.waitForTimeout(500);
  console.log('页面标题:', await page.title());

  // 点击开始闯关
  await page.click('#btn-start');
  await page.waitForTimeout(300);

  // 点击第一关
  const levelCards = await page.locator('.level-card').all();
  if (levelCards.length > 0) {
    await levelCards[0].click();
    await page.waitForTimeout(300);
  }

  // 答完5题
  for (let i = 0; i < 5; i++) {
    const options = await page.locator('.option-btn').all();
    if (options.length > 0) {
      await options[0].click();
      await page.waitForTimeout(300);

      // 检查是否有"查看结果"或"下一题"按钮
      const nextBtn = await page.locator('#btn-next');
      const isVisible = await nextBtn.isVisible().catch(() => false);
      const text = await nextBtn.textContent().catch(() => '');
      console.log(`第${i+1}题后 - btn-next 可见:${isVisible}, 文字:"${text.trim()}"`);

      if (isVisible && text.includes('查看结果')) {
        console.log('>>> 发现"查看结果"按钮，准备点击');
        // 监听 console 和页面跳转
        page.on('console', msg => console.log('  [console]', msg.text()));
        page.on('pageerror', err => console.log('  [pageerror]', err.message));

        await nextBtn.click();
        await page.waitForTimeout(800);

        // 检查当前显示的 section
        const activeSection = await page.evaluate(() => {
          const sections = document.querySelectorAll('.section');
          for (const s of sections) {
            if (s.style.display === 'block' || s.classList.contains('active')) return s.id;
          }
          return 'none';
        });
        console.log('点击后当前显示页面:', activeSection);

        // 检查 result 页面是否可见
        const resultVisible = await page.locator('#result').isVisible().catch(() => false);
        console.log('result 页面是否可见:', resultVisible);
      } else if (isVisible) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      }
    }
  }

  // 检查 btn-next 的事件监听
  const listeners = await page.evaluate(() => {
    const btn = document.getElementById('btn-next');
    if (!btn) return 'btn-next not found';
    // 获取所有事件监听（Chrome DevTools Protocol 方式）
    return {
      onclick: btn.onclick ? btn.onclick.toString() : 'null',
      outerHTML: btn.outerHTML
    };
  });
  console.log('btn-next 事件检查:', JSON.stringify(listeners, null, 2));

  // 检查 game 对象状态
  const gameState = await page.evaluate(() => {
    if (window.App && window.App.game) {
      const g = window.App.game;
      return {
        state: g.state,
        currentIndex: g.currentIndex,
        totalQuestions: g.questions.length,
        hasOnLevelEnd: !!g.onLevelEnd,
        onLevelEndString: g.onLevelEnd ? g.onLevelEnd.toString().substring(0, 100) : 'null'
      };
    }
    return 'window.App.game not found';
  });
  console.log('Game 状态:', JSON.stringify(gameState, null, 2));

  await browser.close();
})();
