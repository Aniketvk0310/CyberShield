/* Core UI interactions for CyberShield */
(() => {
  initLoadingScreen();

  document.addEventListener("DOMContentLoaded", () => {
    initAOS();
    initTypingEffect();
    initCounters();
    initPasswordStrength();
    initPhishingDetector();
    initBackToTop();
  });

  function initLoadingScreen() {
    const screen = document.getElementById("loading-screen");
    if (!screen) {
      document.body.classList.add("loaded");
      return;
    }
    window.addEventListener("load", () => {
      screen.classList.add("hide");
      document.body.classList.add("loaded");
    });
  }

  function initAOS() {
    if (window.AOS) {
      window.AOS.init({ duration: 800, once: true, offset: 100 });
    }
  }

  function initTypingEffect() {
    const target = document.getElementById("typing-text");
    if (!target) return;

    const phrases = (target.dataset.phrases || "").split("|").filter(Boolean);
    if (!phrases.length) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex += 1;
        target.textContent = current.substring(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex -= 1;
        target.textContent = current.substring(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 40 : 80);
    };

    tick();
  }

  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const animate = (el) => {
      const target = Number(el.dataset.target || 0);
      const suffix = el.dataset.suffix || "";
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const update = () => {
        current = Math.min(target, current + step);
        el.textContent = current.toLocaleString() + suffix;
        if (current < target) requestAnimationFrame(update);
      };
      update();
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initPasswordStrength() {
    const input = document.getElementById("password-input");
    const bar = document.getElementById("password-meter");
    const label = document.getElementById("password-strength-text");
    if (!input || !bar || !label) return;

    input.addEventListener("input", () => {
      const value = input.value;
      const checks = [
        value.length >= 8,
        /[A-Z]/.test(value),
        /[a-z]/.test(value),
        /\d/.test(value),
        /[^A-Za-z0-9]/.test(value),
      ];
      const score = checks.filter(Boolean).length;
      const percent = (score / checks.length) * 100;
      bar.style.width = `${percent}%`;

      const labels = ["Too weak", "Weak", "Moderate", "Strong", "Very strong"];
      label.textContent = labels[Math.max(0, score - 1)] || "Too weak";
      label.style.color = percent > 80 ? "#4cff8a" : percent > 60 ? "#27e0ff" : "#ff4d6d";
    });
  }

  function initPhishingDetector() {
    const input = document.getElementById("phish-input");
    const button = document.getElementById("phish-check-btn");
    const output = document.getElementById("phish-result");
    if (!input || !button || !output) return;

    button.addEventListener("click", () => {
      const text = input.value.toLowerCase();
      const signals = ["urgent", "verify", "password", "click", "limited", "suspended", "gift", "wire", "login"];
      let score = 0;
      signals.forEach((word) => {
        if (text.includes(word)) score += 1;
      });

      if (score >= 5) {
        output.textContent = "High risk: this message looks like phishing.";
        output.className = "text-danger";
      } else if (score >= 3) {
        output.textContent = "Medium risk: verify the sender and links.";
        output.className = "text-warning";
      } else {
        output.textContent = "Low risk: still inspect links before clicking.";
        output.className = "text-success";
      }
    });
  }

  function initBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    });

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
