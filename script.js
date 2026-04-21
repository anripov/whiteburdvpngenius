/* ==========================================================================
   WHITEBURD — motion + interaction
   - WebGL liquid-light background (cursor-reactive FBM shader)
   - custom cursor with context labels + magnetic hover
   - per-character hero split (animated)
   - horizontal-pin Manifest section
   - interactive Fracture canvas (drag to fracture)
   - live UTC clocks per network city
   - marquee, reveal-on-scroll, boot veil
   ========================================================================== */

(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ---------------------------------------------------------------------- */
  /*  BOOT VEIL                                                             */
  /* ---------------------------------------------------------------------- */
  const boot = document.querySelector(".boot");
  const bootPct = document.querySelector(".boot__pct");
  if (boot) {
    if (reduced) {
      boot.classList.add("is-off");
    } else {
      let p = 0;
      const iv = setInterval(() => {
        p = Math.min(100, p + Math.random() * 18 + 4);
        if (bootPct) bootPct.textContent = String(Math.floor(p)).padStart(3, "0") + "%";
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => boot.classList.add("is-off"), 220);
        }
      }, 90);
      // safety: never stick
      setTimeout(() => boot.classList.add("is-off"), 2600);
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  SPLIT TEXT  —  animate per character                                  */
  /* ---------------------------------------------------------------------- */
  const splitTargets = document.querySelectorAll("[data-split]");
  splitTargets.forEach((el) => {
    const text = el.getAttribute("data-split") || el.textContent || "";
    el.textContent = "";
    let delay = 0;
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "ch" + (ch === " " ? " sp" : "");
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = (0.25 + delay).toFixed(2) + "s";
      delay += 0.04;
      el.appendChild(span);
    }
  });

  /* ---------------------------------------------------------------------- */
  /*  NAV SCROLLED STATE                                                    */
  /* ---------------------------------------------------------------------- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 16);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------- */
  /*  REVEAL ON SCROLL                                                      */
  /* ---------------------------------------------------------------------- */
  const revealSelectors = [
    ".section .display",
    ".section__index",
    ".craft__item",
    ".network__grid li",
    ".access__frame",
    ".footer__mark",
    ".footer__grid",
    ".fracture__stage",
  ];
  const targets = document.querySelectorAll(revealSelectors.join(", "));
  targets.forEach((el) => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------------------------------------------------------------- */
  /*  CUSTOM CURSOR                                                         */
  /* ---------------------------------------------------------------------- */
  const cursor = document.querySelector(".cursor");
  const cursorLabel = document.querySelector(".cursor__label");
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

  if (cursor && !coarse && !reduced) {
    window.addEventListener("mousemove", (e) => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    const tick = () => {
      tx += (cx - tx) * 0.2;
      ty += (cy - ty) * 0.2;
      cursor.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const hoverables = document.querySelectorAll("a, button, input, [data-cursor]");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        const label = el.getAttribute("data-cursor");
        if (cursorLabel) cursorLabel.setAttribute("data-label", label || "");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        if (cursorLabel) cursorLabel.setAttribute("data-label", "passage");
      });
    });
    window.addEventListener("mousedown", () => cursor.classList.add("is-press"));
    window.addEventListener("mouseup",   () => cursor.classList.remove("is-press"));
  }

  /* ---------------------------------------------------------------------- */
  /*  MAGNETIC BUTTONS                                                      */
  /* ---------------------------------------------------------------------- */
  if (!coarse && !reduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const inner = el.querySelector(".magnetic__inner") || el;
      let rx = 0, ry = 0, mx = 0, my = 0, raf = 0;
      const strength = 0.35;
      const loop = () => {
        mx += (rx - mx) * 0.2;
        my += (ry - my) * 0.2;
        el.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        inner.style.transform = `translate3d(${mx * 0.4}px, ${my * 0.4}px, 0)`;
        raf = (Math.abs(rx - mx) > 0.05 || Math.abs(ry - my) > 0.05)
          ? requestAnimationFrame(loop)
          : 0;
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        rx = (e.clientX - (r.left + r.width / 2)) * strength;
        ry = (e.clientY - (r.top  + r.height / 2)) * strength;
        kick();
      });
      el.addEventListener("mouseleave", () => { rx = 0; ry = 0; kick(); });
    });
  }

  /* ---------------------------------------------------------------------- */
  /*  MARQUEE  —  duplicate track for seamless loop                          */
  /* ---------------------------------------------------------------------- */
  const mTrack = document.querySelector(".marquee__track");
  if (mTrack) {
    // content is already duplicated in HTML; ensure width is at least 2x viewport
  }

  /* ---------------------------------------------------------------------- */
  /*  HORIZONTAL-PIN MANIFEST                                                */
  /* ---------------------------------------------------------------------- */
  const hscroll = document.querySelector(".hscroll");
  const track   = document.querySelector("[data-track]");
  const bar     = document.querySelector(".hscroll__bar");
  if (hscroll && track && window.innerWidth >= 821) {
    const update = () => {
      const r = hscroll.getBoundingClientRect();
      const total = hscroll.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -r.top / total));
      const dist = track.scrollWidth - window.innerWidth + 120;
      track.style.transform = `translate3d(${(-dist * progress).toFixed(2)}px, 0, 0)`;
      if (bar) bar.style.width = (progress * 100).toFixed(1) + "%";
    };
    document.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------------------------------------------------------------------- */
  /*  LIVE CLOCKS                                                            */
  /* ---------------------------------------------------------------------- */
  const cityNodes = document.querySelectorAll(".network__grid li[data-tz]");
  if (cityNodes.length) {
    const pad = (n) => String(n).padStart(2, "0");
    const render = () => {
      const now = new Date();
      cityNodes.forEach((li) => {
        const tz = li.getAttribute("data-tz");
        try {
          const fmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: tz, hour12: false,
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          });
          const t = fmt.format(now);
          const time = li.querySelector(".n__time");
          if (time) time.textContent = t;
        } catch (_) { /* unsupported TZ */ }
        const ms = li.querySelector(".n__ms");
        if (ms) {
          const base = Number(li.getAttribute("data-ms") || 10);
          const jitter = base + Math.round(Math.sin(Date.now() / 800 + base) * 2 + Math.random() * 1.4);
          ms.textContent = jitter + "ms · online";
        }
      });
    };
    render();
    setInterval(render, 1000);
  }

  /* ---------------------------------------------------------------------- */
  /*  CORDS ticker (hero top-right)                                          */
  /* ---------------------------------------------------------------------- */
  const coord = document.getElementById("coord");
  if (coord && !reduced) {
    const glyphs = "0123456789°′NEWS ";
    const originals = coord.textContent || "N 55°45′ · E 37°37′";
    setInterval(() => {
      let s = "";
      for (let i = 0; i < originals.length; i++) {
        if (Math.random() < 0.04) s += glyphs[Math.floor(Math.random() * glyphs.length)];
        else s += originals[i];
      }
      coord.textContent = s;
      setTimeout(() => (coord.textContent = originals), 120);
    }, 2400);
  }

  /* ---------------------------------------------------------------------- */
  /*  WEBGL LIQUID LIGHT BACKGROUND                                          */
  /* ---------------------------------------------------------------------- */
  const canvas = document.getElementById("liquid");
  if (canvas && !reduced) {
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
    if (gl) initLiquid(gl, canvas);
    else canvas.style.display = "none";
  }

  function initLiquid(gl, canvas) {
    const vsSrc = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;
    const fsSrc = `
      precision highp float;
      uniform vec2  u_res;
      uniform vec2  u_mouse;
      uniform float u_time;
      uniform float u_scroll;

      // Simplex 2D (Ashima)
      vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
      vec2 mod289(vec2 x){return x - floor(x * (1.0/289.0)) * 289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                       + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                                dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * snoise(p);
          p  = p * 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
        vec2 m  = (u_mouse       - 0.5 * u_res) / min(u_res.x, u_res.y);

        float t = u_time * 0.14 + u_scroll * 0.4;

        // domain warp FBM — "liquid" substance
        vec2 q = vec2(fbm(uv + vec2(0.0, t)),
                      fbm(uv + vec2(5.2, -t)));
        vec2 r = vec2(fbm(uv + q * 1.2 + vec2(1.7, 9.2) + t * 0.5),
                      fbm(uv + q * 1.2 + vec2(8.3, 2.8) - t * 0.5));
        float f = fbm(uv + r * 1.4);

        // cursor halo light (soft and wide)
        float d = length(uv - m);
        float light = exp(-d * 1.6) * 2.0;

        // columnar shaft around mouse x — 'passage of light'
        float shaft = exp(-pow((uv.x - m.x) * 3.6, 2.0)) * 0.6;

        // ambient liquid presence — always on so the stage never flatlines
        float ambient = 0.55 + 0.65 * f + 0.18 * r.x;

        float tone = smoothstep(0.0, 1.0, ambient + light + shaft * 0.55);

        // warm / cool dispersion by warp field
        vec3 warm = vec3(1.00, 0.96, 0.88);
        vec3 cool = vec3(0.84, 0.90, 1.00);
        vec3 col  = mix(cool, warm, 0.5 + 0.5 * r.x) * tone * tone;

        // subtle vignette
        float vig = smoothstep(1.35, 0.28, length(uv));
        col *= vig;

        // cinematic but present
        col = pow(col, vec3(1.05));
        col *= 0.85;

        // faint film grain (cheap)
        float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (g - 0.5) * 0.018;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[liquid] shader compile:", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[liquid] link:", gl.getProgramInfoLog(prog));
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    // fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes    = gl.getUniformLocation(prog, "u_res");
    const uMouse  = gl.getUniformLocation(prog, "u_mouse");
    const uTime   = gl.getUniformLocation(prog, "u_time");
    const uScroll = gl.getUniformLocation(prog, "u_scroll");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      canvas.width  = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width  = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let mouse = [canvas.width * 0.5, canvas.height * 0.5];
    window.addEventListener("mousemove", (e) => {
      mouse = [e.clientX * dpr, (window.innerHeight - e.clientY) * dpr];
    }, { passive: true });

    const t0 = performance.now();
    const render = () => {
      const t = (performance.now() - t0) / 1000;
      const scroll = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  /* ---------------------------------------------------------------------- */
  /*  FRACTURE CANVAS                                                        */
  /*  Drag to open cracks from the cursor path; light leaks through.        */
  /* ---------------------------------------------------------------------- */
  const fc = document.getElementById("fractureCanvas");
  if (fc) initFracture(fc);

  function initFracture(canvas) {
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0, H = 0;

    const cracks = [];       // array of {pts:[{x,y}], life, width}
    const particles = [];    // small light particles along cracks
    let active = null;       // current drag-crack
    let pointerX = 0, pointerY = 0;
    let firstDrawn = false;

    const resize = () => {
      const r = parent.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBase();
      firstDrawn = true;
    };

    // base "concrete"
    const drawBase = () => {
      // dark tonal wash
      const g = ctx.createRadialGradient(W * 0.5, H * 0.55, 40, W * 0.5, H * 0.55, Math.max(W, H) * 0.75);
      g.addColorStop(0, "#1a1b20");
      g.addColorStop(0.5, "#0a0b0f");
      g.addColorStop(1, "#030303");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // speckle grain
      const img = ctx.getImageData(0, 0, Math.min(W, 800), Math.min(H, 450));
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 18;
        img.data[i]   = Math.max(0, Math.min(255, img.data[i]   + n));
        img.data[i+1] = Math.max(0, Math.min(255, img.data[i+1] + n));
        img.data[i+2] = Math.max(0, Math.min(255, img.data[i+2] + n));
      }
      ctx.putImageData(img, 0, 0);

      // a few initial background cracks
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        const sx = Math.random() * W, sy = Math.random() * H;
        ctx.moveTo(sx, sy);
        let x = sx, y = sy;
        const segs = 6 + Math.floor(Math.random() * 8);
        for (let j = 0; j < segs; j++) {
          x += (Math.random() - 0.5) * 80;
          y += (Math.random() - 0.5) * 80;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const addPoint = (x, y) => {
      if (!active) return;
      const last = active.pts[active.pts.length - 1];
      if (last) {
        const dx = x - last.x, dy = y - last.y;
        const d = Math.hypot(dx, dy);
        if (d < 3) return;
      }
      active.pts.push({ x, y });
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.8) * 0.6,
          life: 1,
        });
      }
    };

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const p = (e.touches && e.touches[0]) || e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };

    const start = (e) => {
      const { x, y } = getPos(e);
      pointerX = x; pointerY = y;
      active = { pts: [{ x, y }], life: 1, width: 2 + Math.random() * 2 };
      cracks.push(active);
      if (cracks.length > 12) cracks.shift();
    };
    const move = (e) => {
      const { x, y } = getPos(e);
      pointerX = x; pointerY = y;
      if (active) addPoint(x, y);
    };
    const end = () => { active = null; };

    canvas.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); start(e); }, { passive: false });
    canvas.addEventListener("touchmove",  (e) => { e.preventDefault(); move(e);  }, { passive: false });
    canvas.addEventListener("touchend", end);

    const render = () => {
      if (!firstDrawn) { requestAnimationFrame(render); return; }

      // fade previous overlay slightly — keeps cracks but lets light dim
      ctx.save();
      ctx.fillStyle = "rgba(5,6,8,0.04)";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // draw cracks (luminous)
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      cracks.forEach((c) => {
        if (c.pts.length < 2) return;

        // outer wide warm glow
        ctx.strokeStyle = "rgba(255,230,180,0.12)";
        ctx.lineWidth = c.width * 7;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(c.pts[0].x, c.pts[0].y);
        for (let i = 1; i < c.pts.length; i++) ctx.lineTo(c.pts[i].x, c.pts[i].y);
        ctx.stroke();

        // mid cool
        ctx.strokeStyle = "rgba(200,220,255,0.25)";
        ctx.lineWidth = c.width * 3.5;
        ctx.stroke();

        // core white
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = c.width;
        ctx.stroke();

        // tiny off-shoots
        if (Math.random() < 0.08 && c.pts.length > 3) {
          const p = c.pts[c.pts.length - 2];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const sx = p.x + (Math.random() - 0.5) * 48;
          const sy = p.y + (Math.random() - 0.5) * 48;
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });
      ctx.restore();

      // particles
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.01; p.life -= 0.015;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,245,220,${p.life * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2 + p.life * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // cursor-proximity highlight
      if (!coarse) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const grad = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 140);
        grad.addColorStop(0, "rgba(255,250,235,0.18)");
        grad.addColorStop(1, "rgba(255,250,235,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(render);
  }
})();
