-- Seed DashboardMon: 20 usulan on-going dari Excel "List On Going Kelembagaana.xlsx"
-- (sheet "Progress September" + sheet "Kelengkapan Mei"). Jalankan sekali setelah
-- schema.sql (instalasi baru) atau migrasi-sop.sql (database lama).
--
-- Catatan pemetaan (best-effort, mudah dikoreksi lewat UI):
-- - langkah_saat_ini ditafsirkan dari teks kolom PROGRESS;
-- - unor_kode memakai unit eselon I terdekat (item lintas unit memakai SETJEN);
-- - tanggal_usulan_awal disamakan 2026-04-01 (daftar sudah ada sejak sheet April);
-- - tanggal catatan = konversi serial kolom "update" Excel;
-- - sheet bulanan lama (April/Mei/Agustus) tetap menjadi arsip sumber, tidak
--   direkonstruksi penuh di sini.

insert into public.usulan (kode, judul, unor_kode, unit_terdampak, jenis_perubahan, sop_kode, langkah_saat_ini, prioritas, posisi_bola, putaran, tanggal_masuk_tahap, tanggal_usulan_awal, status, catatan_terakhir, deleted_at, deleted_by) values
  ('PIPU-2026-001', 'Pembentukan Balai Pengelola DPJT (Calon BLU)', 'PIPU', array['Direktorat Pengembangan Sistem dan Strategi Penyelenggaraan Pembiayaan']::text[], 'pembentukan', 'upt', 25, 'I', 'BIRO_HUKUM', 1, '2026-09-22', '2026-04-01', 'selesai', 'Permen PU No. 17 Tahun 2026 telah terbit; pencetakan buku Permen.', null, null),
  ('PS-2026-002', 'Pembentukan Balai Pelaksana Ditjen PS', 'PS', array['Sekretariat Direktorat Jenderal']::text[], 'pembentukan', 'upt', 25, null, 'BIRO_HUKUM', 1, '2026-09-22', '2026-04-01', 'selesai', 'Permen PU No. 17 Tahun 2026 telah terbit; pencetakan buku Permen.', null, null),
  ('SETJEN-2026-003', 'Penguatan Tusi UPT terkait Pembinaan SKPD Dekon TP', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'upt', 3, null, 'BKO', 1, '2026-08-19', '2026-04-01', 'dibatalkan', 'Permen PU 15/PRT/M/2011 dicabut; usulan tidak dilanjutkan.', null, null),
  ('SDA-2026-004', 'Peningkatan Balai ke Balai Besar di Ditjen SDA', 'SDA', array['Sekretariat Direktorat Jenderal']::text[], 'perubahan_nomenklatur', 'upt', 9, null, 'PANRB', 3, '2026-10-12', '2026-04-01', 'aktif', 'Surat usulan ke-3 sudah disampaikan ke Menteri PANRB.', null, null),
  ('BM-2026-005', 'Peningkatan Balai ke Balai Besar di Ditjen BM', 'BM', array['Sekretariat Direktorat Jenderal']::text[], 'perubahan_nomenklatur', 'upt', 7, null, 'MENTERI', 3, '2026-09-22', '2026-04-01', 'aktif', 'Menunggu tanda tangan Menteri atas surat usulan ke-3 (BPJN Papua Selatan).', null, null),
  ('BPSDM-2026-006', 'Pembentukan Balai Sertifikasi BPSDM', 'BPSDM', array['Sekretariat Badan']::text[], 'pembentukan', 'upt', 9, null, 'PANRB', 1, '2026-09-22', '2026-04-01', 'aktif', 'Konsep Rapermen pembentukan UPT BPSDM telah diparaf; disampaikan ke Tim PANRB.', null, null),
  ('PS-2026-007', 'Pembentukan Direktorat Infrastruktur Dukungan Pendidikan Wilayah II di Ditjen PS', 'PS', array['Direktorat Infrastruktur Dukungan Pendidikan']::text[], 'pembentukan', 'otk', 7, 'II', 'PANRB', 1, '2026-08-19', '2026-04-01', 'dibatalkan', 'Usulan dibatalkan melalui surat dari Ditjen PS.', null, null),
  ('BM-2026-008', 'Pembentukan Direktorat Pembinaan Jalan Daerah di Ditjen BM', 'BM', array['Direktorat Sistem dan Strategi Penyelenggaraan Jalan dan Jembatan']::text[], 'perubahan_tugas_fungsi', 'otk', 7, null, 'PANRB', 1, '2026-08-19', '2026-04-01', 'ditunda', 'Usulan ditunda; penajaman tusi pembinaan jalan daerah oleh DJBM dan PFID.', null, null),
  ('SETJEN-2026-009', 'Penambahan Bidang di Pusaka', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'pembentukan', 'otk', 7, null, 'PANRB', 1, '2026-09-01', '2026-04-01', 'aktif', 'Pembahasan bersama Kementerian PANRB 28 Agustus 2026; usulan perlu disesuaikan.', null, null),
  ('SETJEN-2026-010', 'Pembentukan Pusat Penegakan Hukum', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'pembentukan', 'otk', 7, null, 'PANRB', 1, '2026-09-01', '2026-04-01', 'aktif', 'Pembahasan bersama Kementerian PANRB 28 Agustus 2026.', null, null),
  ('SETJEN-2026-011', 'Penataan Organisasi Biro Komunikasi Publik', 'SETJEN', array['Biro Komunikasi Publik']::text[], 'perubahan_tugas_fungsi', 'otk', 7, null, 'PANRB', 1, '2026-08-19', '2026-04-01', 'aktif', 'Secara prinsip dapat dilanjutkan; menunggu surat usulan dari Biro Komunikasi Publik.', null, null),
  ('ITJEN-2026-012', 'Penambahan Bagian pada Sekretariat Inspektorat Jenderal', 'ITJEN', array['Sekretariat Inspektorat Jenderal']::text[], 'perubahan_tugas_fungsi', 'otk', 4, null, 'BKO', 1, '2026-09-29', '2026-04-01', 'aktif', 'Tusi sudah disepakati; menunggu rancangan OTK dan Anev.', null, null),
  ('ITJEN-2026-013', 'Penguatan Tugas dan Fungsi Inspektorat IV', 'ITJEN', array['Inspektorat IV']::text[], 'perubahan_tugas_fungsi', 'otk', 1, null, 'UNOR', 2, '2026-09-29', '2026-04-01', 'aktif', 'Itjen diminta memperbarui usulan dan melengkapi Anev.', null, null),
  ('SETJEN-2026-014', 'Penataan Tusi TLRHP Biro Keuangan', 'SETJEN', array['Biro Keuangan']::text[], 'perubahan_tugas_fungsi', 'otk', 5, null, 'BKO', 1, '2026-09-22', '2026-04-01', 'aktif', 'Pembahasan internal selesai; perlu pembahasan bersama Tim PANRB.', null, null),
  ('BPSDM-2026-015', 'Penataan Tusi Pusat-Pusat di BPSDM', 'BPSDM', array['Pusat Pengelolaan Talenta', 'Pusat Pengembangan Kompetensi Manajemen']::text[], 'perubahan_tugas_fungsi', 'otk', 7, null, 'PANRB', 1, '2026-09-01', '2026-04-01', 'aktif', 'Pembahasan bersama Kementerian PANRB 28 Agustus 2026.', null, null),
  ('BK-2026-016', 'Penataan Kelembagaan UPT Ditjen Bina Konstruksi', 'BK', array['Sekretariat Direktorat Jenderal Bina Konstruksi']::text[], 'penggabungan', 'upt', 5, null, 'BKO', 1, '2026-09-01', '2026-04-01', 'aktif', 'Validasi tipologi internal selesai; melengkapi bukti dukung dan rapermen tipologi.', null, null),
  ('SDA-2026-017', 'Penataan LNS Sekretariat Dewan SDA Nasional', 'SDA', array['Direktorat Sistem dan Strategi Pengelolaan Sumber Daya Air']::text[], 'perubahan_tugas_fungsi', 'lns', 3, null, 'BKO', 1, '2026-09-29', '2026-04-01', 'aktif', 'Ada tusi dari permen eksisting yang belum ditindaklanjuti; PIC sudah dihubungi.', null, null),
  ('BM-2026-018', 'Penataan LNS BPJT', 'BM', array['Direktorat Jalan Bebas Hambatan']::text[], 'perubahan_nomenklatur', 'lns', 5, null, 'BKO', 1, '2026-09-22', '2026-04-01', 'aktif', 'Konsep Rapermen LNS BPJT telah diparaf; disampaikan ke Tim PANRB.', null, null),
  ('SETJEN-2026-019', 'Indeks Kapabilitas Kelembagaan (IPKK) Kementerian PU', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'non_sop', 0, 'III', 'BKO', 1, '2026-08-19', '2026-04-01', 'aktif', 'Hasil sementara IPKK 3,58 (level 4); disiapkan sanggah bersama unor dan MenPANRB.', null, null),
  ('SETJEN-2026-020', 'Penataan OPD Banten, Sukabumi, Luwu, Luwu Utara', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'opd', 13, null, 'PEMDA', 1, '2026-08-19', '2026-04-01', 'aktif', 'Rapat pembahasan bersama Ditjen OTDA Kemendagri; monitoring usulan.', null, null);

-- Kode usulan baru dari aplikasi melanjutkan nomor urut setelah seed.
select setval('public.usulan_seq', 20);

-- Catatan progres: isi kolom PROGRESS + TINDAK LANJUT sheet "Progress September";
-- tanggal = konversi serial Excel kolom "update".
insert into public.catatan_progres (usulan_kode, tanggal, progres, tindak_lanjut, oleh_siapa) values
  ('PIPU-2026-001', '2026-09-22', 'Telah terbit Permen PU No. 17 Tahun 2026 tentang Perubahan Permen PU No. 1 Tahun 2025 tentang OTK UPT di KemenPU.', 'Pencetakan buku Permen: dalam proses pencetakan.', 'Pelaksana Biro KOTL'),
  ('PS-2026-002', '2026-09-22', 'Telah terbit Permen PU No. 17 Tahun 2026 tentang Perubahan Permen PU No. 1 Tahun 2025 tentang OTK UPT di KemenPU.', 'Pencetakan buku Permen: dalam proses pencetakan.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-003', '2026-08-19', 'Arahan Pimpinan: dilakukan pencabutan Peraturan Menteri Pekerjaan Umum Nomor 15/PRT/M/2011, sehingga penguatan tugas dan fungsi UPT terkait pembinaan SKPD Dekon TP menjadi tidak dibutuhkan.', 'Usulan penguatan Tugas dan Fungsi UPT terkait Dekon TP tidak dilanjutkan.', 'Pelaksana Biro KOTL'),
  ('SDA-2026-004', '2026-10-12', 'Surat usulan ke-3 sudah disampaikan ke Menpan RB.', 'UPT sektoral: sudah mengontak PIC terkait pemenuhan bukti dukung pada BWS Papua Merauke yang belum dilengkapi, ybs masih meminta waktu untuk pemenuhan bukti dukung. UPT regional: masih dilakukan pembahasan bersama biro-biro.', 'Pelaksana Biro KOTL'),
  ('BM-2026-005', '2026-09-22', 'Masih menunggu tanda tangan pak menteri atas surat menteri usulan ke-3 terkait BPJN Papua Selatan.', '1. Menunggu arahan Balai Regional dari Pimpinan. 2. Pembahasan internal atas hasil perhitungan tipologi dan bukti dukung. 3. Menunggu kelengkapan bukti dukung BPJN.', 'Pelaksana Biro KOTL'),
  ('BPSDM-2026-006', '2026-09-22', 'Telah diparaf konsep Rapermen pembentukan UPT BPSDM.', 'Menyampaikan konsep Rapermen pembentukan UPT BPSDM kepada Tim PANRB.', 'Pelaksana Biro KOTL'),
  ('PS-2026-007', '2026-08-19', 'Usulan dibatalkan melalui surat dari Ditjen PS.', 'Ditunda setelah adanya evaluasi kelembagaan di Ditjen PS secara menyeluruh, minimal 2 tahun setelah berjalannya UPT di Ditjen PS.', 'Pelaksana Biro KOTL'),
  ('BM-2026-008', '2026-08-19', 'Usulan pembentukan Direktorat Jalan Daerah telah dibahas bersama Kementerian PANRB dan usulan terbaru diubah menjadi penegasan tugas dan fungsi pembinaan jalan daerah. Atas usulan terbaru telah dilakukan pembahasan bersama PFID atas potensi tumpang tindih tusi pembinaan jalan daerah.', '1. Usulan ditunda; DJBM dapat melakukan identifikasi dan penajaman kembali rumusan tusi pembinaan jalan daerah pada seluruh unit kerja. 2. PFID melakukan identifikasi dan penajaman kembali rumusan tusi, khususnya pengelolaan data jalan daerah dan pembiayaan transfer ke daerah. 3. Monitoring atas tindak lanjut angka 1 dan 2.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-009', '2026-09-01', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada 28 Agustus 2026.', 'Perlu pembahasan internal mengenai usulan yang telah disampaikan; usulan belum sesuai arahan Kementerian PANRB dan Perpres 140 Tahun 2024 yang membatasi jumlah bidang pada Pusat sebanyak 3 bidang.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-010', '2026-09-01', 'Telah dilakukan pembahasan pada 28 Agustus 2026 bersama Kementerian PANRB.', 'Akan dilaksanakan rapat oleh tim Evaluasi Kelembagaan bersama Kementerian PANRB.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-011', '2026-08-19', 'Pembahasan bersama Kementerian PANRB 15 Juni 2026: secara prinsip dapat dilanjutkan dengan penyempurnaan usulan. Nota Dinas permohonan kelengkapan usulan dan bukti dukung telah disampaikan kepada Biro Komunikasi Publik.', 'Menunggu surat usulan dari Biro Komunikasi Publik dan arahan pimpinan.', 'Pelaksana Biro KOTL'),
  ('ITJEN-2026-012', '2026-09-29', 'Tusi sudah disepakati.', 'Menunggu rancangan OTK dan Anev.', 'Pelaksana Biro KOTL'),
  ('ITJEN-2026-013', '2026-09-29', 'Sudah dilaksanakan rapat bersama Biro Keuangan.', 'Sudah menyampaikan surat tindak lanjut agar Itjen memperbarui usulan dan melengkapi Anev.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-014', '2026-09-22', 'Telah dilakukan pembahasan internal bersama Inspektorat Jenderal.', 'Perlu pembahasan bersama Tim PANRB atas usulan perubahan tusi TLRHP.', 'Pelaksana Biro KOTL'),
  ('BPSDM-2026-015', '2026-09-01', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada 28 Agustus 2026.', 'Perlu pembahasan internal atas penyesuaian tugas dan fungsi pada beberapa Pusat di BPSDM.', 'Pelaksana Biro KOTL'),
  ('BK-2026-016', '2026-09-01', 'Sudah dilakukan validasi tipologi secara internal dan rapat validasi; perlu melengkapi bukti dukung seperti probis, WBK, dan WBBM.', 'Pembahasan internal untuk penyesuaian bobot pada surat usulan terbaru terhadap rapermen tipologi, dan/atau langsung bersama Kementerian PANRB atas konsep usulan tipologi UPT Ditjen Bina Konstruksi.', 'Pelaksana Biro KOTL'),
  ('SDA-2026-017', '2026-09-29', 'Ada tusi yang hilang dari permen eksisting yang belum ditindaklanjuti.', 'Sudah menghubungi PIC untuk ditindaklanjuti.', 'Pelaksana Biro KOTL'),
  ('BM-2026-018', '2026-09-22', 'Telah diparaf konsep Rapermen LNS BPJT.', 'Menyampaikan konsep Rapermen LNS BPJT kepada Tim PANRB.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-019', '2026-08-19', 'Telah keluar hasil sementara IPKK Kementerian PU dengan nilai 3,58; masuk kategori level 4.', 'Rapat pembahasan bersama unor dan MenPANRB untuk melakukan sanggah.', 'Pelaksana Biro KOTL'),
  ('SETJEN-2026-020', '2026-08-19', 'Telah dilakukan rapat pembahasan bersama Ditjen OTDA Kemendagri dalam rangka permohonan rekomendasi hasil pemetaan Dinas PUTR Provinsi Banten.', 'Monitoring usulan.', 'Pelaksana Biro KOTL');

-- Kelengkapan dokumen dari sheet "Kelengkapan Mei" (hanya yang berstatus ada;
-- "belum ada" tidak dibuatkan baris). Putaran disamakan dengan putaran usulan.
insert into public.dokumen (usulan_kode, putaran, jenis, versi, tanggal_terima, status_validasi, catatan_validasi, validator_nama, tanggal_validasi) values
  ('SDA-2026-004', 3, 'naskah_urgensi', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SDA-2026-004', 3, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BM-2026-005', 3, 'naskah_urgensi', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BM-2026-005', 3, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BPSDM-2026-006', 1, 'naskah_urgensi', 1, '2026-05-20', 'perlu_perbaikan', 'Sudah ada, perlu penyempurnaan.', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SETJEN-2026-009', 1, 'naskah_urgensi', 1, '2026-05-20', 'perlu_perbaikan', 'Sudah ada, perlu penyempurnaan.', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SETJEN-2026-009', 1, 'matriks_perubahan', 1, '2026-05-20', 'perlu_perbaikan', 'Sudah ada, perlu penyempurnaan.', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SETJEN-2026-010', 1, 'naskah_urgensi', 1, '2026-05-20', 'dalam_validasi', 'Masih dalam penyempurnaan data.', '', null),
  ('SETJEN-2026-010', 1, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SETJEN-2026-014', 1, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BK-2026-016', 1, 'naskah_urgensi', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BK-2026-016', 1, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SDA-2026-017', 1, 'naskah_urgensi', 1, '2026-05-20', 'perlu_perbaikan', 'Sudah ada, perlu penyempurnaan.', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('SDA-2026-017', 1, 'matriks_perubahan', 1, '2026-05-20', 'perlu_perbaikan', 'Sudah ada, perlu penyempurnaan.', 'Pelaksana Biro KOTL', '2026-05-20'),
  ('BM-2026-018', 1, 'matriks_perubahan', 1, '2026-05-20', 'valid', '', 'Pelaksana Biro KOTL', '2026-05-20');
