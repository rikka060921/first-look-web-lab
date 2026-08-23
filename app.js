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

  const labCarousel = $('#labCarousel');
  const labViewport = $('#labViewport');
  const labTrack = $('#labTrack');
  const labSlides = $$('[data-lab-slide]');
  const labTabs = $$('[data-lab-target]');
  const labPrev = $('#labPrev');
  const labNext = $('#labNext');
  const labCurrent = $('#labCurrent');
  const labName = $('#labName');
  const labNames = ['三秒注意力', '对比度', '留白', '视觉层级', '响应反馈', '用户控制'];
  let activeLab = 0;
  let swipeStartX = 0;
  let swipeStartY = 0;

  function syncLabHeight() {
    labViewport.style.height = `${Math.ceil(labSlides[activeLab].getBoundingClientRect().height)}px`;
  }

  function showLab(index, focus = false) {
    activeLab = Math.max(0, Math.min(labSlides.length - 1, index));
    labTrack.style.transform = `translate3d(-${activeLab * 100}%,0,0)`;
    labSlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeLab;
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.inert = !isActive;
    });
    labTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeLab;
      tab.classList.toggle('is-active', isActive);
      if (isActive) tab.setAttribute('aria-current', 'step');
      else tab.removeAttribute('aria-current');
    });
    labPrev.disabled = activeLab === 0;
    labNext.disabled = activeLab === labSlides.length - 1;
    labCurrent.textContent = String(activeLab + 1).padStart(2, '0');
    labName.textContent = labNames[activeLab];
    requestAnimationFrame(syncLabHeight);
    if (focus) labCarousel.focus({ preventScroll: true });
  }

  labPrev.addEventListener('click', () => showLab(activeLab - 1));
  labNext.addEventListener('click', () => showLab(activeLab + 1));
  labTabs.forEach(tab => tab.addEventListener('click', () => showLab(Number(tab.dataset.labTarget))));
  labCarousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showLab(activeLab - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showLab(activeLab + 1); }
  });
  labViewport.addEventListener('touchstart', event => {
    if (event.target.closest('button,input,label')) return;
    swipeStartX = event.changedTouches[0].clientX;
    swipeStartY = event.changedTouches[0].clientY;
  }, { passive: true });
  labViewport.addEventListener('touchend', event => {
    if (!swipeStartX) return;
    const deltaX = event.changedTouches[0].clientX - swipeStartX;
    const deltaY = event.changedTouches[0].clientY - swipeStartY;
    swipeStartX = 0;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY)) showLab(activeLab + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
  addEventListener('resize', syncLabHeight);
  const labResizeObserver = new ResizeObserver(() => requestAnimationFrame(syncLabHeight));
  labSlides.forEach(slide => labResizeObserver.observe(slide));
  showLab(0);

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

  const livePreview = $('#livePreview');
  const liveTitleSize = $('#liveTitleSize');
  const liveSpacing = $('#liveSpacing');
  const liveContrast = $('#liveContrast');
  const liveRadius = $('#liveRadius');
  const livePresetName = $('#livePresetName');
  const liveAdvice = $('#liveAdvice');
  const livePreviewStatus = $('#livePreviewStatus');
  const liveInputs = [liveTitleSize, liveSpacing, liveContrast, liveRadius];
  const livePresets = {
    compact: { title: 44, spacing: 20, contrast: 42, radius: 0, theme: 'paper', name: '原始拥挤' },
    balanced: { title: 68, spacing: 52, contrast: 78, radius: 18, theme: 'moss', name: '平衡清晰' },
    poster: { title: 86, spacing: 68, contrast: 94, radius: 34, theme: 'night', name: '海报强调' }
  };
  let liveTheme = 'moss';

  function setLiveTheme(theme) {
    liveTheme = theme;
    livePreview.dataset.theme = theme;
    $$('[data-live-theme]').forEach(button => button.classList.toggle('is-active', button.dataset.liveTheme === theme));
  }

  function updateLiveStyle(save = true) {
    const title = Number(liveTitleSize.value);
    const spacing = Number(liveSpacing.value);
    const contrast = Number(liveContrast.value);
    const radius = Number(liveRadius.value);
    livePreview.style.setProperty('--live-title', `${title}px`);
    livePreview.style.setProperty('--live-space', `${spacing}px`);
    livePreview.style.setProperty('--live-muted', `color-mix(in srgb,var(--live-ink) ${contrast}%,transparent)`);
    livePreview.style.setProperty('--live-radius', `${radius}px`);

    const values = { liveTitleValue: `${title} PX`, liveSpacingValue: `${spacing} PX`, liveContrastValue: `${contrast}%`, liveRadiusValue: `${radius} PX`, readoutTitle: `${title} PX`, readoutSpacing: `${spacing} PX`, readoutContrast: `${contrast}%`, readoutRadius: `${radius} PX` };
    Object.entries(values).forEach(([id, value]) => { $(`#${id}`).textContent = value; });

    if (contrast < 52) liveAdvice.textContent = '说明文字正在变得难读。好看的浅色文字，也可能让信息无法抵达。';
    else if (spacing < 30) liveAdvice.textContent = '内容开始拥挤，标题、正文和行动按钮正在争抢同一块空间。';
    else if (title > 80) liveAdvice.textContent = '标题具有很强的海报感，适合短句；正文内容较多时需要克制。';
    else liveAdvice.textContent = '层级、留白和对比度处于较平衡的状态，重点容易被看见。';

    if (save) localStorage.setItem('first-look-style', JSON.stringify({ title, spacing, contrast, radius, theme: liveTheme }));
  }

  function applyLivePreset(key, save = true) {
    const preset = livePresets[key];
    liveTitleSize.value = preset.title;
    liveSpacing.value = preset.spacing;
    liveContrast.value = preset.contrast;
    liveRadius.value = preset.radius;
    livePresetName.textContent = preset.name;
    setLiveTheme(preset.theme);
    $$('[data-style-preset]').forEach(button => button.classList.toggle('is-active', button.dataset.stylePreset === key));
    updateLiveStyle(save);
  }

  liveInputs.forEach(input => input.addEventListener('input', () => {
    livePresetName.textContent = '自定义样式';
    $$('[data-style-preset]').forEach(button => button.classList.remove('is-active'));
    updateLiveStyle(true);
  }));
  $$('[data-style-preset]').forEach(button => button.addEventListener('click', () => applyLivePreset(button.dataset.stylePreset)));
  $$('[data-live-theme]').forEach(button => button.addEventListener('click', () => {
    setLiveTheme(button.dataset.liveTheme);
    livePresetName.textContent = '自定义样式';
    $$('[data-style-preset]').forEach(item => item.classList.remove('is-active'));
    updateLiveStyle(true);
  }));
  $('#resetStyle').addEventListener('click', () => applyLivePreset('balanced'));
  $('#livePreviewAction').addEventListener('click', event => {
    event.currentTarget.textContent = '已保存';
    livePreviewStatus.textContent = '操作成功 · 可以随时取消';
    setTimeout(() => {
      event.currentTarget.textContent = '保存这条路线';
      livePreviewStatus.textContent = '约 90 分钟 · 3.2 KM';
    }, 2200);
  });

  try {
    const savedStyle = JSON.parse(localStorage.getItem('first-look-style') || 'null');
    if (savedStyle) {
      liveTitleSize.value = savedStyle.title;
      liveSpacing.value = savedStyle.spacing;
      liveContrast.value = savedStyle.contrast;
      liveRadius.value = savedStyle.radius;
      setLiveTheme(savedStyle.theme || 'moss');
      livePresetName.textContent = '上次调整';
      $$('[data-style-preset]').forEach(button => button.classList.remove('is-active'));
      updateLiveStyle(false);
    } else applyLivePreset('balanced', false);
  } catch (_) {
    localStorage.removeItem('first-look-style');
    applyLivePreset('balanced', false);
  }

  const captureTarget = new URLSearchParams(location.search).get('capture');
  if (captureTarget) {
    $$('.reveal').forEach(element => element.classList.add('is-visible'));
    setTimeout(() => document.getElementById(captureTarget)?.scrollIntoView(), 80);
  }
})();
