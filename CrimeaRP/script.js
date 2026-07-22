"use strict";

/* ===================== ПЕРЕМИКАННЯ ВКЛАДОК ===================== */
(function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-tab");
      buttons.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      button.classList.add("active");
      const target = document.getElementById(targetId);
      if (target) target.classList.add("active");
    });
  });
})();

/* ===================== КОПІЮВАННЯ КОДУ СЕРВЕРА ===================== */
(function initCopyButton() {
  const copyBtn = document.getElementById("copyBtn");
  const serverCode = document.getElementById("serverCode");
  if (!copyBtn || !serverCode) return;

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(serverCode.textContent).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "Скопійовано!";
      setTimeout(() => { copyBtn.textContent = original; }, 1500);
    }).catch(() => {
      copyBtn.textContent = "Помилка";
      setTimeout(() => { copyBtn.textContent = "Копіювати"; }, 1500);
    });
  });
})();

/* ===================== ДОПОМІЖНА ФУНКЦІЯ ПІДСВІЧУВАННЯ ===================== */
function highlightText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/* ===================== ПРАВИЛА ===================== */
(function initRules() {
  const rulesGrid = document.getElementById("rulesGrid");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const ruleSearch = document.getElementById("ruleSearch");
  const ruleSearchResults = document.getElementById("ruleSearchResults");

  if (!rulesGrid || typeof rulesData === "undefined") return;

  function renderRuleCards() {
    rulesGrid.innerHTML = "";
    rulesData.forEach(rule => {
      const card = document.createElement("div");
      card.className = "rule-card";
      card.innerHTML = `<span class="rule-num">${rule.number}</span> ${rule.title}`;
      card.addEventListener("click", () => openRuleModal(rule, null));
      rulesGrid.appendChild(card);
    });
  }

  function openRuleModal(rule, searchQuery) {
    modalTitle.textContent = `Пункт ${rule.number}. ${rule.title}`;

    modalBody.innerHTML = rule.articles.map(article => {
      const title = highlightText(article.title, searchQuery);
      const paragraphs = article.text.split("\n\n").map(p =>
        `<p class="article-paragraph">${highlightText(p, searchQuery)}</p>`
      ).join("");
      const punishment = highlightText(article.punishment, searchQuery);
      const image = article.image
        ? `<img src="${article.image}" class="article-image" alt="">`
        : "";

      return `
        <div class="article-title">${title}</div>
        <div class="article-text">${paragraphs}</div>
        ${image}
        <div class="article-punishment">Покарання: ${punishment}</div>
      `;
    }).join("");

    modalOverlay.classList.add("active");

    if (searchQuery) {
      setTimeout(() => {
        modalBody.querySelectorAll(".highlight").forEach(el => el.classList.add("fade-out"));
      }, 6000);
    }
  }

  modalClose.addEventListener("click", () => modalOverlay.classList.remove("active"));
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("active");
  });

  ruleSearch.addEventListener("input", () => {
    const query = ruleSearch.value.trim().toLowerCase();
    ruleSearchResults.innerHTML = "";
    if (query.length < 2) return;

    let found = 0;
    rulesData.forEach(rule => {
      const match = rule.articles.some(a =>
        a.title.toLowerCase().includes(query) ||
        a.text.toLowerCase().includes(query) ||
        a.punishment.toLowerCase().includes(query)
      );
      if (match) {
        found++;
        const item = document.createElement("div");
        item.className = "search-result-item";
        item.textContent = `Пункт ${rule.number}. ${rule.title}`;
        item.addEventListener("click", () => openRuleModal(rule, query));
        ruleSearchResults.appendChild(item);
      }
    });

    if (found === 0) {
      const noResult = document.createElement("div");
      noResult.className = "search-result-item no-results";
      noResult.textContent = "Нічого не знайдено. Спробуйте інше слово.";
      ruleSearchResults.appendChild(noResult);
    }
  });

  renderRuleCards();
})();

/* ===================== РОЛІ ===================== */
(function initRoles() {
  const rolesGrid = document.getElementById("rolesGrid");
  const staffModalOverlay = document.getElementById("staffModalOverlay");
  const staffModalTitle = document.getElementById("staffModalTitle");
  const staffModalBody = document.getElementById("staffModalBody");
  const staffModalClose = document.getElementById("staffModalClose");
  const staffSearch = document.getElementById("staffSearch");
  const staffSearchResults = document.getElementById("staffSearchResults");

  if (!rolesGrid || typeof staffData === "undefined") return;

  function renderStaffMember(member) {
    const avatar = member.avatar || "https://via.placeholder.com/68";
    return `
      <div class="staff-member">
        <img src="${avatar}" alt="" loading="lazy">
        <div class="staff-member-text">
          <b>${member.name}</b>
          <span>Username: ${member.nick}</span><br>
          <a href="${member.telegram}" target="_blank" rel="noopener">Telegram</a>
        </div>
      </div>
    `;
  }

  function openStaffModal(categoryKey) {
    const category = staffData[categoryKey];
    staffModalTitle.textContent = category.title;

    staffModalBody.innerHTML = category.members.length === 0
      ? `<p class="placeholder-text">Тут поки що немає доданих співробітників.</p>`
      : category.members.map(renderStaffMember).join("");

    staffModalOverlay.classList.add("active");
  }

  function renderRoleCards() {
    rolesGrid.innerHTML = "";
    Object.keys(staffData).forEach(key => {
      const category = staffData[key];
      const card = document.createElement("div");
      card.className = "role-card";
      card.innerHTML = `
        <div class="role-card-text">
          <h3>${category.title}</h3>
          <p>${category.members.length} співробітник(ів)</p>
        </div>
      `;
      card.addEventListener("click", () => openStaffModal(key));
      rolesGrid.appendChild(card);
    });
  }

  staffModalClose.addEventListener("click", () => staffModalOverlay.classList.remove("active"));
  staffModalOverlay.addEventListener("click", (e) => {
    if (e.target === staffModalOverlay) staffModalOverlay.classList.remove("active");
  });

  staffSearch.addEventListener("input", () => {
    const query = staffSearch.value.trim().toLowerCase();
    staffSearchResults.innerHTML = "";
    if (query.length < 2) return;

    let found = 0;
    Object.keys(staffData).forEach(key => {
      staffData[key].members.forEach(member => {
        const nickMatch = member.nick.toLowerCase().startsWith(query);
        const tgMatch = member.telegram.toLowerCase().includes(query);
        if (nickMatch || tgMatch) {
          found++;
          const item = document.createElement("div");
          item.className = "search-result-item";
          item.textContent = `${member.name} — ${member.nick} (${staffData[key].title})`;
          item.addEventListener("click", () => openStaffModal(key));
          staffSearchResults.appendChild(item);
        }
      });
    });

    if (found === 0) {
      const noResult = document.createElement("div");
      noResult.className = "search-result-item no-results";
      noResult.textContent = "Такого гравця не знайдено. Перевірте правильність ніку.";
      staffSearchResults.appendChild(noResult);
    }
  });

  renderRoleCards();
})();

/* ===================== ЛІЦЕНЗІЇ ===================== */
(function initLicenses() {
  const typeSelect = document.getElementById("licenseTypeSelect");
  const nickInput = document.getElementById("licenseNickInput");
  const searchBtn = document.getElementById("licenseSearchBtn");
  const result = document.getElementById("licenseResult");

  if (!typeSelect || typeof licensesData === "undefined") return;

  function checkDuplicates() {
    const seen = {};
    licensesData.forEach(lic => {
      if (seen[lic.number]) {
        console.warn(`⚠️ Номер ліцензії "${lic.number}" використано двічі! Перевір licenses-data.js`);
      }
      seen[lic.number] = true;
    });
  }

  function checkLicense() {
    const type = typeSelect.value;
    const query = nickInput.value.trim().toLowerCase();

    if (!type || !query) {
      result.innerHTML = `<p class="placeholder-text">Оберіть категорію і введіть username або номер ліцензії.</p>`;
      return;
    }

    const found = licensesData.find(lic =>
      lic.type === type &&
      (lic.nick.toLowerCase() === query || String(lic.number) === query)
    );

    if (found) {
      result.innerHTML = `
        <div class="license-result-card">
          <span class="license-result-status"> Ліцензія дійсна</span>
          <div class="license-result-row"><span>Нік гравця</span><span>${found.nick}</span></div>
          <div class="license-result-row"><span>Тип ліцензії</span><span>${licenseTypeNames[found.type]}</span></div>
          <div class="license-result-row"><span>Термін дії</span><span>${found.validFrom} — ${found.validTo}</span></div>
          <div class="license-result-row"><span>Номер ліцензії</span><span>${found.number}</span></div>
        </div>
      `;
    } else {
      result.innerHTML = `
        <div class="license-result-card invalid">
          <span class="license-result-status invalid"> Ліцензію не знайдено</span>
          <div class="license-result-row"><span>Запит</span><span>${query}</span></div>
          <div class="license-result-row"><span>Категорія</span><span>${licenseTypeNames[type]}</span></div>
        </div>
      `;
    }
  }

  searchBtn.addEventListener("click", checkLicense);
  nickInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLicense();
  });

  checkDuplicates();
})();

/* ===================== LIGHTBOX ДЛЯ КАРТИНОК ===================== */
(function initLightbox() {
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  if (!lightbox || !lightboxImg) return;

  let zoom = 1;

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("article-image")) {
      zoom = 1;
      lightboxImg.style.transform = "scale(1)";
      lightboxImg.src = e.target.src;
      lightbox.classList.add("active");
    }
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.remove("active");
  });

  lightbox.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoom += e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.min(Math.max(zoom, 1), 3);
    lightboxImg.style.transform = `scale(${zoom})`;
  }, { passive: false });
})();

/* ===================== КИЇВСЬКИЙ ЧАС ===================== */
(function initClock() {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return;

  function updateClock() {
    const now = new Date().toLocaleTimeString("uk-UA", {
      timeZone: "Europe/Kyiv",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    clockEl.textContent = `Київський час: ${now}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
})();