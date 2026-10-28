# Cintya & Hans — Peranakan Bloom

Frontend undangan pernikahan, dibuat untuk pratinjau lokal. Tidak memakai backend, database, atau layanan pengiriman.

## Jalankan
Dari folder ini:
python -m http.server 4173 --bind 127.0.0.1
Buka http://127.0.0.1:4173/

Nama tamu: tambahkan ?to=Nama%20Tamu pada alamat.

## Isi
Cover amplop beranimasi; opening quote; mempelai; keepsake kolase dengan ekspor PNG; detail pemberkatan dan resepsi; countdown; tautan Google Calendar; love story; galeri lightbox; wedding gift; demo RSVP; ucapan dan doa; dress code; Google Maps; penutup.
Request lagu sengaja tidak dimasukkan sesuai permintaan terakhir.

## Data contoh
Cintya Aurelia Tan dan Hans Alexander Lim beserta nama keluarga adalah dummy.
Tanggal dan lokasi mengikuti website referensi https://wedding-velvet.vercel.app/:
8 Maret 2028, Cathedral of St. Peter pukul 10.00–11.30 WIB, The Majestic Ballroom pukul 18.30–22.00 WIB, Bandung.
Foto merupakan foto contoh dari website referensi. Rekening gift adalah nomor contoh dan bukan rekening penerima yang telah diverifikasi.
Love story merupakan adaptasi cerita demo website referensi.

## Interaksi frontend
RSVP dan ucapan hanya tersimpan di localStorage browser yang digunakan. Tidak dikirim ke mempelai dan tidak tersinkron antar perangkat. Pesan ini juga dijelaskan pada formulir.
Tautan Google Maps membuka lokasi; Google Calendar membuka formulir acara untuk disimpan sendiri oleh pengunjung.
Keepsake diunduh sebagai PNG 1080×1920. Galeri membuka foto dalam dialog yang dapat ditutup dengan Escape.
Musik pendek berupa komposisi music-box sintetis asli, hanya diputar setelah tombol musik ditekan.
Navigasi keyboard, fokus dialog, pilihan reduced-motion, dan replay amplop disediakan.

## Tipografi
Pinyon Script: nama dan judul tulisan tangan.
Cormorant Garamond: isi undangan, detail, dan tanggal.
Arial: label kecil, tombol, navigasi.
Font web disimpan lokal dan lisensi OFL ada di assets/fonts.

## File
index.html — konten dan struktur.
styles.css — desain responsif dan animasi per layer.
app.js — interaksi frontend.
assets/ — aset WebP transparan, satin, foto contoh, font.
assets-info.json — ukuran dan pemeriksaan alpha.
MOTION-MANIFEST.json — kedalaman, anchor, dan gerakan aset.
ASSET-PROVENANCE.md dan GENERATION-PROMPTS.json — sumber dan prompt aset.

Gambar master PNG berada di folder saudara ../peranakan-bloom/assets/.

