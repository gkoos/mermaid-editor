import mermaid from 'mermaid';

document.addEventListener('DOMContentLoaded', () => {
  // ...existing code...
  // Set cursor to magnifying glass (zoom-in) on hover over preview
  if (preview) {
    preview.addEventListener('mouseenter', () => {
      preview.style.cursor = 'zoom-in';
    });
    preview.addEventListener('mouseleave', () => {
      preview.style.cursor = '';
    });
  }
  const zoomRatio = document.getElementById('zoom-ratio');
  // Set cursor to pointer on hover and reset zoom on click
  if (zoomRatio) {
    zoomRatio.style.cursor = 'pointer';
    zoomRatio.addEventListener('mouseenter', () => {
      zoomRatio.style.cursor = 'pointer';
    });
    zoomRatio.addEventListener('mouseleave', () => {
      zoomRatio.style.cursor = '';
    });
    zoomRatio.addEventListener('click', () => {
      scale = 1;
      panX = 0;
      panY = 0;
      applyTransform();
    });
  }
  let svgRefWidth = 0;
  let svgRefHeight = 0;

  function updateZoomRatio() {
    const svgEl = preview.querySelector('svg');
    let percent = 100;
    if (svgEl && svgEl.viewBox?.baseVal?.width) {
      const renderedWidth = svgEl.getBoundingClientRect().width;
      const intrinsicWidth = svgEl.viewBox.baseVal.width;
      percent = Math.round((renderedWidth / intrinsicWidth) * 100);
    }
    if (zoomRatio) {
      zoomRatio.textContent = `Zoom: ${percent}%`;
    }
  }
  // Zoom and pan state
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStart = {x: 0, y: 0};

  // Helper to apply transform to preview
  function applyTransform() {
    const svgWrap = preview.querySelector('.svg-wrap');
    if (svgWrap) {
      svgWrap.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
      svgWrap.style.transformOrigin = 'center center';
  updateZoomRatio();
    }
  }
  const errorMessage = document.getElementById('error-message');
  const editor = document.getElementById('editor');
  const lineNumbers = document.getElementById('line-numbers');

  if (!editor) {
    console.error('Textarea with id="editor" not found!');
    return;
  }

  editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab' || e.code === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '\t' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 1;
      renderMermaid(editor.value);
      updateLineNumbers();
    }
  });

  function updateLineNumbers() {
  const lines = editor.value.replace(/\r/g, '').split('\n');
  const count = Math.max(lines.length, 1);
  lineNumbers.innerHTML = Array.from({length: count}, (_, i) => `<div>${i+1}</div>`).join('');
  }

  function renderMermaid(code = '') {
    let errorMsg = '';
    try {
      mermaid.parse(code);
    } catch (err) {
      errorMsg = err?.str || err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
      preview.innerHTML = '';
    }
    if (!errorMsg) {
  preview.innerHTML = `<div class="svg-wrap"><div class="mermaid">${code}</div></div>`;
  preview.style.display = 'inline-block';
  preview.style.width = '';
  preview.style.height = '';
  preview.style.overflow = 'visible';
  preview.style.padding = '';
  preview.style.boxSizing = 'border-box';
      try {
        const result = mermaid.init(undefined, preview.querySelector('.mermaid'));
        if (result && typeof result.then === 'function') {
          result.catch(err => {
            errorMsg = err?.str || err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
            errorMessage.textContent = errorMsg || '';
            preview.innerHTML = '';
          });
        }
      } catch (err) {
        errorMsg = err?.str || err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
        preview.innerHTML = '';
      }
      scale = 1;
      panX = 0;
      panY = 0;
      requestAnimationFrame(() => {
      const svgWrap = preview.querySelector('.svg-wrap');
      const svgEl = preview.querySelector('svg');
      if (svgEl) {
        // Remove all scaling attributes/styles Mermaid injects
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.removeAttribute('style');
        const viewBox = svgEl.viewBox?.baseVal;
        if (viewBox) {
          svgRefWidth = viewBox.width;
          svgRefHeight = viewBox.height;
        }
      }
      if (svgWrap) {
        svgWrap.style.width = '100%';
        svgWrap.style.height = '100%';
        svgWrap.style.maxWidth = '';
        svgWrap.style.maxHeight = '';
        svgWrap.style.display = '';
        svgWrap.style.overflow = '';
        if (svgEl) {
          svgEl.setAttribute('width', '100%');
          svgEl.setAttribute('height', '100%');
          svgEl.style.width = '100%';
          svgEl.style.height = '100%';
        }
  preview.style.width = '100%';
  preview.style.height = '100%';
  preview.style.maxWidth = '';
  preview.style.maxHeight = '';
  preview.style.display = '';
  preview.style.overflow = 'hidden';
      }
      applyTransform();
      updateZoomRatio();
    });
    }
    errorMessage.textContent = errorMsg || '';
  // Mouse wheel for zoom
  preview.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = preview.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const prevScale = scale;
  const delta = Math.sign(e.deltaY);
  scale *= delta > 0 ? 0.9 : 1.1;
  scale = Math.max(0.2, Math.min(scale, 5));
  // Adjust pan so zoom is centered on mouse
  panX = mouseX - ((mouseX - panX) * (scale / prevScale));
  panY = mouseY - ((mouseY - panY) * (scale / prevScale));
  applyTransform();
  });

  // Mouse drag for pan
  preview.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStart = {x: e.clientX - panX, y: e.clientY - panY};
    preview.style.cursor = 'grab';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - dragStart.x;
    panY = e.clientY - dragStart.y;
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
  isDragging = false;
  preview.style.cursor = 'zoom-in';
  });

  // Touch support for pan
  preview.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    dragStart = {x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY};
    preview.style.cursor = 'grab';
  });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - dragStart.x;
    panY = e.touches[0].clientY - dragStart.y;
    applyTransform();
  });
  window.addEventListener('touchend', () => {
  isDragging = false;
  preview.style.cursor = 'zoom-in';
  });
  }

  // Initial render
  renderMermaid(editor.value);
  updateLineNumbers();

  // Live preview
  editor.addEventListener('input', () => {
    renderMermaid(editor.value);
    updateLineNumbers();
  });

  // Export SVG
  document.getElementById('exportSVG').addEventListener('click', () => {
  const svgEl = preview.querySelector('svg');
  if (!svgEl) return;
  // Remove whitespace around SVG
  const svgClone = svgEl.cloneNode(true);
  svgClone.removeAttribute('width');
  svgClone.removeAttribute('height');
  svgClone.setAttribute('width', svgEl.viewBox.baseVal.width);
  svgClone.setAttribute('height', svgEl.viewBox.baseVal.height);
  const blob = new Blob([new XMLSerializer().serializeToString(svgClone)], {type: 'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diagram.svg';
  a.click();
  URL.revokeObjectURL(url);
  });

  // Export PNG
  document.getElementById('exportPNG').addEventListener('click', () => {
    const svgEl = preview.querySelector('svg');
    if (!svgEl) return;
    // Use viewBox for tight cropping
    const viewBox = svgEl.viewBox.baseVal;
    const svgClone = svgEl.cloneNode(true);
    svgClone.removeAttribute('width');
    svgClone.removeAttribute('height');
    svgClone.setAttribute('width', viewBox.width);
    svgClone.setAttribute('height', viewBox.height);
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);

    img.onload = () => {
      canvas.width = viewBox.width;
      canvas.height = viewBox.height;
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'diagram.png';
      a.click();
    };
    img.src = svgUrl;
  });

  // Add MutationObserver to update zoom ratio whenever SVG changes
  const previewObserver = new MutationObserver(() => {
    updateZoomRatio();
  });
  previewObserver.observe(preview, { childList: true, subtree: true });
});
