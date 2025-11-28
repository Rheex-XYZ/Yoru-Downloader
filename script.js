// ⚡ Proxy Codetabs untuk bypass CORS
const proxy = "https://api.codetabs.com/v1/proxy/?quest=";

// Inisialisasi tema
document.addEventListener("DOMContentLoaded", function () {
  // Cek tema yang tersimpan di localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Update ikon tema
  updateThemeIcon(savedTheme);

  // Buat partikel untuk background
  createParticles();

  // Setup event listeners
  setupEventListeners();
});

// Fungsi untuk membuat partikel background
function createParticles() {
  const particlesContainer = document.getElementById("particles-bg");
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Ukuran acak
    const size = Math.random() * 5 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Posisi acak
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    particle.style.left = `${posX}%`;
    particle.style.top = `${posY}%`;

    // Animasi acak
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    particlesContainer.appendChild(particle);
  }
}

// Fungsi untuk setup event listeners
function setupEventListeners() {
  // Toggle tema
  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);

  // Toggle menu
  document.getElementById("menu-toggle").addEventListener("click", toggleMenu);
  document.getElementById("close-menu").addEventListener("click", toggleMenu);

  // Menu navigation
  const menuItems = document.querySelectorAll(".menu-item a");
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Update active menu item
      menuItems.forEach((i) => i.parentElement.classList.remove("active"));
      this.parentElement.classList.add("active");

      // Scroll to section
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: "smooth",
        });

        // Close menu on mobile
        if (window.innerWidth <= 768) {
          toggleMenu();
        }
      }
    });
  });

  // Search functionality
  document
    .getElementById("search-btn")
    .addEventListener("click", performSearch);
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    const sideMenu = document.getElementById("side-menu");
    const menuToggle = document.getElementById("menu-toggle");

    if (
      !sideMenu.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      sideMenu.classList.contains("active")
    ) {
      toggleMenu();
    }
  });
}

// Fungsi untuk toggle tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

// Fungsi untuk update ikon tema
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  const icon = themeToggle.querySelector("i");

  if (theme === "light") {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }
}

// Fungsi untuk toggle menu
function toggleMenu() {
  const sideMenu = document.getElementById("side-menu");
  sideMenu.classList.toggle("active");
}

// Fungsi untuk pencarian
function performSearch() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();

  if (!searchTerm) {
    showNotification("Silakan masukkan kata kunci pencarian");
    return;
  }

  // Reset active menu item
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Cari section yang sesuai
  let found = false;

  if (searchTerm.includes("download") || searchTerm.includes("video")) {
    document
      .querySelector('a[href="#downloaders"]')
      .parentElement.classList.add("active");
    scrollToSection("downloaders");
    found = true;
  } else if (searchTerm.includes("about") || searchTerm.includes("tentang")) {
    document
      .querySelector('a[href="#about"]')
      .parentElement.classList.add("active");
    scrollToSection("about");
    found = true;
  }

  if (!found) {
    showNotification("Tidak ada hasil yang ditemukan untuk: " + searchTerm);
  }
}

// Fungsi untuk scroll ke section
function scrollToSection(sectionId) {
  const targetSection = document.querySelector(`#${sectionId}`);

  if (targetSection) {
    window.scrollTo({
      top: targetSection.offsetTop - 80,
      behavior: "smooth",
    });

    // Highlight section
    targetSection.classList.add("highlight");
    setTimeout(() => {
      targetSection.classList.remove("highlight");
    }, 2000);
  }
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Hide notification
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Fungsi untuk menampilkan pesan loading
function showLoading(elementId) {
  document.getElementById(elementId).innerHTML =
    '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Memproses permintaan...</div>';
}

// Fungsi untuk menampilkan pesan error
function showError(elementId, message) {
  document.getElementById(
    elementId
  ).innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
}

// Fungsi untuk membuat tombol download
function createDownloadButton(url, text) {
  const a = document.createElement("a");
  a.href = url;
  a.textContent = text;
  a.className = "download-btn";
  a.target = "_blank";
  a.setAttribute("download", "");
  return a;
}

/**
 * Fungsi pembantu untuk menangani respons API dengan lebih baik.
 * Versi ini lebih tangguh menghadapi kegagalan proxy.
 */
async function handleApiResponse(response, resultElementId) {
  // Periksa jika status respons tidak OK (bukan 200-299)
  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `HTTP Error! Status: ${response.status}, Response: ${errorText.substring(
        0,
        200
      )}`
    );
    throw new Error(
      `Server merespons dengan kesalahan: ${response.status}. Silakan coba lagi.`
    );
  }

  // Ambil respons sebagai teks terlebih dahulu untuk pemeriksaan yang lebih robust
  const responseText = await response.text();

  // Periksa apakah respons kosong
  if (!responseText) {
    console.error("API returned an empty response body.");
    throw new Error(
      "Server mengembalikan respons kosong. Mungkin video tidak ditemukan atau API sedang bermasalah. Coba kata kunci lain."
    );
  }

  // Coba parsing teks respons sebagai JSON
  try {
    return JSON.parse(responseText);
  } catch (jsonError) {
    // Jika parsing gagal, artinya respons bukan JSON yang valid
    console.error("JSON Parsing Error:", jsonError);
    console.error("Response Body:", responseText.substring(0, 200));
    throw new Error(
      "Respons dari server tidak valid (bukan JSON). Mungkin ada masalah dengan API."
    );
  }
}

// Fitur Facebook Downloader
async function downloadFacebook() {
  const url = document.getElementById("fb-url-input").value;
  if (!url) {
    showError("fb-result", "Silakan masukkan link Facebook.");
    return;
  }

  showLoading("fb-result");

  try {
    const response = await fetch(
      proxy +
        `https://fathurweb.qzz.io/api/download/facebook?url=${encodeURIComponent(
          url
        )}`
    );
    const data = await handleApiResponse(response, "fb-result");

    if (data.status) {
      const resultDiv = document.getElementById("fb-result");
      resultDiv.innerHTML = "";

      const downloadItem = document.createElement("div");
      downloadItem.className = "download-item";

      const downloadButtons = document.createElement("div");
      downloadButtons.className = "download-buttons";

      const uniqueData = [];
      const seenQualities = new Set();
      data.result.data.forEach((item) => {
        const key = `${item.resolution}-${item.format}`;
        if (!seenQualities.has(key)) {
          seenQualities.add(key);
          uniqueData.push(item);
        }
      });

      uniqueData.forEach((item) => {
        const button = createDownloadButton(
          item.url,
          `Download ${item.resolution} (${item.format})`
        );
        downloadButtons.appendChild(button);
      });

      downloadItem.appendChild(downloadButtons);
      resultDiv.appendChild(downloadItem);
    } else {
      showError(
        "fb-result",
        data.message || "Gagal mengambil data video Facebook."
      );
    }
  } catch (error) {
    console.error("Facebook Downloader Error:", error);
    showError("fb-result", error.message);
  }
}

// Fitur Instagram Downloader
async function downloadInstagram() {
  const url = document.getElementById("ig-url-input").value;
  if (!url) {
    showError("ig-result", "Silakan masukkan link Instagram.");
    return;
  }

  showLoading("ig-result");

  try {
    const response = await fetch(
      proxy +
        `https://fathurweb.qzz.io/api/download/instagram?url=${encodeURIComponent(
          url
        )}`
    );
    const data = await handleApiResponse(response, "ig-result");

    if (data.status && data.result.length > 0) {
      const resultDiv = document.getElementById("ig-result");
      resultDiv.innerHTML = "";

      const downloadItem = document.createElement("div");
      downloadItem.className = "download-item";

      const downloadButtons = document.createElement("div");
      downloadButtons.className = "download-buttons";

      const button = createDownloadButton(data.result[0].url, "Download Media");
      downloadButtons.appendChild(button);

      downloadItem.appendChild(downloadButtons);
      resultDiv.appendChild(downloadItem);
    } else {
      showError(
        "ig-result",
        data.message || "Media tidak ditemukan atau link tidak valid."
      );
    }
  } catch (error) {
    console.error("Instagram Downloader Error:", error);
    showError("ig-result", error.message);
  }
}

// Fitur TikTok Downloader
async function downloadTikTok() {
  const url = document.getElementById("tiktok-url-input").value;
  if (!url) {
    showError("tiktok-result", "Silakan masukkan link TikTok.");
    return;
  }

  showLoading("tiktok-result");

  try {
    const response = await fetch(
      proxy +
        `https://fathurweb.qzz.io/api/download/tiktok?url=${encodeURIComponent(
          url
        )}`
    );
    const data = await handleApiResponse(response, "tiktok-result");

    if (data.status) {
      const resultDiv = document.getElementById("tiktok-result");
      resultDiv.innerHTML = "";

      const downloadItem = document.createElement("div");
      downloadItem.className = "download-item";

      const downloadButtons = document.createElement("div");
      downloadButtons.className = "download-buttons";

      const videoButton = createDownloadButton(
        data.result.video,
        "Download Video (SD)"
      );
      downloadButtons.appendChild(videoButton);

      if (data.result.video_hd) {
        const videoHdButton = createDownloadButton(
          data.result.video_hd,
          "Download Video (HD)"
        );
        downloadButtons.appendChild(videoHdButton);
      }

      const audioButton = createDownloadButton(
        data.result.audio,
        "Download Audio"
      );
      downloadButtons.appendChild(audioButton);

      downloadItem.appendChild(downloadButtons);
      resultDiv.appendChild(downloadItem);
    } else {
      showError(
        "tiktok-result",
        data.message || "Gagal mengambil data video TikTok."
      );
    }
  } catch (error) {
    console.error("TikTok Downloader Error:", error);
    showError("tiktok-result", error.message);
  }
}

// Fitur YouTube to MP3
async function downloadYtMp3() {
  const url = document.getElementById("ytmp3-url-input").value;
  if (!url) {
    showError("ytmp3-result", "Silakan masukkan link YouTube.");
    return;
  }

  showLoading("ytmp3-result");

  try {
    const response = await fetch(
      proxy +
        `https://fathurweb.qzz.io/api/download/ytmp3?url=${encodeURIComponent(
          url
        )}&quality=320`
    );
    const data = await handleApiResponse(response, "ytmp3-result");

    if (data.status) {
      const resultDiv = document.getElementById("ytmp3-result");
      resultDiv.innerHTML = "";

      const downloadItem = document.createElement("div");
      downloadItem.className = "download-item";

      const downloadButtons = document.createElement("div");
      downloadButtons.className = "download-buttons";

      const button = createDownloadButton(data.result.url, `Download MP3`);
      downloadButtons.appendChild(button);

      downloadItem.appendChild(downloadButtons);
      resultDiv.appendChild(downloadItem);
    } else {
      showError(
        "ytmp3-result",
        data.message || "Gagal mengkonversi video ke MP3."
      );
    }
  } catch (error) {
    console.error("YouTube to MP3 Error:", error);
    showError("ytmp3-result", error.message);
  }
}

// Fitur YouTube to MP4
async function downloadYtMp4() {
  const url = document.getElementById("ytmp4-url-input").value;
  const quality = document.getElementById("ytmp4-quality").value;

  if (!url) {
    showError("ytmp4-result", "Silakan masukkan link YouTube.");
    return;
  }

  showLoading("ytmp4-result");

  try {
    const response = await fetch(
      proxy +
        `https://fathurweb.qzz.io/api/download/ytmp4?url=${encodeURIComponent(
          url
        )}&quality=${quality}`
    );
    const data = await handleApiResponse(response, "ytmp4-result");

    if (data.status) {
      const resultDiv = document.getElementById("ytmp4-result");
      resultDiv.innerHTML = "";

      const downloadItem = document.createElement("div");
      downloadItem.className = "download-item";

      const downloadButtons = document.createElement("div");
      downloadButtons.className = "download-buttons";

      const button = createDownloadButton(data.result.url, `Download MP4`);
      downloadButtons.appendChild(button);

      downloadItem.appendChild(downloadButtons);
      resultDiv.appendChild(downloadItem);
    } else {
      showError(
        "ytmp4-result",
        data.message || "Gagal mengkonversi video ke MP4."
      );
    }
  } catch (error) {
    console.error("YouTube to MP4 Error:", error);
    showError("ytmp4-result", error.message);
  }
}
