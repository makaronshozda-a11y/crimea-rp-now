"use strict";

/* ===================== ХЕШ-НАВІГАЦІЯ (#rules, #role, #player-information, #reviews) ===================== */
const TAB_HASH_MAP = {
  home: "rules",
  roles: "role",
  licenses: "player-information",
  reviews: "reviews"
};

function setHash(hash) {
  history.replaceState(null, "", "#" + hash);
}

function getHash() {
  return location.hash.replace("#", "");
}

/* ===================== ПОЯВА КАРТОК (правила / ролі) =====================
   Єдина надійна функція для плавної появи рядків одне за одним.
   Керує всім напряму через JS (opacity/transform), без CSS-анімацій
   і CSS-змінних - тому не залежить від специфічності селекторів і
   завжди спрацьовує однаково: і при першому вході, і при кожному
   перемиканні вкладок. Крива й швидкість підібрані так само, як
   у кнопок меню (плавно і досить швидко). */
function animateCardsIn(cards, startDelay = 0.15, stepDelay = 0.10, duration = 0.75) {

    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translate3d(0,40px,0) scale(.97)";
        card.style.transition = "none";
        card.style.willChange = "transform, opacity";
    });

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            cards.forEach((card,index)=>{

                const delay = startDelay + index * stepDelay;

                card.style.transition = `
                    opacity ${duration}s cubic-bezier(.22,1,.36,1) ${delay}s,
                    transform ${duration}s cubic-bezier(.22,1,.36,1) ${delay}s
                `;

                card.style.opacity="1";
                card.style.transform="translate3d(0,0,0) scale(1)";

            });

        });

    });

}

/* ===================== ПЕРЕМИКАННЯ ВКЛАДОК ===================== */
(function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

function restartCardAnimations(container) {
    if (!container) return;

    // Спочатку перезапускаємо заголовок і поле пошуку (вони йдуть першими)
    const heading = container.querySelector("h2");
    const searchInput = container.querySelector(".text-input");
    [heading, searchInput].forEach(el => {
      if (!el) return;
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    });

    // Картки перезапускаємо з новою затримкою, яка рахується від моменту
    // відкриття вкладки (а не від завантаження сторінки) - тому це працює
    // однаково і при першому вході, і при кожному наступному перемиканні.
    // Крок і швидкість підібрані так само, як у кнопок меню (швидко й плавно).
    const cards = Array.from(container.querySelectorAll(".rule-card, .role-card"));
    animateCardsIn(cards, 0.15, 0.12);
  }

  function openTab(id, updateHash) {
    buttons.forEach(b => b.classList.toggle("active", b.getAttribute("data-tab") === id));
    contents.forEach(c => c.classList.toggle("active", c.id === id));

    const target = document.getElementById(id);
    restartCardAnimations(target);

    if (updateHash !== false && TAB_HASH_MAP[id]) {
      setHash(TAB_HASH_MAP[id]);
    }
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      openTab(button.getAttribute("data-tab"));
    });
  });

  // При завантаженні сторінки перевіряємо хеш і відкриваємо потрібну вкладку
  const hash = getHash();
  if (hash.startsWith("role")) {
    openTab("roles", false);
  } else if (hash.startsWith("player-information")) {
    openTab("licenses", false);
  } else if (hash.startsWith("reviews")) {
    openTab("reviews", false);
  } else {
    openTab("home", false);
  }

  window.__openTab = openTab;
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

  const BASE_DELAY = 0.15;
  const STEP_DELAY = 0.12; // як у кнопок меню

  // Затримка перед першим стартом карток на самому початку сайту -
  // рахується так, щоб картки почали з'являтися вже ПІСЛЯ того, як
  // сам блок #home стане видимим (він фейдиться через PAGE LOAD ANIMATIONS
  // нижче в цьому файлі). Далі, при перемиканні вкладок, використовується
  // звичайна коротка BASE_DELAY (див. restartCardAnimations).
  const INITIAL_REVEAL_DELAY = 1.9;
  const INITIAL_STEP_DELAY = 0.12; // як у кнопок меню
  let isFirstRender = true;

  function renderRuleCards() {
    rulesGrid.innerHTML = "";

    const wasFirstRender = isFirstRender;
    const startDelay = wasFirstRender ? INITIAL_REVEAL_DELAY : BASE_DELAY;
    const stepDelay = wasFirstRender ? INITIAL_STEP_DELAY : STEP_DELAY;

    const cards = [];
    rulesData.forEach((rule) => {
      const card = document.createElement("div");
      card.className = "rule-card";
      card.dataset.number = rule.number;
      card.innerHTML = `<span class="rule-num">${rule.number}</span> ${rule.title}`;
      card.addEventListener("click", () => openRuleModal(rule, null));
      rulesGrid.appendChild(card);
      cards.push(card);
    });

    animateCardsIn(cards, startDelay, stepDelay);
    isFirstRender = false;
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
    setHash("rules" + rule.number);

    if (searchQuery) {
      setTimeout(() => {
        modalBody.querySelectorAll(".highlight").forEach(el => el.classList.add("fade-out"));
      }, 6000);
    }
  }

  function closeRuleModal() {
    modalOverlay.classList.remove("active");
    setHash("rules");
  }

  modalClose.addEventListener("click", closeRuleModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeRuleModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) closeRuleModal();
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

  // Якщо в адресі одразу вказано конкретний пункт (#rules1, #rules5 тощо) -
  // відкриваємо потрібне модальне вікно автоматично
  const hash = getHash();
  if (hash.startsWith("rules") && hash.length > "rules".length) {
    const number = hash.replace("rules", "");
    const rule = rulesData.find(r => String(r.number) === number);
    if (rule) {
      setTimeout(() => openRuleModal(rule, null), 300);
    }
  }
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

  // Так само, як у правилах: при першому рендері (ще до кліку на вкладку)
  // картки ролей з'являються повільніше і з помітнішим кроком, ніж при
  // подальших перемиканнях вкладок.
  const ROLES_INITIAL_REVEAL_DELAY = 2.15;
  const ROLES_INITIAL_STEP_DELAY = 0.12; // як у кнопок меню
  const ROLES_BASE_DELAY = 0.15;
  const ROLES_STEP_DELAY = 0.12; // як у кнопок меню
  let rolesIsFirstRender = true;

  function renderRoleCards() {
    rolesGrid.innerHTML = "";

    const wasFirstRender = rolesIsFirstRender;
    const startDelay = wasFirstRender ? ROLES_INITIAL_REVEAL_DELAY : ROLES_BASE_DELAY;
    const stepDelay = wasFirstRender ? ROLES_INITIAL_STEP_DELAY : ROLES_STEP_DELAY;

    const cards = [];
    Object.keys(staffData).forEach((key) => {
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
      cards.push(card);
    });

    animateCardsIn(cards, startDelay, stepDelay);
    rolesIsFirstRender = false;
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
          <span class="license-result-status">✅ Ліцензія дійсна</span>
          <div class="license-result-row"><span>Нік гравця</span><span>${found.nick}</span></div>
          <div class="license-result-row"><span>Тип ліцензії</span><span>${licenseTypeNames[found.type]}</span></div>
          <div class="license-result-row"><span>Термін дії</span><span>${found.validFrom} — ${found.validTo}</span></div>
          <div class="license-result-row"><span>Номер ліцензії</span><span>${found.number}</span></div>
        </div>
      `;
    } else {
      result.innerHTML = `
        <div class="license-result-card invalid">
          <span class="license-result-status invalid">❌ Ліцензію не знайдено</span>
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

/* ===================== ВІДГУКИ ===================== */
(function initReviews() {
  const reviewCard = document.getElementById("reviewCard");
  const prevBtn = document.getElementById("reviewPrev");
  const nextBtn = document.getElementById("reviewNext");

  if (!reviewCard || !prevBtn || !nextBtn) return;
  if (typeof reviewsData === "undefined" || reviewsData.length === 0) return;

  let currentIndex = 0;

  function renderReview(index) {
    const review = reviewsData[index];
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    reviewCard.style.animation = "none";
    void reviewCard.offsetWidth;

reviewCard.innerHTML = `
<div class="review-content">

    <div class="review-header">

        <div class="review-left">

            <img src="${review.avatar}" class="review-avatar" alt="" loading="lazy">

            <div class="review-meta">
                <div class="review-nick">${review.nick}</div>
            </div>

        </div>

        <div class="review-right">
            <div class="review-stars">${stars}</div>
            <div class="review-date">${review.date}</div>
        </div>

    </div>

    <div class="review-text">
        ${review.text}
    </div>

</div>
`;

    reviewCard.style.animation = "";
  }

  function goNext() {
    currentIndex = (currentIndex + 1) % reviewsData.length;
    renderReview(currentIndex);
  }

  function goPrev() {
    currentIndex = (currentIndex - 1 + reviewsData.length) % reviewsData.length;
    renderReview(currentIndex);
  }

  let autoTimer = setInterval(goNext, 10000);

  function resetAutoTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(goNext, 10000);
  }

  prevBtn.addEventListener("click", () => { goPrev(); resetAutoTimer(); });
  nextBtn.addEventListener("click", () => { goNext(); resetAutoTimer(); });

  renderReview(currentIndex);
})();
/* ===================== PARALLAX ===================== */

(()=>{
const bg=document.querySelector(".bg");
if(!bg)return;

window.addEventListener("mousemove",e=>{
const x=(e.clientX/window.innerWidth-.5)*8;
const y=(e.clientY/window.innerHeight-.5)*8;
bg.style.transform=`translate(${x}px,${y}px) scale(1.05)`;
},{passive:true});
})();
/* ===================== PAGE LOAD ANIMATIONS ===================== */

(() => {
const sequence=[
".hero-text",
".join-box",
".menu-tabs",
"#home",
"#roles",
"#licenses",
"#reviews"      
];

sequence.forEach(selector=>{
const el=document.querySelector(selector);
if(!el)return;
el.dataset.animate="true";
el.style.opacity="0";
el.style.transform="translateY(35px)";
});

window.addEventListener("load",()=>{

requestAnimationFrame(()=>{

sequence.forEach((selector,index)=>{

const el=document.querySelector(selector);
if(!el)return;

setTimeout(()=>{

el.style.transition="opacity 1s cubic-bezier(.22,1,.36,1),transform 1s cubic-bezier(.22,1,.36,1)";
el.style.opacity="1";
el.style.transform="translateY(0)";

},550+index*260);

});

});

});

})();
/* ===================== SCROLL ANIMATIONS ===================== */

(()=>{
const observer=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(!entry.isIntersecting)return;

entry.target.classList.add("show");

observer.unobserve(entry.target);

});
},{
threshold:.12,
rootMargin:"0px 0px -60px 0px"
});

document.querySelectorAll(
".review-card,.join-box,.license-result-card,.reviews-header,.rules-grid,.roles-grid"
)

el.classList.add("animate-item");

observer.observe(el);

});
