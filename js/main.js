(function () {
  "use strict";

  var STORAGE_KEY = "personal-homepage-theme";
  var THEME_COLORS = { dark: "#0a0b0d", light: "#f2f3ef" };
  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var themeToggle = document.getElementById("themeToggle");
  var themeColorMeta = document.getElementById("themeColorMeta");
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");
  var toTop = document.getElementById("toTop");
  var toast = document.getElementById("toast");
  var yearEl = document.getElementById("year");

  /* ---------- 主题 ---------- */
  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeColorMeta) themeColorMeta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.dark);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {}
    }
  }

  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next, true);
    });
  }

  if (window.matchMedia) {
    var schemeQuery = window.matchMedia("(prefers-color-scheme: light)");
    var handleSchemeChange = function (event) {
      var stored = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch (error) {}
      if (stored !== "light" && stored !== "dark") {
        applyTheme(event.matches ? "light" : "dark", false);
      }
    };
    if (typeof schemeQuery.addEventListener === "function") {
      schemeQuery.addEventListener("change", handleSchemeChange);
    } else if (typeof schemeQuery.addListener === "function") {
      schemeQuery.addListener(handleSchemeChange);
    }
  }

  /* ---------- 移动端菜单 ---------- */
  function closeNav() {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "打开菜单");
    nav.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "打开菜单" : "关闭菜单");
      nav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("is-locked", !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) closeNav();
    });
  }

  /* ---------- 滚动进度 / 顶栏 / 回到顶部 ---------- */
  function onScroll() {
    var scrolled = window.scrollY || document.documentElement.scrollTop;
    var total = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = total > 0 ? Math.min(scrolled / total, 1) : 0;

    if (progress) progress.style.width = (ratio * 100).toFixed(2) + "%";
    if (header) header.classList.toggle("is-scrolled", scrolled > 12);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = navLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("data-nav"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("data-nav") === entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- 滚动渐入 ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 打字效果 ---------- */
  var typewriter = document.getElementById("typewriter");
  var words = ["写网页", "玩魂系", "追新番", "做小工具"];

  if (typewriter) {
    if (prefersReduced) {
      typewriter.textContent = words[0];
    } else {
      var wordIndex = 0;
      var charIndex = words[0].length;
      var deleting = true;

      var tick = function () {
        var word = words[wordIndex];

        if (deleting) {
          charIndex -= 1;
          typewriter.textContent = word.slice(0, Math.max(charIndex, 0));
          if (charIndex <= 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            window.setTimeout(tick, 320);
            return;
          }
          window.setTimeout(tick, 55);
          return;
        }

        charIndex += 1;
        typewriter.textContent = words[wordIndex].slice(0, charIndex);
        if (charIndex >= words[wordIndex].length) {
          deleting = true;
          window.setTimeout(tick, 1600);
          return;
        }
        window.setTimeout(tick, 110);
      };

      window.setTimeout(tick, 1800);
    }
  }

  /* ---------- 卡片光标高光 ---------- */
  var glowCards = document.querySelectorAll(".glow-card");

  if (glowCards.length && window.matchMedia("(hover: hover)").matches) {
    glowCards.forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width) * 100 + "%");
        card.style.setProperty("--my", ((event.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }

  /* ---------- 提示条 ---------- */
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  /* ---------- 复制邮箱 ---------- */
  var copyEmail = document.getElementById("copyEmail");

  if (copyEmail) {
    copyEmail.addEventListener("click", function () {
      var email = copyEmail.getAttribute("data-email") || "";
      if (!email) return;

      var done = function () {
        showToast("邮箱已复制：" + email);
      };
      var failed = function () {
        showToast("复制失败，请手动选择：" + email);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          var input = document.createElement("textarea");
          input.value = email;
          input.setAttribute("readonly", "readonly");
          input.style.position = "fixed";
          input.style.opacity = "0";
          document.body.appendChild(input);
          input.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(input);
          ok ? done() : failed();
        } catch (error) {
          failed();
        }
      }
    });
  }

  /* ---------- 游戏封面加载失败兜底 ---------- */
  document.querySelectorAll(".game-card__cover img").forEach(function (img) {
    var hideBrokenImage = function () {
      img.classList.add("is-hidden");
    };

    if (img.complete && img.naturalWidth === 0) {
      hideBrokenImage();
    }

    img.addEventListener("error", hideBrokenImage, { once: true });
  });

  /* ---------- 年份 ---------- */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
