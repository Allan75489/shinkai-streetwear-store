    // Custom cursor
    const cursor = document.getElementById("cursor");
    const follower = document.getElementById("cursor-follower");
    let mouseX = 0,
    mouseY = 0;
    let followerX = 0,
    followerY = 0;

    document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
    });

    function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + "px";
    follower.style.top = followerY + "px";
    requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effect
    document
    .querySelectorAll("a, button, .product-card, .collection-item")
    .forEach((el) => {
        el.addEventListener("mouseenter", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(2)";
        follower.style.transform = "translate(-50%, -50%) scale(1.5)";
        follower.style.borderColor = "rgba(232,19,42,0.8)";
        });
        el.addEventListener("mouseleave", () => {
        cursor.style.transform = "translate(-50%, -50%) scale(1)";
        follower.style.transform = "translate(-50%, -50%) scale(1)";
        follower.style.borderColor = "rgba(232,19,42,0.4)";
        });
    });

    // Scroll reveal
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(
            () => {
                entry.target.classList.add("visible");
            },
            (i % 4) * 100,
            );
            observer.unobserve(entry.target);
        }
        });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    reveals.forEach((el) => observer.observe(el));

    // Nav scroll effect
    const nav = document.querySelector("nav");
    window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        nav.style.mixBlendMode = "normal";
        nav.style.background = "rgba(9,9,9,0.9)";
        nav.style.backdropFilter = "blur(20px)";
        nav.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
    } else {
        nav.style.mixBlendMode = "difference";
        nav.style.background = "transparent";
        nav.style.backdropFilter = "none";
        nav.style.borderBottom = "none";
    }
    });

    // Newsletter
    const nlBtn = document.querySelector(".nl-btn");
    const nlInput = document.querySelector(".nl-input");
    nlBtn.addEventListener("click", () => {
    if (nlInput.value.includes("@")) {
        nlBtn.textContent = "Inscrito ✓";
        nlBtn.style.background = "#1A1A22";
        nlInput.value = "";
    }
    });

    // Parallax on hero
    window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    const heroContent = document.querySelector(".hero-content");
    const heroVisual = document.querySelector(".hero-visual");
    if (heroContent)
        heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
    if (heroVisual)
        heroVisual.style.transform = `translateY(calc(-50% + ${scrolled * 0.15}px))`;
    });
