// ============================================================
// HARSH SUTARIYA — PORTFOLIO SCRIPT
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- PRELOADER ---------------- */
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloader-count');

  function runPreloader(){
    if(prefersReducedMotion){
      preloader.classList.add('hide');
      revealHeroLetters();
      return;
    }
    let count = 0;
    const duration = 1600; // ms
    const start = performance.now();

    function tick(now){
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out for a snappier finish
      const eased = 1 - Math.pow(1 - progress, 3);
      count = Math.round(eased * 100);
      counterEl.textContent = count;
      if(progress < 1){
        requestAnimationFrame(tick);
      } else {
        counterEl.textContent = 100;
        setTimeout(() => {
          preloader.classList.add('hide');
          revealHeroLetters();
        }, 250);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- HERO LETTER REVEAL ---------------- */
  function revealHeroLetters(){
    const letters = document.querySelectorAll('.hero-name .letter');
    letters.forEach((letter, i) => {
      setTimeout(() => letter.classList.add('filled'), 70 * i);
    });
    // fade in eyebrow / pill / desc / actions shortly after
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), 220 + i * 90);
    });
    heroRevealed = true;
  }

  let heroRevealed = false;
  runPreloader();

  /* ---------------- HERO NAME CURSOR EFFECT ---------------- */
  const heroNameEl = document.getElementById('heroName');
  const heroLetters = () => document.querySelectorAll('.hero-name .letter');

  const TEXT_RGB = [243, 242, 238];
  const ACCENT_RGB = [255, 95, 56];
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpColor = (t) => `rgb(${Math.round(lerp(TEXT_RGB[0], ACCENT_RGB[0], t))}, ${Math.round(lerp(TEXT_RGB[1], ACCENT_RGB[1], t))}, ${Math.round(lerp(TEXT_RGB[2], ACCENT_RGB[2], t))})`;

  if(heroNameEl && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    heroNameEl.addEventListener('mousemove', (e) => {
      if(!heroRevealed) return;
      const rect = heroNameEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const radius = 190;

      heroLetters().forEach(letter => {
        const lRect = letter.getBoundingClientRect();
        const lx = lRect.left + lRect.width / 2 - rect.left;
        const ly = lRect.top + lRect.height / 2 - rect.top;
        const dist = Math.hypot(mx - lx, my - ly);
        const strength = Math.max(0, 1 - dist / radius);

        if(strength > 0.02){
          letter.style.transform = `translateY(${-strength * 18}px) scale(${1 + strength * 0.1})`;
          letter.style.fontWeight = Math.round(600 + strength * 300);
          letter.style.color = lerpColor(strength);
          letter.style.webkitTextStroke = `1.5px ${lerpColor(strength)}`;
          letter.style.textShadow = `0 0 ${44 + strength * 60}px rgba(255,95,56,${0.3 + strength * 0.6})`;
        } else {
          letter.style.transform = '';
          letter.style.fontWeight = '';
          letter.style.color = '';
          letter.style.webkitTextStroke = '';
          letter.style.textShadow = '';
        }
      });
    });

    heroNameEl.addEventListener('mouseleave', () => {
      heroLetters().forEach(letter => {
        letter.style.transform = '';
        letter.style.fontWeight = '';
        letter.style.color = '';
        letter.style.webkitTextStroke = '';
        letter.style.textShadow = '';
      });
    });
  }

  /* ---------------- NAV SCROLL STATE ---------------- */
  const nav = document.getElementById('nav');
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------------- MOBILE MENU ---------------- */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealEls = document.querySelectorAll('.reveal-up:not(.hero .reveal-up)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------------- STAT COUNTERS ---------------- */
  const statNums = document.querySelectorAll('.stat-num');
  const statIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const stepTime = Math.max(Math.floor(900 / Math.max(target,1)), 60);
        const step = () => {
          current += 1;
          el.textContent = current;
          if(current < target){ setTimeout(step, stepTime); }
          else { el.textContent = target; }
        };
        step();
        statIo.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  statNums.forEach(el => statIo.observe(el));

  /* ---------------- PHILOSOPHY BACKGROUND ZOOM-ON-SCROLL ---------------- */
  const philosophySection = document.getElementById('philosophy');
  const philosophyArt = document.getElementById('philosophyArt');
  if(philosophySection && philosophyArt && !prefersReducedMotion){
    let ticking = false;
    function updatePhilosophyZoom(){
      const rect = philosophySection.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when section top is just entering the bottom of the viewport,
      // 1 once the section has been scrolled fully through
      const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height * 0.6), 0), 1);
      const zoom = 0.55 + progress * 0.95; // starts small in the background, zooms to fill on arrival
      philosophyArt.style.setProperty('--zoom', zoom.toFixed(3));
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if(!ticking){
        requestAnimationFrame(updatePhilosophyZoom);
        ticking = true;
      }
    }, { passive:true });
    updatePhilosophyZoom();
  }
  const cursorGlow = document.getElementById('cursorGlow');
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorGlow.classList.add('active');
    });
    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
  }

  /* ---------------- SMOOTH ANCHOR SCROLL WITH NAV OFFSET ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if(!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- CONTACT FORM (client-side, opens mail client) ---------------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:harshsavalia75@gmail.com?subject=${subject}&body=${body}`;

    formNote.textContent = "Opening your email client...";
    setTimeout(() => { formNote.textContent = ""; }, 4000);
  });

  /* ---------------- FOOTER YEAR ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- JOURNEY 3D OBJECT ---------------- */
  (function initJourney3D(){
    const canvas = document.getElementById('journeyCanvas');
    if(!canvas || typeof THREE === 'undefined') return;

    const container = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    // wireframe icosahedron
    const geo = new THREE.IcosahedronGeometry(1.7, 1);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xff5f38, wireframe: true, transparent:true, opacity:0.85 });
    const mesh = new THREE.Mesh(geo, wireMat);
    scene.add(mesh);

    // inner glowing core
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x3fe0c5, wireframe:true, transparent:true, opacity:0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // scattered points
    const pointsGeo = new THREE.BufferGeometry();
    const pointCount = 60;
    const positions = new Float32Array(pointCount * 3);
    for(let i=0;i<pointCount;i++){
      const r = 2.4 + Math.random() * 0.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMat = new THREE.PointsMaterial({ color: 0xffb199, size: 0.045, transparent:true, opacity:0.7 });
    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    function resize(){
      const w = container.clientWidth, h = container.clientHeight;
      if(w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let targetRotX = 0, targetRotY = 0;
    window.addEventListener('mousemove', (e) => {
      targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.6;
    });

    let raf;
    function animate(){
      raf = requestAnimationFrame(animate);
      mesh.rotation.y += 0.0032;
      mesh.rotation.x += 0.0014;
      core.rotation.y -= 0.005;
      core.rotation.x += 0.003;
      points.rotation.y += 0.0009;

      mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.02;
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.02;

      renderer.render(scene, camera);
    }

    if(prefersReducedMotion){
      resize();
      renderer.render(scene, camera);
    } else {
      // only animate while the canvas is roughly in view
      const io3d = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            if(!raf) animate();
          } else if(raf){
            cancelAnimationFrame(raf);
            raf = null;
          }
        });
      }, { threshold: 0.05 });
      io3d.observe(container);
    }
  })();

  /* ============================================================
     CONTINUOUS AMBIENT 3D BACKGROUND & SCROLL DYNAMICS
     ============================================================ */
  (function initAmbient3D(){
    const canvas = document.getElementById('ambient3dCanvas');
    if(!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // 1. Primary Wireframe TorusKnot
    const torusGeo = new THREE.TorusKnotGeometry(2.4, 0.5, 75, 14);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xff5f38,
      wireframe: true,
      transparent: true,
      opacity: 0.20
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(4, 2, -2);
    scene.add(torusMesh);

    // 2. Secondary Wireframe Polyhedron Mesh
    const polyGeo = new THREE.IcosahedronGeometry(3.6, 1);
    const polyMat = new THREE.MeshBasicMaterial({
      color: 0x3fe0c5,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const polyMesh = new THREE.Mesh(polyGeo, polyMat);
    polyMesh.position.set(-4.5, -6, -4);
    scene.add(polyMesh);

    // 3. Floating 3D Starfield Nodes
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for(let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 32;
      posArray[i+1] = (Math.random() - 0.5) * 50;
      posArray[i+2] = (Math.random() - 0.5) * 18;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffb199,
      size: 0.065,
      transparent: true,
      opacity: 0.45
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    function resize(){
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
      }, { passive: true });
    }

    let clock = new THREE.Clock();

    function renderAmbient(){
      const elapsedTime = clock.getElapsedTime();
      const scrollY = window.scrollY || window.pageYOffset;

      // Mouse Parallax smooth lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Continuous rotation, ambient floating & dynamic 3D scroll zoom
      torusMesh.rotation.x = elapsedTime * 0.15 + scrollY * 0.0008;
      torusMesh.rotation.y = elapsedTime * 0.22 + scrollY * 0.0012;
      torusMesh.position.y = 2 + Math.sin(elapsedTime * 0.8) * 0.4 - (scrollY * 0.0025);
      torusMesh.position.z = -2 + Math.cos(scrollY * 0.0015) * 2.2;
      torusMesh.scale.setScalar(1 + Math.sin(elapsedTime * 1.2 + scrollY * 0.002) * 0.35);

      polyMesh.rotation.x = -elapsedTime * 0.12 - scrollY * 0.0006;
      polyMesh.rotation.z = elapsedTime * 0.18 + scrollY * 0.001;
      polyMesh.position.y = -6 + Math.cos(elapsedTime * 0.7) * 0.5 - (scrollY * 0.002);
      polyMesh.position.z = -4 + Math.sin(scrollY * 0.0018) * 2.8;
      polyMesh.scale.setScalar(1 + Math.cos(elapsedTime * 0.9 + scrollY * 0.0015) * 0.4);

      particles.rotation.y = elapsedTime * 0.03 + scrollY * 0.0004;

      // Camera Scroll-Linked Dynamics & 3D Depth Zoom
      camera.position.y = mouseY * 0.5 - (scrollY * 0.0022);
      camera.position.x = mouseX * 0.5;
      camera.position.z = 10 + Math.sin(scrollY * 0.001) * 3.5;

      renderer.render(scene, camera);
      requestAnimationFrame(renderAmbient);
    }

    if(!prefersReducedMotion){
      renderAmbient();
    } else {
      renderer.render(scene, camera);
    }
  })();

  /* ============================================================
     3D INTERACTIVE TILT & HOVER PHYSICS ENGINE
     ============================================================ */
  (function init3DTiltPhysics(){
    if(prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const tiltElements = document.querySelectorAll('[data-tilt-3d]');

    tiltElements.forEach(el => {
      let state = {
        currentX: 0,
        currentY: 0,
        currentZ: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        rafId: null,
        isHovered: false
      };

      const maxTilt = el.classList.contains('hero-avatar-card') ? 18 : 10;
      const maxTransZ = el.classList.contains('hero-avatar-card') ? 28 : 16;

      function updatePhysics(){
        state.currentX += (state.targetX - state.currentX) * 0.1;
        state.currentY += (state.targetY - state.currentY) * 0.1;
        state.currentZ += (state.targetZ - state.currentZ) * 0.1;

        el.style.transform = `rotateX(${state.currentX.toFixed(2)}deg) rotateY(${state.currentY.toFixed(2)}deg) translateZ(${state.currentZ.toFixed(2)}px)`;

        if(state.isHovered || Math.abs(state.targetX - state.currentX) > 0.05 || Math.abs(state.targetY - state.currentY) > 0.05){
          state.rafId = requestAnimationFrame(updatePhysics);
        } else {
          el.style.transform = '';
          state.rafId = null;
        }
      }

      function onMouseMove(e){
        // If cursor is hovering over action buttons, hold tilt steady for 100% solid single-click trigger
        if(e.target && e.target.closest && e.target.closest('.work-card-actions')){
          return;
        }

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const relX = (e.clientX - centerX) / (rect.width / 2);
        const relY = (e.clientY - centerY) / (rect.height / 2);

        state.targetX = -relY * maxTilt;
        state.targetY = relX * maxTilt;
        state.targetZ = maxTransZ;

        if(!state.rafId){
          state.rafId = requestAnimationFrame(updatePhysics);
        }
      }

      function onMouseEnter(){
        state.isHovered = true;
      }

      function onMouseLeave(){
        state.isHovered = false;
        state.targetX = 0;
        state.targetY = 0;
        state.targetZ = 0;
        if(!state.rafId){
          state.rafId = requestAnimationFrame(updatePhysics);
        }
      }

      el.addEventListener('mousemove', onMouseMove, { passive: true });
      el.addEventListener('mouseenter', onMouseEnter, { passive: true });
      el.addEventListener('mouseleave', onMouseLeave, { passive: true });
    });
  })();

  /* ============================================================
     DYNAMIC SCROLL-DRIVEN 3D ZOOM DEPTH ANIMATIONS
     ============================================================ */
  (function initScrollZoom3D(){
    if(prefersReducedMotion) return;

    const zoomElements = document.querySelectorAll('.zoom-3d-scroll, .work-card, .philosophy-body, .timeline-item');
    let ticking = false;

    function updateScrollZoom(){
      const vh = window.innerHeight;

      zoomElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Calculate relative position to viewport center (-1 to +1)
        const centerOffset = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
        const distFromCenter = Math.min(Math.abs(centerOffset), 1.5);

        // When element is near screen center, zoom in towards user (translateZ + scale up)
        // When far from center, zoom out into screen depth (translateZ negative)
        const zoomDepth = (1 - distFromCenter * 0.6) * 35; // px translateZ
        const zoomScale = 1 + (1 - distFromCenter * 0.5) * 0.04;

        if(el.classList.contains('in-view') || rect.top < vh && rect.bottom > 0){
          el.style.transform = `perspective(1000px) translateZ(${zoomDepth.toFixed(1)}px) scale(${zoomScale.toFixed(3)})`;
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if(!ticking){
        requestAnimationFrame(updateScrollZoom);
        ticking = true;
      }
    }, { passive: true });

    updateScrollZoom();
  })();

  /* ============================================================
     PROJECT DETAILS MODAL HANDLER
     ============================================================ */
  (function initProjectModal(){
    const modal = document.getElementById('projectModal');
    const modalCloseBtn = document.getElementById('modalClose');
    const modalCloseBtnGhost = document.getElementById('modalCloseBtn');
    const modalTag = document.getElementById('modalTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalImg = document.getElementById('modalImg');
    const modalDesc = document.getElementById('modalDesc');
    const modalHighlights = document.getElementById('modalHighlights');
    const modalVisitBtn = document.getElementById('modalVisitBtn');

    if(!modal) return;

    function openModal(card){
      const title = card.dataset.title || '';
      const tag = card.dataset.tag || '';
      const subtitle = card.dataset.subtitle || '';
      const desc = card.dataset.desc || '';
      const highlightsStr = card.dataset.highlights || '';
      const url = card.dataset.url || '';
      const img = card.dataset.img || '';

      modalTitle.textContent = title;
      modalTag.textContent = tag;
      modalSubtitle.textContent = subtitle;
      modalDesc.textContent = desc;

      if(img){
        modalImg.src = img;
        modalImg.alt = title;
        modalImg.parentElement.style.display = 'block';
      } else {
        modalImg.parentElement.style.display = 'none';
      }

      // Populate highlights
      modalHighlights.innerHTML = '';
      if(highlightsStr){
        const list = highlightsStr.split('|');
        list.forEach(item => {
          if(item.trim()){
            const li = document.createElement('li');
            li.textContent = item.trim();
            modalHighlights.appendChild(li);
          }
        });
      }

      // Visit button
      if(url){
        modalVisitBtn.href = url;
        modalVisitBtn.style.display = 'inline-flex';
        modalVisitBtn.innerHTML = `Visit Live Project <i>↗</i>`;
      } else {
        modalVisitBtn.style.display = 'none';
      }

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(){
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Attach listeners to "View Details" buttons with immediate single-click response
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      const handleOpen = (e) => {
        if(e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const card = btn.closest('.work-card');
        if(card) openModal(card);
      };
      btn.addEventListener('click', handleOpen);
    });

    // Ensure Visit links trigger cleanly on single click
    document.querySelectorAll('.btn-card-visit:not(.btn-disabled)').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if(modalCloseBtnGhost) modalCloseBtnGhost.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && modal.classList.contains('active')){
        closeModal();
      }
    });
  })();

  /* ============================================================
     PROFILE PHOTO LIGHTBOX HANDLER
     ============================================================ */
  (function initProfileLightbox(){
    const lightbox = document.getElementById('profileLightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const profileCard = document.querySelector('.hero-avatar-card');

    if(!lightbox || !profileCard) return;

    function openLightbox(){
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox(){
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    profileCard.addEventListener('click', openLightbox);
    if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && lightbox.classList.contains('active')){
        closeLightbox();
      }
    });
  })();

});


