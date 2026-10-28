'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const opening = $('#opening');
const main = $('#main');
const navigation = $('#section-menu');
const menuToggle = $('#menu-toggle');
function closeMenu(returnFocus = false) { navigation.hidden = true; navigation.inert = true; menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Buka menu undangan'); if (returnFocus) menuToggle.focus(); }
menuToggle.addEventListener('click', () => { const open = navigation.hidden; navigation.hidden = !open; navigation.inert = !open; menuToggle.setAttribute('aria-expanded',String(open)); menuToggle.setAttribute('aria-label',open ? 'Tutup menu undangan' : 'Buka menu undangan'); });
navigation.addEventListener('click',e=>{ if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!navigation.hidden) closeMenu(true); });
document.addEventListener('click',e=>{ if(!navigation.hidden&&!navigation.contains(e.target)&&!menuToggle.contains(e.target)) closeMenu(); });
const keepsakeCollage = $('#keepsake-collage');
let openingBusy = false;
let openingTimers = [];
let lastPhotoButton = null;
const guest = new URLSearchParams(location.search).get('to');
if (guest && guest.trim()) $('.guest-name').textContent = guest.trim().slice(0, 100);

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
  
  // Step 2: Open curtains to green satin bg and reveal the Wedding Invitation Card
  openingTimers.push(setTimeout(() => {
    opening.classList.add('opened');
  }, 2400));
  
  // Step 3: Card begins gentle closing transition
  openingTimers.push(setTimeout(() => {
    opening.classList.add('card-closing');
  }, 5100));
  
  // Step 4: Reveal hero page
  openingTimers.push(setTimeout(finishOpening, 5700));
}
$('#open-invitation').addEventListener('click', () => openInvitation());
$('.envelope-seal')?.addEventListener('click', () => openInvitation());
$('.envelope-motion')?.addEventListener('click', () => openInvitation());
$('#skip-opening').addEventListener('click', () => openInvitation(true));
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
  main.inert = true; closeMenu(); menuToggle.hidden = true; $('.desktop-art').inert = true;
  document.body.classList.add('unopened');
  $('#open-invitation').disabled = false;
  $('#open-invitation').focus();
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: .08, rootMargin: '0px 0px -15px 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));
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

const weddingTime = new Date('2028-03-08T10:00:00+07:00').getTime();
function updateCountdown() {
  const total = Math.max(0, Math.floor((weddingTime - Date.now()) / 1000));
  const values = { days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
  for (const [key, val] of Object.entries(values)) $('[data-count="' + key + '"]').textContent = String(val).padStart(2, '0');
  if (total === 0) $('#countdown-status').textContent = 'Hari bahagia kami telah tiba. Terima kasih atas doa Anda.';
}
updateCountdown(); setInterval(updateCountdown, 1000);

let toastTimer;
function toast(text) {
  const el = $('#toast'); el.textContent = text; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}
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
  const details = $('#gift-details'); details.hidden = !details.hidden;
  $('#show-gift').setAttribute('aria-expanded', String(!details.hidden));
  $('#show-gift').innerHTML = details.hidden ? 'LIHAT WEDDING GIFT <span>＋</span>' : 'TUTUP WEDDING GIFT <span>−</span>';
});
$$('.copy-account').forEach(button => button.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(button.dataset.account); toast('Nomor rekening contoh tersalin.'); }
  catch { toast('Silakan salin nomor yang tertera pada kartu.'); }
}));

function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function writeStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
const RSVP_KEY = 'peranakan-bloom.rsvp.v1';
const WISHES_KEY = 'peranakan-bloom.wishes.v1';
const rsvpForm = $('#rsvp-form');
const savedRsvp = readStore(RSVP_KEY, null);
if (savedRsvp && typeof savedRsvp.name === 'string') {
  $('#rsvp-name').value = savedRsvp.name;
  const radio = $('input[value="' + (savedRsvp.attendance === 'no' ? 'no' : 'yes') + '"]', rsvpForm);
  radio.checked = true;
  $('#rsvp-guests').value = String(Math.min(4, Math.max(1, savedRsvp.guests || 1)));
  $('.form-status', rsvpForm).textContent = 'Konfirmasi pratinjau Anda sudah tersimpan di browser ini.';
} else if (guest) $('#rsvp-name').value = guest.slice(0,100);
function updateGuests() {
  const declined = $('input[name="attendance"]:checked', rsvpForm)?.value === 'no';
  $('#rsvp-guests').disabled = declined;
  $('#rsvp-guests').closest('form').classList.toggle('declined', declined);
}
$$('input[name="attendance"]', rsvpForm).forEach(input => input.addEventListener('change', updateGuests)); updateGuests();
rsvpForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!rsvpForm.reportValidity()) return;
  const data = new FormData(rsvpForm);
  const name = String(data.get('name')).trim();
  if (!name) { $('#rsvp-name').setCustomValidity('Mohon isi nama Anda.'); $('#rsvp-name').reportValidity(); return; }
  const attendance = data.get('attendance');
  const record = { name, attendance, guests: attendance === 'no' ? 0 : Number(data.get('guests')), updatedAt: new Date().toISOString() };
  const status = $('.form-status', rsvpForm);
  const saved = writeStore(RSVP_KEY, record);
  status.textContent = saved ? (attendance === 'yes' ? 'Terima kasih, ' + name + '! Konfirmasi hadir tersimpan untuk pratinjau ini.' : 'Terima kasih, ' + name + '. Konfirmasi Anda tersimpan untuk pratinjau ini.') : 'Penyimpanan browser tidak tersedia. Konfirmasi belum tersimpan.';
  status.classList.toggle('error', !saved);
});
$('#rsvp-name').addEventListener('input', () => $('#rsvp-name').setCustomValidity(''));

function getWishes() { const records = readStore(WISHES_KEY, []); return Array.isArray(records) ? records.filter(x => typeof x?.name === 'string' && typeof x?.message === 'string').slice(0,50) : []; }
function renderWishes() {
  const container = $('#guestbook-list'); const wishes = getWishes(); container.replaceChildren();
  if (!wishes.length) { const p = document.createElement('p'); p.className = 'empty-wishes'; p.textContent = 'Jadilah yang pertama menitipkan doa untuk kami.'; container.append(p); return; }
  for (const wish of wishes) {
    const article = document.createElement('article'); article.className = 'wish';
    const message = document.createElement('p'); message.textContent = '“' + wish.message + '”';
    const foot = document.createElement('footer');
    const name = document.createElement('span'); name.textContent = wish.name;
    const time = document.createElement('time'); const date = new Date(wish.createdAt);
    time.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
    foot.append(name, time); article.append(message, foot); container.append(article);
  }
}
renderWishes();
$('#wishes-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
  const data = new FormData(form); const name = String(data.get('name')).trim(); const message = String(data.get('message')).trim();
  const status = $('.form-status', form);
  if (!name || message.length < 3) { status.textContent = 'Mohon lengkapi nama dan ucapan Anda.'; status.classList.add('error'); return; }
  const records = getWishes(); records.unshift({ name, message, createdAt: new Date().toISOString() });
  const saved = writeStore(WISHES_KEY, records.slice(0,50));
  status.classList.toggle('error', !saved);
  if (!saved) { status.textContent = 'Browser belum dapat menyimpan ucapan Anda.'; return; }
  renderWishes(); $('#wish-message').value = ''; status.textContent = 'Terima kasih! Ucapan Anda tersimpan di pratinjau ini.';
});

function loadImage(src) { return new Promise((resolve,reject) => { const img = new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('Gambar tidak dapat dimuat')); img.src=src; }); }
$('#save-keepsake').addEventListener('click', async () => {
  const button = $('#save-keepsake'); const original = button.innerHTML; button.disabled = true; button.textContent = 'MENYIAPKAN KENANGAN…';
  try {
    const files = ['01-background-satin','18-keepsake-frame-jade','13-keepsake-date-card','05-bouquet-stems','19-fan-vermilion','15-keepsake-pearls'];
    const loaded = await Promise.all(files.map(f => loadImage('assets/' + f + '.webp')));
    await Promise.all([document.fonts.load('700 104px Tangerine'), document.fonts.load('28px "Viaoda Libre"')]);
    await document.fonts.ready;
    const canvas = document.createElement('canvas'); canvas.width=1080; canvas.height=1920; const ctx=canvas.getContext('2d');
    ctx.fillStyle='#153f35';ctx.fillRect(0,0,1080,1920);ctx.globalAlpha=.15;ctx.drawImage(loaded[0],0,0,1080,1920);ctx.globalAlpha=1;
    ctx.strokeStyle='#c8b38a';ctx.lineWidth=2;ctx.strokeRect(38,38,1004,1844);ctx.textAlign='center';ctx.fillStyle='#f7f0e3';
    ctx.font='20px Arial';ctx.fillText('A LITTLE PIECE OF OUR FOREVER',540,160);ctx.font='105px "Tangerine"';ctx.fillText('Our keepsake',540,290);
    ctx.drawImage(loaded[5],310,230,480,380);
    ctx.fillStyle='#f2ead8';ctx.beginPath();ctx.ellipse(440,730,185,300,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(loaded[1],110,270,660,940);
    ctx.drawImage(loaded[2],620,620,350,510);
    ctx.fillStyle='#235540';ctx.font='104px "Tangerine"';ctx.fillText('Cintya',435,650);ctx.font='75px "Tangerine"';ctx.fillText('&',435,765);ctx.font='104px "Tangerine"';ctx.fillText('Hans',435,895);
    ctx.fillStyle='#55445f';ctx.font='64px "Tangerine"';ctx.fillText('08',795,780);ctx.fillText('Maret',795,870);ctx.fillText('2028',795,960);
    ctx.drawImage(loaded[4],10,1150,700,470);ctx.drawImage(loaded[3],610,1130,410,610);
    ctx.fillStyle='#f7f0e3';ctx.font='28px "Viaoda Libre"';ctx.fillText('8 Maret 2028 · Bandung',540,1770);ctx.font='17px Arial';ctx.fillText('PERANAKAN BLOOM',540,1830);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if (!blob) throw new Error('Export gagal');
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Cintya-Hans-Keepsake.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Keepsake siap disimpan sebagai PNG.');
  } catch { toast('Keepsake belum dapat diunduh. Silakan coba kembali.'); }
  finally { button.disabled=false;button.innerHTML=original; }
});

/* A quiet, original music-box phrase. Started only by the music button. */
let audioContext, musicTimer, musicOn=false, noteIndex=0;
const phrase=[523.25,659.25,783.99,659.25,587.33,698.46,880,698.46,523.25,659.25,783.99,1046.5,880,783.99,659.25,587.33];
function playTone() {
  if (!musicOn || !audioContext) return;
  const osc=audioContext.createOscillator();const gain=audioContext.createGain();osc.type='sine';osc.frequency.value=phrase[noteIndex++%phrase.length];
  const now=audioContext.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.045,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+1.7);
  osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+1.8);
}
$('#music-toggle').addEventListener('click', async () => {
  const button=$('#music-toggle');
  try {
    if (!audioContext) audioContext=new (window.AudioContext||window.webkitAudioContext)();
    musicOn=!musicOn;
    if (musicOn) { await audioContext.resume();playTone();musicTimer=setInterval(playTone,750); }
    else { clearInterval(musicTimer);await audioContext.suspend(); }
    button.setAttribute('aria-pressed',String(musicOn));button.setAttribute('aria-label',musicOn?'Jeda musik':'Putar musik');
  } catch { musicOn=false;toast('Musik tidak tersedia di browser ini.'); }
});

