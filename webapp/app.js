// Telegram Mini App bridge — safe no-op if opened outside Telegram
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const PROJECTS = [
  {
    title: "Telegram-бот с оплатой подписки",
    desc: "Нужен бот на aiogram с приёмом платежей и разграничением тарифов.",
    budget: "$450",
    tags: ["python", "telegram", "aiogram"],
    minutesAgo: 2,
  },
  {
    title: "Дашборд аналитики на React",
    desc: "Графики по продажам, фильтры по датам, экспорт в CSV.",
    budget: "$800",
    tags: ["react", "recharts"],
    minutesAgo: 6,
  },
  {
    title: "Поправить баги в Flutter-приложении",
    desc: "Приложение почти готово, но крашится на Android 13.",
    budget: "$220",
    tags: ["flutter", "android"],
    minutesAgo: 14,
  },
  {
    title: "Дизайн лендинга для SaaS-стартапа",
    desc: "Нужен современный, не шаблонный лендинг с адаптивом.",
    budget: "$300",
    tags: ["design", "figma"],
    minutesAgo: 21,
  },
  {
    title: "Скрипт для автоматизации отчётов",
    desc: "Раз в неделю собирать данные и слать сводку в Slack.",
    budget: "$180",
    tags: ["python", "automation"],
    minutesAgo: 33,
  },
];

const feedEl = document.getElementById("feed");
const chipsEl = document.getElementById("chips");
const lastScanEl = document.getElementById("lastScan");
const upgradeBtn = document.getElementById("upgradeBtn");

function freshnessLabel(minutesAgo) {
  const urgent = minutesAgo <= 5;
  const label = minutesAgo < 1 ? "только что" : `${minutesAgo} мин назад`;
  return { label, urgent };
}

function renderFeed(filter = "all") {
  feedEl.innerHTML = "";
  const items = PROJECTS.filter(
    (p) => filter === "all" || p.tags.includes(filter)
  );

  items.forEach((p, i) => {
    const { label, urgent } = freshnessLabel(p.minutesAgo);
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${i * 40}ms`;
    card.innerHTML = `
      <div class="card__top">
        <div class="card__title">${p.title}</div>
        <div class="card__budget mono">${p.budget}</div>
      </div>
      <p class="card__desc">${p.desc}</p>
      <div class="card__tags">
        ${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="card__bottom">
        <span class="card__fresh ${urgent ? "card__fresh--urgent" : ""}">
          ${urgent ? "● срочно · " : "● "}${label}
        </span>
        <button class="card__cta" data-title="${p.title}">Откликнуться</button>
      </div>
    `;
    feedEl.appendChild(card);
  });

  if (items.length === 0) {
    feedEl.innerHTML = `<p style="color:var(--muted);text-align:center;padding:24px 0;">
      Пока пусто по этому фильтру — сигнал придёт, как только появится проект.
    </p>`;
  }
}

chipsEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chipsEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--active"));
  chip.classList.add("chip--active");
  renderFeed(chip.dataset.filter);
});

feedEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".card__cta");
  if (!btn) return;
  const payload = JSON.stringify({ action: "draft_request", title: btn.dataset.title });
  if (tg) {
    tg.sendData?.(payload);
    tg.showPopup?.({
      title: "AI-черновик",
      message: `Отправил запрос — черновик придёт в чат с ботом.`,
    });
  } else {
    alert("Открой это внутри Telegram, чтобы получить черновик от бота.");
  }
});

upgradeBtn.addEventListener("click", () => {
  if (tg) {
    tg.sendData?.(JSON.stringify({ action: "upgrade_clicked" }));
  } else {
    alert("Открыть оплату подписки (Telegram Stars) →");
  }
});

// Ticking "last scan" timestamp — reinforces that this is live, not static
let secondsSinceScan = 0;
setInterval(() => {
  secondsSinceScan += 1;
  lastScanEl.textContent =
    secondsSinceScan < 60 ? `${secondsSinceScan} сек назад` : "только что обновлено";
  if (secondsSinceScan > 60) secondsSinceScan = 0;
}, 1000);

renderFeed();
