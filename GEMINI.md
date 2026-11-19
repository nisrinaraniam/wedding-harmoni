# Panduan Konfigurasi & Standar Katalog (Wedding Harmoni)

Dokumen ini adalah standar acuan otomatis untuk pengembangan dan konfigurasi tema undangan digital pernikahan dari repositori template ini.

---

## 1. Arsitektur & Mode Operasional

1. **Mode Katalog / Demo (Default)**:
   - Berfungsi sebagai showcase katalog publik.
   - **TETAP GUNAKAN DATA DUMMY** (nama ilustrasi katalog, venue contoh, rekening dummy `0000000000`).
   - Tidak memerlukan koneksi Google Sheet saat berjalan sebagai demo.
2. **Mode Klien (Saat Dikloning untuk Undangan Klien Baru)**:
   - Hubungkan ke Google Apps Script Spreadsheet via endpoint `.../exec`.
   - Gunakan format link personal: `https://[domain]/?to=[Nama+Tamu]&uid=[KodeUID]`.

---

## 2. Protokol Link Tamu & Auto-Fill

- **Format URL Tamu Personal**:
  `https://[domain]/?to=[Nama+Tamu]&uid=[KodeUID]`
- **Cover Pembuka**:
  - Otomatis menampilkan `Kepada Yth. [Nama Tamu]` dari parameter `?to=...`.
- **Form RSVP & Ucapan**:
  - Kolom nama lengkap otomatis terisi (*auto-fill*) dengan nama tamu.
  - **Aturan Edit Nama**: Jika tamu mengedit namanya di form:
    - Simpan nama baru ke kolom **Nama Ucapan (Kolom C)** di Google Sheet.
    - **TIDAK membuat baris baru**; baris tamu tersebut diperbarui (*update in-place*), menjaga kolom 'Nama Tamu' asli tetap utuh untuk link dan cover.

---

## 3. Komponen Live Wishes & Blessings

- Tampilkan ucapan doa & kehadiran dari para tamu.
- **Sinkronisasi Penghapusan**: Jika kolom 'Ucapan & Doa' dihapus di Google Sheet, ucapan tersebut otomatis hilang dari website saat dimuat ulang.

---

## 4. Skema Kolom Google Sheet (10 Kolom)

1. `UID` (Random unique code)
2. `Nama Tamu` (Nama resmi untuk link dan cover)
3. `Nama Ucapan` (Nama custom jika diubah saat menulis ucapan)
4. `Kategori / Asal`
5. `Nomor WhatsApp`
6. `Link Undangan`
7. `Status Kehadiran`
8. `Pax (Jumlah Tamu)`
9. `Ucapan & Doa`
10. `Waktu Konfirmasi`
