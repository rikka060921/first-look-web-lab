(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const scrollProgress = $('#scrollProgress');
  const menuToggle = $('#menuToggle');
  const siteNav = $('#siteNav');

  function updateScrollProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    const value = total > 0 ? (scrollY / total) * 100 : 0;
    scrollProgress.style.width = `${Math.min(100, Math.max(0, value))}%`;
  }
  addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  menuToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '关闭' : '菜单';
  });
  $$('#siteNav a').forEach(link => link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '菜单';
  }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach(element => revealObserver.observe(element));

  const attentionCover = $('#attentionCover');
  const attentionStage = $('#attentionStage');
  const attentionCount = $('#attentionCount');
  const attentionAnswers = $('#attentionAnswers');
  const attentionFeedback = $('#attentionFeedback');
  const startAttention = $('#startAttention');
  let attentionTimer;

  startAttention.addEventListener('click', () => {
    clearInterval(attentionTimer);
    let count = 3;
    attentionCount.textContent = count;
    attentionCover.classList.add('is-running');
    attentionStage.classList.remove('is-finished');
    attentionAnswers.hidden = true;
    attentionFeedback.textContent = '测试进行中。';
    startAttention.disabled = true;

    attentionTimer = setInterval(() => {
      count -= 1;
      if (count > 0) attentionCount.textContent = count;
      else {
        clearInterval(attentionTimer);
        attentionCover.classList.remove('is-running');
        attentionStage.classList.add('is-finished');
        attentionAnswers.hidden = false;
        startAttention.disabled = false;
        startAttention.textContent = '重新测试';
        attentionFeedback.textContent = '选择你第一眼看到的内容。';
      }
    }, 1000);
  });

  $$('#attentionAnswers button').forEach(button => button.addEventListener('click', () => {
    const messages = {
      title: '你看到了标题。它体积最大，但按钮才是设计者希望用户完成的动作。',
      sale: '你看到了优惠标签。高饱和颜色抢走了本该属于主要行动的注意力。',
      price: '你看到了价格。倾斜与红色让它变得过于响亮。',
      button: '你找到了主要行动，但其他元素仍然增加了识别成本。'
    };
    attentionFeedback.textContent = messages[button.dataset.answer];
    $$('#attentionAnswers button').forEach(item => item.classList.toggle('is-active', item === button));
  }));

  const contrastRange = $('#contrastRange');
  const contrastCopy = $('#contrastCopy');
  const contrastValue = $('#contrastValue');
  const contrastResult = $('#contrastResult');
  function updateContrast() {
    const value = Number(contrastRange.value);
    contrastCopy.style.color = `rgba(17,19,15,${value / 100})`;
    contrastValue.textContent = `${value}%`;
    if (value < 35) contrastResult.textContent = '看不清：信息几乎没有抵达';
    else if (value < 58) contrastResult.textContent = '勉强可读：用户需要额外努力';
    else if (value < 86) contrastResult.textContent = '清晰：适合持续阅读';
    else contrastResult.textContent = '强烈：适合标题，不宜用于长文';
  }
  contrastRange.addEventListener('input', updateContrast);
  updateContrast();

  $$('[data-spacing]').forEach(button => button.addEventListener('click', () => {
    const sample = $('#spacingSample');
    sample.className = `spacing-sample is-${button.dataset.spacing}`;
    $$('[data-spacing]').forEach(item => item.classList.toggle('is-active', item === button));
  }));

  $$('[data-hierarchy]').forEach(button => button.addEventListener('click', () => {
    const sample = $('#hierarchySample');
    sample.className = `hierarchy-sample is-${button.dataset.hierarchy}`;
    $$('[data-hierarchy]').forEach(item => item.classList.toggle('is-active', item === button));
  }));

  const saveDemo = $('#saveDemo');
  const saveStatus = $('#saveStatus');
  const saveText = $('#saveText');
  let saveTimer;
  saveDemo.addEventListener('click', () => {
    clearInterval(saveTimer);
    saveStatus.className = 'save-status';
    saveStatus.style.removeProperty('--progress');
    const mode = $('input[name="feedbackMode"]:checked').value;

    if (mode === 'silent') {
      saveText.textContent = '等待操作';
      saveDemo.disabled = true;
      setTimeout(() => {
        saveDemo.disabled = false;
        saveText.textContent = '刚才没有任何反馈，你是否开始怀疑它没有保存？';
      }, 1500);
    } else if (mode === 'spinner') {
      saveStatus.classList.add('is-spinning');
      saveText.textContent = '处理中，但不知道还要多久…';
      setTimeout(() => {
        saveStatus.className = 'save-status';
        saveText.textContent = '只有转圈，仍然无法判断进度。';
      }, 2200);
    } else if (mode === 'progress') {
      let progress = 0;
      saveStatus.classList.add('is-progress');
      saveText.textContent = '正在保存 0%';
      saveTimer = setInterval(() => {
        progress = Math.min(100, progress + 10);
        saveStatus.style.setProperty('--progress', `${progress}%`);
        saveText.textContent = `正在保存 ${progress}%`;
        if (progress >= 100) {
          clearInterval(saveTimer);
          saveStatus.className = 'save-status is-done';
          saveText.textContent = '保存完成，可以继续浏览。';
        }
      }, 100);
    } else {
      saveStatus.classList.add('is-done');
      saveText.textContent = '已保存，可以继续浏览。';
    }
  });

  let controlMode = 'good';
  const controlDemo = $('#controlDemo');
  const controlDialog = $('#controlDialog');
  const controlNote = $('#controlNote');
  $$('[data-control]').forEach(button => button.addEventListener('click', () => {
    controlMode = button.dataset.control;
    controlDemo.className = `control-demo is-${controlMode}`;
    controlDialog.hidden = true;
    controlNote.textContent = controlMode === 'good'
      ? '关闭在右上，主要操作在右侧，用户不需要重新学习。'
      : '关闭被藏在左下，颜色和顺序违反习惯，用户需要猜测。';
    $$('[data-control]').forEach(item => item.classList.toggle('is-active', item === button));
  }));
  $('#openControl').addEventListener('click', () => { controlDialog.hidden = false; });
  $('#dialogClose').addEventListener('click', () => {
    if (controlMode === 'bad') controlNote.textContent = '你找到了关闭，但它不在用户习惯的位置。';
    controlDialog.hidden = true;
  });
  $('#dialogCancel').addEventListener('click', () => {
    controlDialog.hidden = true;
    controlNote.textContent = controlMode === 'good' ? '操作已取消，没有产生修改。' : '颜色和顺序颠倒，让取消也需要确认。';
  });
  $('#dialogConfirm').addEventListener('click', () => {
    controlDialog.hidden = true;
    controlNote.textContent = controlMode === 'good' ? '修改已保存，并且仍可继续编辑。' : '红色通常代表危险操作，用来确认会制造犹豫。';
  });

  const casePage = $('#casePage');
  const caseLabel = $('#caseLabel');
  const caseFindings = $('#caseFindings');
  $$('[data-case]').forEach(button => button.addEventListener('click', () => {
    const state = button.dataset.case;
    casePage.className = `case-page is-${state}`;
    caseLabel.textContent = `当前：${state === 'after' ? '调整后' : '调整前'}`;
    caseFindings.style.opacity = state === 'after' ? '1' : '.35';
    $$('[data-case]').forEach(item => item.classList.toggle('is-active', item === button));
  }));

  const auditChecks = $$('#auditForm input[type="checkbox"]');
  const auditScore = $('#auditScore');
  const auditLevel = $('#auditLevel');
  const auditAdvice = $('#auditAdvice');
  const scoreRing = $('#scoreRing');

  function updateAudit(save = true) {
    const checked = auditChecks.filter(input => input.checked);
    const score = Math.round((checked.length / auditChecks.length) * 100);
    auditScore.textContent = score;
    scoreRing.style.setProperty('--score', `${score * 3.6}deg`);

    if (score === 0) {
      auditLevel.textContent = '等待体检';
      auditAdvice.textContent = '先完成左侧检查，再决定最值得调整的一个问题。';
    } else if (score < 50) {
      auditLevel.textContent = '重点需要重建';
      auditAdvice.textContent = '先处理服务对象、核心表达和第一屏层级，不要急着增加动画。';
    } else if (score < 75) {
      auditLevel.textContent = '基础已经成立';
      auditAdvice.textContent = '优先修复尚未勾选的反馈与控制问题，让首次使用更安心。';
    } else if (score < 100) {
      auditLevel.textContent = '表达清晰';
      auditAdvice.textContent = '网站已经容易理解，再邀请第一次使用的人完成真实测试。';
    } else {
      auditLevel.textContent = '可以交付';
      auditAdvice.textContent = '所有基础标准都已覆盖。发布前再检查一次真实内容和移动端。';
    }

    if (save) {
      const values = checked.map(input => input.value);
      localStorage.setItem('first-look-audit', JSON.stringify(values));
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem('first-look-audit') || '[]');
    auditChecks.forEach(input => { input.checked = saved.includes(input.value); });
  } catch (_) {
    localStorage.removeItem('first-look-audit');
  }
  auditChecks.forEach(input => input.addEventListener('change', () => updateAudit(true)));
  $('#resetAudit').addEventListener('click', () => {
    auditChecks.forEach(input => { input.checked = false; });
    updateAudit(true);
  });
  $('#printResult').addEventListener('click', () => print());
  updateAudit(false);

  const captureTarget = new URLSearchParams(location.search).get('capture');
  if (captureTarget) {
    $$('.reveal').forEach(element => element.classList.add('is-visible'));
    setTimeout(() => document.getElementById(captureTarget)?.scrollIntoView(), 80);
  }
})();
