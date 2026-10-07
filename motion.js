(function () {
  const gsap = window.gsap;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const chartStates = new Map();
  let context;
  let sceneTimeline;
  let sceneVersion = 0;
  let navigating = false;
  let recordingTween;
  const routeKey = "tongdun-route";

  function enabled() {
    return Boolean(gsap) && !preference.matches;
  }

  function icons() {
    window.lucide?.createIcons({ attrs: { "aria-hidden": "true" } });
  }

  function animate(callback) {
    if (context) context.add(callback);
    else callback();
  }

  function navigate(href) {
    if (navigating) return;
    window.dispatchEvent(new Event("training:navigate"));
    if (!enabled()) {
      window.location.assign(href);
      return;
    }
    navigating = true;
    const curtain = document.querySelector(".route-curtain");
    try { sessionStorage.setItem(routeKey, "1"); } catch {}
    animate(() => {
      gsap.killTweensOf(curtain);
      gsap.timeline({ onComplete: () => window.location.assign(href) })
        .fromTo(curtain, { xPercent: 101 }, { xPercent: 0, duration: .48, ease: "power3.inOut" })
        .to("main", { y: -12, opacity: .65, duration: .35 }, 0);
    });
  }

  function cancelScene() {
    sceneVersion += 1;
    sceneTimeline?.kill();
    if (gsap) gsap.set(["#scenarioStage", "#coachLine"], { clearProps: "transform,opacity,visibility" });
    document.getElementById("scenarioStage")?.removeAttribute("aria-busy");
    const stage = document.getElementById("scenarioStage");
    if (stage) stage.inert = false;
  }

  function switchScene(index, imagePath, commit) {
    cancelScene();
    const version = sceneVersion;
    const stage = document.getElementById("scenarioStage");
    const hint = document.getElementById("coachLine");
    if (!enabled()) {
      commit(index);
      return;
    }
    stage.setAttribute("aria-busy", "true");
    stage.inert = true;
    const image = new Image();
    let finished = false;
    const start = () => {
      if (finished || version !== sceneVersion) return;
      finished = true;
      clearTimeout(timeout);
      animate(() => {
        sceneTimeline = gsap.timeline();
        sceneTimeline.to([stage, hint], {
          x: -24, opacity: 0, duration: .22, ease: "power2.in",
          onComplete: () => {
            if (version !== sceneVersion) return;
            commit(index);
            gsap.set([stage, hint], { x: 28 });
          }
        }).to([stage, hint], {
          x: 0, opacity: 1, duration: .7, ease: "power3.out",
          onComplete: () => {
            stage.removeAttribute("aria-busy");
            stage.inert = false;
            gsap.set([stage, hint], { clearProps: "transform,opacity" });
          }
        });
      });
    };
    const timeout = setTimeout(start, 1500);
    image.onload = start;
    image.onerror = start;
    image.src = imagePath;
    if (image.complete) start();
  }

  function radar(canvas, values, paint) {
    let state = chartStates.get(canvas);
    if (!state) {
      state = { values: [...values], target: [...values], paint, tween: null };
      chartStates.set(canvas, state);
      paint(values);
      return;
    }
    state.tween?.kill();
    state.target = [...values];
    state.paint = paint;
    if (!enabled()) {
      state.values = [...values];
      paint(values);
      return;
    }
    const start = [...state.values];
    const frame = { progress: 0 };
    animate(() => {
      state.tween = gsap.to(frame, {
        progress: 1, duration: .85, ease: "power2.out",
        onUpdate: () => {
          state.values = start.map((value, i) => value + (values[i] - value) * frame.progress);
          paint(state.values);
        }
      });
    });
  }

  function feedback() {
    if (!enabled()) return;
    animate(() => {
      gsap.killTweensOf("#feedbackBox");
      gsap.fromTo("#feedbackBox", { y: 12, opacity: .5 }, { y: 0, opacity: 1, duration: .65, ease: "power3.out", clearProps: "transform,opacity" });
    });
  }

  function recording(active) {
    recordingTween?.kill();
    if (!gsap) return;
    gsap.set(".voice-wave i", { clearProps: "transform" });
    if (active && enabled()) animate(() => {
      recordingTween = gsap.to(".voice-wave i", {
        scaleY: .35, duration: .55, stagger: { each: .12, repeat: -1, yoyo: true }, ease: "sine.inOut"
      });
    });
  }

  function report(score) {
    if (!enabled()) return;
    animate(() => {
      const count = { value: 0 };
      gsap.to(count, { value: score, duration: 1.25, ease: "power2.out",
        onUpdate: () => document.getElementById("reportScore").textContent = Math.round(count.value),
        onInterrupt: () => document.getElementById("reportScore").textContent = score
      });
      gsap.fromTo(".dimension-track span", { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: .09, ease: "power3.out", clearProps: "transform" });
    });
  }

  function entrance() {
    icons();
    let arriving = false;
    try {
      arriving = Boolean(sessionStorage.getItem(routeKey));
      sessionStorage.removeItem(routeKey);
    } catch {}
    if (!enabled()) {
      document.documentElement.classList.remove("route-arrival");
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);
    context = gsap.context(() => {
      const curtain = document.querySelector(".route-curtain");
      if (arriving) {
        gsap.fromTo(curtain, { xPercent: 0 }, { xPercent: -101, duration: .72, ease: "power3.inOut",
          onComplete: () => document.documentElement.classList.remove("route-arrival")
        });
      }
      const timeline = gsap.timeline({ delay: arriving ? .24 : .05 });
      if (document.getElementById("trainingStage")) {
        timeline.from(".topbar", { y: 16, opacity: 0, duration: .75, clearProps: "all" })
          .from(".scene-media", { clipPath: "inset(0 100% 0 0)", duration: 1.05, ease: "power3.inOut", clearProps: "clipPath" }, .1)
          .from(".scene-copy", { y: 14, opacity: 0, duration: .8, clearProps: "all" }, .35)
          .from(".scenario-tab", { x: -16, opacity: 0, stagger: .07, duration: .7, clearProps: "all" }, .12)
          .from(".coach-panel", { x: 20, opacity: 0, duration: .9, clearProps: "all" }, .25);
        gsap.from(".response-panel", { y: 24, opacity: 0, duration: .85, clearProps: "all",
          scrollTrigger: { trigger: ".response-panel", start: "top 94%", once: true }
        });
      } else {
        timeline.from(".report-hero", { y: 18, opacity: 0, duration: .8, clearProps: "all" })
          .from(".score-card", { y: 22, opacity: 0, duration: .85, stagger: .1, clearProps: "all" }, .15);
        document.querySelectorAll(".report-card").forEach(section => {
          gsap.from(section, { y: 28, opacity: 0, duration: .85, clearProps: "all",
            scrollTrigger: { trigger: section, start: "top 94%", once: true }
          });
        });
      }
    });
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("a[data-route]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.href);
  });
  document.addEventListener("pointerdown", event => {
    const button = event.target.closest("button");
    if (!button || !enabled()) return;
    animate(() => {
      gsap.killTweensOf(button, "scale");
      gsap.fromTo(button, { scale: .975 }, { scale: 1, duration: .5, ease: "back.out(1.6)", clearProps: "transform" });
    });
  });
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    context?.revert();
    context = null;
    cancelScene();
    navigating = false;
    document.documentElement.classList.remove("route-arrival");
    if (gsap) gsap.set(["main", ".route-curtain"], { clearProps: "all" });
  });
  preference.addEventListener("change", () => {
    cancelScene();
    context?.revert();
    context = null;
    chartStates.forEach(state => {
      state.tween?.kill();
      state.values = [...state.target];
      state.paint(state.values);
    });
    recording(false);
    document.documentElement.classList.remove("route-arrival");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) recording(false);
  });
  window.TongdunMotion = { icons, navigate, switchScene, cancelScene, radar, feedback, recording, report };
  document.addEventListener("DOMContentLoaded", entrance, { once: true });
})();
