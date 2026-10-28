'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ==========================================
// RIUNGIN.ID BACKEND CONFIGURATION
// ==========================================
const API_BASE_URL = 'https://api.riungin.id';
const EVENT_SLUG = 'kadityafikar-421';

// 1. Helper Device ID (localStorage)
function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem("bw_device_id");
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem("bw_device_id", deviceId);
  }
  return deviceId;
}

// Helper: Extract UID from URL (?uid={uid} or route param /{uid})
function getGuestUid() {
  const params = new URLSearchParams(window.location.search);
  const uidParam = params.get('uid');
  if (uidParam && uidParam.trim()) return uidParam.trim();
  
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const last = segments[segments.length - 1];
    if (last && !last.endsWith('.html') && last !== 'cintya-hans' && last !== 'outputs') {
      return decodeURIComponent(last);
    }
  }
  return null;
}

const currentDeviceId = getOrCreateDeviceId();
const guestUid = getGuestUid();
let currentGuest = null;

// ==========================================
// CORE DOM ELEMENTS & NAVIGATION
// ==========================================
const opening = $('#opening');
const main = $('#main');
const navigation = $('#section-menu');
const menuToggle = $('#menu-toggle');
const fallbackScreen = $('#fallback-screen');
const keepsakeCollage = $('#keepsake-collage');
const rsvpForm = $('#rsvp-form');
const wishesForm = $('#wishes-form');

function closeMenu(returnFocus = false) {
  navigation.hidden = true;
  navigation.inert = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu undangan');
  if (returnFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const open = navigation.hidden;
  navigation.hidden = !open;
  navigation.inert = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Tutup menu undangan' : 'Buka menu undangan');
});

navigation.addEventListener('click', e => {
  if (e.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !navigation.hidden) closeMenu(true);
});

document.addEventListener('click', e => {
  if (!navigation.hidden && !navigation.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
});

// ==========================================
// FALLBACK SCREEN (HTTP 403 / 404 / ERROR)
// ==========================================
function showFallbackScreen(errorInfo) {
  if (openingTimers) openingTimers.forEach(clearTimeout);
  if (musicTimer) clearInterval(musicTimer);
  
  if (opening) { opening.hidden = true; opening.inert = true; }
  if (main) { main.hidden = true; main.inert = true; }
  if (navigation) { navigation.hidden = true; navigation.inert = true; }
  if (menuToggle) menuToggle.hidden = true;
  const desktopArt = $('.desktop-art');
  if (desktopArt) desktopArt.hidden = true;
  const musicToggle = $('#music-toggle');
  if (musicToggle) musicToggle.hidden = true;
  document.body.classList.remove('unopened');

  const titleEl = $('#fallback-title');
  const msgEl = $('#fallback-message');
  const subEl = $('#fallback-sub');

  if (errorInfo.code === 'DEVICE_LOCKED' || errorInfo.locked) {
    if (titleEl) titleEl.textContent = 'Perangkat Terkunci';
    if (msgEl) msgEl.textContent = errorInfo.message || 'Undangan ini bersifat privat dan sudah dibuka di perangkat lain.';
    if (subEl) subEl.textContent = 'Silakan buka kembali tautan undangan melalui perangkat pertama yang Anda gunakan.';
  } else if (errorInfo.code === 'NOT_FOUND' || errorInfo.status === 404) {
    if (titleEl) titleEl.textContent = 'Undangan Tidak Ditemukan';
    if (msgEl) msgEl.textContent = errorInfo.message || 'Data tamu tidak ditemukan pada sistem.';
    if (subEl) subEl.textContent = 'Pastikan tautan undangan yang Anda buka sudah sesuai dan lengkap.';
  } else {
    if (titleEl) titleEl.textContent = 'Akses Dibatasi';
    if (msgEl) msgEl.textContent = errorInfo.message || 'Mohon maaf, undangan tidak dapat diakses saat ini.';
    if (subEl) subEl.textContent = 'Silakan hubungi mempelai atau coba beberapa saat lagi.';
  }

  if (fallbackScreen) {
    fallbackScreen.hidden = false;
  }
}

// ==========================================
// 2. LOAD DATA TAMU & VALIDASI (GET)
// ==========================================
async function loadGuestData() {
  if (!guestUid) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${EVENT_SLUG}/rsvp/${encodeURIComponent(guestUid)}?deviceId=${encodeURIComponent(currentDeviceId)}`, {
      method: 'GET',
      headers: {
        'x-device-id': currentDeviceId
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      currentGuest = data;
      
      // Bind guest name to greeting in UI
      if (data.name) {
        $$('.guest-name').forEach(el => el.textContent = data.name.slice(0, 100));
        if ($('#rsvp-name')) $('#rsvp-name').value = data.name.slice(0, 100);
        if ($('#wish-name')) $('#wish-name').value = data.name.slice(0, 100);
      }

      // Prefill RSVP if guest.rsvpStatus !== "pending"
      if (data.rsvpStatus && data.rsvpStatus !== 'pending') {
        const isAttending = data.rsvpStatus === 'attending';
        const radio = $(`input[name="attendance"][value="${isAttending ? 'yes' : 'no'}"]`, rsvpForm);
        if (radio) radio.checked = true;

        if (data.pax && $('#rsvp-guests')) {
          $('#rsvp-guests').value = String(Math.min(4, Math.max(1, data.pax)));
        }

        updateGuests();

        const statusEl = $('.form-status', rsvpForm);
        if (statusEl) {
          statusEl.textContent = isAttending
            ? `Status kehadiran: Hadir (${data.pax || 1} orang). Anda dapat memperbarui konfirmasi di bawah.`
            : `Status kehadiran: Tidak dapat hadir. Anda dapat memperbarui konfirmasi di bawah.`;
        }
      }

      if (data.rsvpMessage && $('#wish-message') && !$('#wish-message').value) {
        $('#wish-message').value = data.rsvpMessage;
      }
      return data;
    } else {
      let errData = {};
      try { errData = await res.json(); } catch(e) {}
      if (res.status === 403 || errData.code === 'DEVICE_LOCKED' || errData.locked) {
        showFallbackScreen({
          code: 'DEVICE_LOCKED',
          status: 403,
          message: errData.error || 'Undangan ini bersifat privat dan sudah dibuka di perangkat lain.'
        });
      } else if (res.status === 404) {
        showFallbackScreen({
          code: 'NOT_FOUND',
          status: 404,
          message: errData.error || 'Data tamu tidak ditemukan'
        });
      } else {
        showFallbackScreen({
          code: 'ERROR',
          status: res.status,
          message: errData.error || 'Terjadi kesalahan saat memuat data undangan.'
        });
      }
      return null;
    }
  } catch (err) {
    console.error('Failed to load guest data:', err);
    showFallbackScreen({
      code: 'NETWORK_ERROR',
      status: 0,
      message: 'Koneksi ke server gagal. Pastikan perangkat Anda terhubung ke internet.'
    });
    return null;
  }
}

// Initial guest check on startup
const searchParams = new URLSearchParams(window.location.search);
const isPreviewMode = searchParams.has('demo') || searchParams.has('preview') || (searchParams.has('to') && !guestUid);

if (!guestUid) {
  if (isPreviewMode) {
    const toParam = searchParams.get('to');
    if (toParam && toParam.trim()) {
      $$('.guest-name').forEach(el => el.textContent = toParam.trim().slice(0, 100));
      if ($('#rsvp-name')) $('#rsvp-name').value = toParam.trim().slice(0, 100);
      if ($('#wish-name')) $('#wish-name').value = toParam.trim().slice(0, 100);
    }
  } else {
    // Mode privat: if no UID in URL, show 404 fallback screen
    showFallbackScreen({
      code: 'NOT_FOUND',
      status: 404,
      message: 'Data tamu tidak ditemukan'
    });
  }
} else {
  loadGuestData();
}

// ==========================================
// OPENING ANIMATION SEQUENCE
// ==========================================
let openingBusy = false;
let openingTimers = [];
let lastPhotoButton = null;

function finishOpening() {
  opening.classList.add('dismissed');
  document.body.classList.remove('unopened');
  main.inert = false;
  menuToggle.hidden = false;
  closeMenu();
  $('.desktop-art').inert = false;
  $('#music-toggle').hidden = false;
  opening.setAttribute('aria-hidden', 'true');
  opening.inert = true;
  main.focus({ preventScroll: true });
  $$('.hero-bouquet-top, .hero-bouquet-bottom').forEach(el => el.classList.add('visible'));
  openingBusy = false;
}

function openInvitation(skip = false) {
  if (openingBusy && !skip) return;
  openingTimers.forEach(clearTimeout);
  openingTimers = [];
  openingBusy = true;
  $('#open-invitation').disabled = true;
  if (skip || reducedMotion.matches) { finishOpening(); return; }
  
  // Step 1: Open envelope, lift seal, slide letter with initials C & H out
  opening.classList.add('is-opening');
  
  // Step 2: Open curtains to green satin bg and reveal loading page (at 950ms)
  openingTimers.push(setTimeout(() => {
    opening.classList.add('opened');
  }, 950));
  
  // Step 3: Card begins gentle closing transition (at 2550ms)
  openingTimers.push(setTimeout(() => {
    opening.classList.add('card-closing');
  }, 2550));
  
  // Step 4: Reveal hero page (at 3050ms)
  openingTimers.push(setTimeout(finishOpening, 3050));
}

$('#open-invitation').addEventListener('click', () => openInvitation());
$('.envelope-seal')?.addEventListener('click', () => openInvitation());
$('.envelope-motion')?.addEventListener('click', () => openInvitation());
$('#skip-opening')?.addEventListener('click', () => openInvitation(true));
$('.skip-link').addEventListener('click', () => openInvitation(true));

opening.addEventListener('keydown', event => {
  if (event.key === 'Escape') openInvitation(true);
  if (event.key === 'Tab') {
    const targets = $$('button:not([disabled])', opening);
    if (!targets.length) return;
    if (event.shiftKey && document.activeElement === targets[0]) { event.preventDefault(); targets.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === targets.at(-1)) { event.preventDefault(); targets[0].focus(); }
  }
});

$('#replay').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  openingTimers.forEach(clearTimeout);
  openingBusy = false;
  keepsakeCollage?.classList.remove('in-view');
  opening.classList.remove('dismissed', 'opened', 'is-opening', 'card-closing');
  opening.inert = false;
  opening.removeAttribute('aria-hidden');
  main.inert = true;
  closeMenu();
  menuToggle.hidden = true;
  $('.desktop-art').inert = true;
  document.body.classList.add('unopened');
  $('#open-invitation').disabled = false;
  $('#open-invitation').focus();
});

// ==========================================
// SCROLL REVEALS & OBSERVERS
// ==========================================
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .08, rootMargin: '0px 0px -15px 0px' });
$$('.reveal, .reveal-scale, .reveal-left, .reveal-right, .hero-bouquet-top, .hero-bouquet-bottom, .couple-knot-ornament, .portrait-flower, .events-peony, .events-tulip, .story-peony, .closing-fan').forEach(el => revealObserver.observe(el));

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    const mapped = id === 'quote' ? 'home' : id === 'countdown' ? 'events' : id === 'closing' ? 'wishes' : id;
    $$('.section-menu a').forEach(a => {
      const active = a.getAttribute('href') === '#' + mapped;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
$$('main section, main footer').forEach(el => navObserver.observe(el));

if (keepsakeCollage) {
  const keepsakeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        keepsakeCollage.classList.add('in-view');
        keepsakeObserver.unobserve(keepsakeCollage);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -30px 0px' });
  keepsakeObserver.observe(keepsakeCollage);
}

// ==========================================
// COUNTDOWN TIMER
// ==========================================
const weddingTime = new Date('2028-03-08T10:00:00+07:00').getTime();
function updateCountdown() {
  const total = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
  const values = {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60
  };
  for (const [key, val] of Object.entries(values)) {
    const el = $('[data-count="' + key + '"]');
    if (el) el.textContent = String(val).padStart(2, '0');
  }
  if (total === 0) {
    const st = $('#countdown-status');
    if (st) st.textContent = 'Hari bahagia kami telah tiba. Terima kasih atas doa Anda.';
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ==========================================
// UI FEEDBACK (TOAST)
// ==========================================
let toastTimer;
function toast(text) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}

// ==========================================
// PHOTO DIALOG & GIFT
// ==========================================
const photoDialog = $('#photo-dialog');
$$('[data-photo]').forEach(button => button.addEventListener('click', () => {
  lastPhotoButton = button;
  $('#large-photo').src = button.dataset.photo;
  photoDialog.showModal();
}));
$('#close-photo').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', e => { if (e.target === photoDialog) photoDialog.close(); });
photoDialog.addEventListener('close', () => lastPhotoButton?.focus({ preventScroll: true }));

$('#show-gift').addEventListener('click', () => {
  const details = $('#gift-details');
  details.hidden = !details.hidden;
  $('#show-gift').setAttribute('aria-expanded', String(!details.hidden));
  $('#show-gift').innerHTML = details.hidden ? 'LIHAT WEDDING GIFT <span>＋</span>' : 'TUTUP WEDDING GIFT <span>−</span>';
});

$$('.copy-account').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.account);
    toast('Nomor rekening berhasil disalin.');
  } catch {
    toast('Silakan salin nomor yang tertera pada kartu.');
  }
}));

// LocalStorage helpers for offline fallback
function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
const RSVP_KEY = 'peranakan-bloom.rsvp.v1';
const WISHES_KEY = 'peranakan-bloom.wishes.v1';

function updateGuests() {
  const declined = $('input[name="attendance"]:checked', rsvpForm)?.value === 'no';
  const guestsSelect = $('#rsvp-guests');
  if (guestsSelect) {
    guestsSelect.disabled = declined;
    guestsSelect.closest('form')?.classList.toggle('declined', declined);
  }
}
$$('input[name="attendance"]', rsvpForm).forEach(input => input.addEventListener('change', updateGuests));
updateGuests();

$('#rsvp-name').addEventListener('input', () => $('#rsvp-name').setCustomValidity(''));

// ==========================================
// 3. SUBMIT FORM RSVP (POST)
// ==========================================
rsvpForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;
  const data = new FormData(rsvpForm);
  const name = String(data.get('name') || (currentGuest ? currentGuest.name : '')).trim();
  if (!name) {
    $('#rsvp-name').setCustomValidity('Mohon isi nama Anda.');
    $('#rsvp-name').reportValidity();
    return;
  }
  const attendance = data.get('attendance');
  const isAttending = attendance === 'yes';
  const pax = isAttending ? Math.max(1, Number(data.get('guests') || 1)) : 0;
  const wishMessage = $('#wish-message') ? $('#wish-message').value.trim() : (currentGuest?.rsvpMessage || '');
  const status = $('.form-status', rsvpForm);
  const submitButton = $('button[type="submit"]', rsvpForm);
  const originalBtnText = submitButton ? submitButton.innerHTML : 'KONFIRMASI KEHADIRAN';

  // Visual feedback: loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = 'MENGIRIM KONFIRMASI…';
  }
  status.textContent = 'Mengirim konfirmasi kehadiran…';
  status.classList.remove('error');

  const payload = {
    uid: guestUid || (currentGuest ? currentGuest.uid : 'guest'),
    name: name,
    deviceId: currentDeviceId,
    rsvpStatus: isAttending ? 'attending' : 'not_attending',
    pax: pax,
    rsvp_message: wishMessage
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${EVENT_SLUG}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': currentDeviceId
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      if (currentGuest) {
        currentGuest.rsvpStatus = payload.rsvpStatus;
        currentGuest.pax = payload.pax;
        currentGuest.name = payload.name;
      }
      status.textContent = isAttending
        ? `Terima kasih, ${name}! Konfirmasi kehadiran Anda (${pax} orang) berhasil dikirim.`
        : `Terima kasih, ${name}. Konfirmasi Anda telah tersimpan.`;
      status.classList.remove('error');
      toast('Konfirmasi kehadiran berhasil dikirim.');
      // Refresh wishes list
      fetchWishes();
    } else {
      let errData = {};
      try { errData = await res.json(); } catch(e) {}
      if (res.status === 403 || errData.code === 'DEVICE_LOCKED' || errData.locked) {
        status.textContent = errData.error || 'Akses ditolak: perangkat Anda terkunci.';
        status.classList.add('error');
        showFallbackScreen({ code: 'DEVICE_LOCKED', message: errData.error });
      } else {
        status.textContent = errData.error || 'Gagal mengirim konfirmasi. Silakan coba beberapa saat lagi.';
        status.classList.add('error');
      }
    }
  } catch (err) {
    console.error('RSVP submission error:', err);
    writeStore(RSVP_KEY, { name, attendance, guests: pax, updatedAt: new Date().toISOString() });
    status.textContent = 'Koneksi gagal. Konfirmasi tersimpan sementara di browser Anda.';
    status.classList.remove('error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalBtnText;
    }
  }
});

// ==========================================
// 4. DAFTAR WISHES & PRAYERS (GET) & SUBMIT
// ==========================================
function getLocalWishes() {
  const records = readStore(WISHES_KEY, []);
  return Array.isArray(records) ? records.filter(x => typeof x?.name === 'string' && typeof (x?.rsvp_message || x?.message) === 'string').slice(0, 50) : [];
}

function renderWishesList(wishes) {
  const container = $('#guestbook-list');
  if (!container) return;
  container.replaceChildren();

  const valid = Array.isArray(wishes) ? wishes.filter(w => {
    const msg = w.rsvp_message || w.rsvpMessage || w.message;
    return typeof w.name === 'string' && typeof msg === 'string' && msg.trim().length > 0;
  }) : [];

  if (!valid.length) {
    const p = document.createElement('p');
    p.className = 'empty-wishes';
    p.textContent = 'Jadilah yang pertama menitipkan doa untuk kami.';
    container.append(p);
    return;
  }

  for (const wish of valid) {
    const article = document.createElement('article');
    article.className = 'wish';
    const message = document.createElement('p');
    const msgText = wish.rsvp_message || wish.rsvpMessage || wish.message;
    message.textContent = '“' + msgText.trim() + '”';
    const foot = document.createElement('footer');
    const name = document.createElement('span');
    name.textContent = wish.name;
    const time = document.createElement('time');
    const date = wish.createdAt ? new Date(wish.createdAt) : null;
    time.textContent = (date && !Number.isNaN(date.getTime()))
      ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    foot.append(name, time);
    article.append(message, foot);
    container.append(article);
  }
}

async function fetchWishes() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${EVENT_SLUG}/wishes`, {
      method: 'GET'
    });
    if (res.ok) {
      const wishes = await res.json();
      if (Array.isArray(wishes)) {
        renderWishesList(wishes);
        return wishes;
      }
    }
  } catch (err) {
    console.error('Failed to fetch wishes from API:', err);
  }
  // Local fallback
  renderWishesList(getLocalWishes());
}

fetchWishes();

wishesForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!wishesForm.reportValidity()) return;
  const data = new FormData(wishesForm);
  const name = String(data.get('name') || (currentGuest ? currentGuest.name : '')).trim();
  const message = String(data.get('message') || '').trim();
  const status = $('.form-status', wishesForm);
  const submitButton = $('button[type="submit"]', wishesForm);
  const originalBtnText = submitButton ? submitButton.innerHTML : 'KIRIM UCAPAN <span>♡</span>';

  if (!name || message.length < 3) {
    status.textContent = 'Mohon lengkapi nama dan ucapan Anda (minimal 3 karakter).';
    status.classList.add('error');
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = 'MENGIRIM UCAPAN…';
  }
  status.textContent = 'Mengirim ucapan & doa…';
  status.classList.remove('error');

  const payload = {
    uid: guestUid || (currentGuest ? currentGuest.uid : 'guest'),
    name: name,
    deviceId: currentDeviceId,
    rsvpStatus: (currentGuest && currentGuest.rsvpStatus && currentGuest.rsvpStatus !== 'pending')
      ? currentGuest.rsvpStatus
      : 'attending',
    pax: (currentGuest && currentGuest.pax) ? currentGuest.pax : 1,
    rsvp_message: message
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${EVENT_SLUG}/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': currentDeviceId
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      status.textContent = 'Terima kasih! Ucapan & doa Anda telah tersimpan.';
      status.classList.remove('error');
      $('#wish-message').value = '';
      toast('Ucapan berhasil dikirim.');
      // Refresh wishes list
      fetchWishes();
    } else {
      let errData = {};
      try { errData = await res.json(); } catch(e) {}
      if (res.status === 403 || errData.code === 'DEVICE_LOCKED' || errData.locked) {
        status.textContent = errData.error || 'Akses ditolak: perangkat Anda terkunci.';
        status.classList.add('error');
        showFallbackScreen({ code: 'DEVICE_LOCKED', message: errData.error });
      } else {
        status.textContent = errData.error || 'Gagal mengirim ucapan. Silakan coba lagi.';
        status.classList.add('error');
      }
    }
  } catch (err) {
    console.error('Wishes submission error:', err);
    const records = getLocalWishes();
    records.unshift({ name, rsvp_message: message, createdAt: new Date().toISOString() });
    writeStore(WISHES_KEY, records.slice(0, 50));
    renderWishesList(records);
    $('#wish-message').value = '';
    status.textContent = 'Koneksi gagal. Ucapan tersimpan di penyimpanan browser Anda.';
    status.classList.remove('error');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalBtnText;
    }
  }
});

// ==========================================
// BACKGROUND MUSIC BOX (AudioContext)
// ==========================================
let audioContext, musicTimer, musicOn = false, noteIndex = 0;
const phrase = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5, 880, 783.99, 659.25, 587.33];

function playTone() {
  if (!musicOn || !audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.value = phrase[noteIndex++ % phrase.length];
  const now = audioContext.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(.045, now + .025);
  gain.gain.exponentialRampToValueAtTime(.0001, now + 1.7);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + 1.8);
}

$('#music-toggle').addEventListener('click', async () => {
  const button = $('#music-toggle');
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    musicOn = !musicOn;
    if (musicOn) {
      await audioContext.resume();
      playTone();
      musicTimer = setInterval(playTone, 750);
    } else {
      clearInterval(musicTimer);
      await audioContext.suspend();
    }
    button.setAttribute('aria-pressed', String(musicOn));
    button.setAttribute('aria-label', musicOn ? 'Jeda musik' : 'Putar musik');
  } catch {
    musicOn = false;
    toast('Musik tidak tersedia di browser ini.');
  }
});
