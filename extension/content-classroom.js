// Content script for Google Classroom
// Detects assignments on classroom.google.com and offers to import them into Shiori

(function () {
  if (document.getElementById('shiori-import-btn')) return

  const btn = document.createElement('button')
  btn.id = 'shiori-import-btn'
  btn.textContent = '栞 Import to Shiori'
  btn.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #afc6ff, #528dff);
    color: #10141a; font-weight: 700; font-size: 13px;
    box-shadow: 0 4px 20px rgba(82,141,255,0.35);
    font-family: 'Google Sans', sans-serif;
    transition: transform 0.15s, box-shadow 0.15s;
  `
  btn.onmouseenter = () => { btn.style.transform = 'scale(1.04)'; btn.style.boxShadow = '0 6px 24px rgba(82,141,255,0.5)' }
  btn.onmouseleave = () => { btn.style.transform = ''; btn.style.boxShadow = '0 4px 20px rgba(82,141,255,0.35)' }

  btn.addEventListener('click', () => {
    // Scrape assignment titles and due dates from the DOM
    const items = []

    // Classroom to-do items
    document.querySelectorAll('[data-assignment-id], .h3X2ie, .K3Qzod').forEach(el => {
      const titleEl = el.querySelector('.YVvGBb, .Ik5nvb, h3, [role="heading"]')
      const dueEl = el.querySelector('.t0t5Mc, .IHlPkb, .xAcfXc')
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          due: dueEl?.textContent?.trim() || null,
          source: 'google-classroom',
        })
      }
    })

    // Generic fallback: grab any heading-like elements in main content
    if (!items.length) {
      document.querySelectorAll('h3, .YVvGBb, .Ik5nvb').forEach(el => {
        const text = el.textContent.trim()
        if (text.length > 3 && text.length < 120) {
          items.push({ title: text, due: null, source: 'google-classroom' })
        }
      })
    }

    if (!items.length) {
      showBanner('No assignments found on this page. Navigate to your Classwork tab.', false)
      return
    }

    chrome.runtime.sendMessage({ type: 'IMPORT_ASSIGNMENTS', assignments: items }, (response) => {
      if (response?.success) {
        showBanner(`✓ Imported ${response.count} assignment${response.count !== 1 ? 's' : ''} to Shiori!`, true)
      } else {
        showBanner('Failed to import. Try opening the Shiori extension first.', false)
      }
    })
  })

  document.body.appendChild(btn)

  function showBanner(text, success) {
    const banner = document.createElement('div')
    banner.style.cssText = `
      position: fixed; bottom: 80px; right: 24px; z-index: 99999;
      padding: 10px 16px; border-radius: 8px;
      background: ${success ? 'rgba(77,255,145,0.15)' : 'rgba(255,107,157,0.15)'};
      border: 1px solid ${success ? 'rgba(77,255,145,0.4)' : 'rgba(255,107,157,0.4)'};
      color: ${success ? '#4dff91' : '#ff6b9d'};
      font-family: 'Google Sans', sans-serif; font-size: 13px; font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    `
    banner.textContent = text
    document.body.appendChild(banner)
    setTimeout(() => banner.remove(), 4000)
  }
})()
