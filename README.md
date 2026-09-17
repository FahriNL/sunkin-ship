# Laut Darah - Naval Odyssey

**Laut Darah - Naval Odyssey** adalah game aksi-petualangan maritim 2D top-down berbasis web canvas berkecepatan tinggi dengan estetika visual vektor tanpa emoji (100% SVG & canvas vector).

## Fitur Utama
- **Eksplorasi Dunia Laut Prosedural**: Kepulauan organik berlekuk alami (*bezier spline coastlines*), suaka pulau asal (Nusa Damai), dan perairan berbahaya klan bajak laut & monster palung.
- **Sistem Siluman Taktis 3 Fase**:
  1. *Unaware*: Pandangan kerucut segitiga di haluan kapal yang terhalang kontur pulau.
  2. *Alerted*: Lingkaran bahaya besar penuh (*Full Circle*) untuk pemain kabur dan bersembunyi di balik pulau.
  3. *Searching*: Lingkaran pencari kecil dengan sapuan radar menyisir posisi terakhir.
- **Efek Visual Laut Imersif**:
  - Simulasi apung hidrodinamika (*buoyant heave & roll*) dan cincin desakan air halus saat kapal diam.
  - Efek terjangan (*charge*) klan Iron: cerobong uap abu-abu, taji berpijar membara, dan semburan busa haluan ganas.
  - Burung camar laut (*seagulls*) melayang dan mengepakkan sayap dengan bayangan realistis di atas permukaan air.
  - Bangkai kapal karam mendetail dengan tulang rusuk kayu terbuka dan pendaran harta karun bawah air.
- **Pengalaman Audio Spasial Web Audio API**:
  - Berkas audio MP3 asli untuk tembakan meriam (*cannon fire*) dan hantaman peluru (*ship hit*).
  - Atenuasi jarak spasial (*positional falloff*) dan pembatas suara bertumpuk (*anti-overlapping*).
  - Deburan ombak laut terus-menerus (*sea ambience*).
  - Suara burung camar saat melintas dan sahutan camar di kejauhan.
  - Musik pertempuran dinamis (*battle song*) dengan transisi *fade-in* dan *fade-out* halus.

## Kontrol Permainan (PC & Mobile)
- **Kemudi Layar**: `W` / `Panah Atas` (Maju), `A` / `Panah Kiri` (Putar Kiri), `D` / `Panah Kanan` (Putar Kanan).
- **Tembak Meriam Sisi**: `Spasi` / `J` / `Klik Kiri`.
- **Pertahanan Buritan / Ranjau**: `E` / `K` / `Klik Kanan`.
- **Buka Galangan Kapal / Peta / Koordinat**: `F`, `M`, `C`.
- **Kemudi Sentuh (Mobile/Tablet)**: Virtual joystick & tombol aksi di layar.

## Cara Menjalankan
1. Pasang dependensi pengembang:
   ```bash
   npm install
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
   Buka di peramban pada `http://localhost:5173/`.
