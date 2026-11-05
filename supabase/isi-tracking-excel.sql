-- Isi tracking DashboardMon dari "List On Going Kelembagaan.xlsx"
-- (sheet Progress April, Mei, Agustus, September, Oktober + Kelengkapan April dan Mei).
-- Dijalankan setelah schema.sql. Aman dijalankan ulang: 20 usulan di bawah di-upsert,
-- catatan progres dan dokumen miliknya dihapus lebih dulu.
--
-- Pemetaan (best-effort, bisa dikoreksi lewat UI):
-- - langkah_saat_ini ditafsirkan dari kolom PROGRESS sheet Oktober; posisi_bola selalu
--   sama dengan pelaksana langkah tersebut di src/sop.js;
-- - unor_kode memakai unit eselon I terdekat (item lintas unit memakai SETJEN);
-- - tanggal catatan April dan Mei = akhir bulan (sheet tidak punya kolom update),
--   Agustus sampai Oktober memakai kolom "update" sheet masing-masing, dibatasi ke
--   akhir bulan sheet itu dan dimajukan ke akhir bulan bila kolom update belum
--   diperbarui padahal teksnya berubah;
-- - catatan dengan teks sama seperti catatan sebelumnya tidak diulang;
-- - tabel logs tidak diisi: Excel tidak merekam transisi langkah.

begin;

-- Dua baris lama dari seed yang masih aktif, supaya tidak jadi duplikat.
update public.usulan
   set deleted_at = '2026-11-05', deleted_by = 'Pelaksana BKO'
 where kode in ('SETJEN-2026-019', 'SETJEN-2026-020')
   and deleted_at is null;

delete from public.catatan_progres where usulan_kode in ('PIPU-2026-023', 'PS-2026-024', 'SETJEN-2026-025', 'SDA-2026-026', 'BM-2026-027', 'BPSDM-2026-028', 'PS-2026-029', 'BM-2026-030', 'SETJEN-2026-031', 'SETJEN-2026-032', 'SETJEN-2026-033', 'ITJEN-2026-034', 'ITJEN-2026-035', 'SETJEN-2026-036', 'BPSDM-2026-037', 'BK-2026-038', 'SDA-2026-039', 'BM-2026-040', 'SETJEN-2026-041', 'SETJEN-2026-042');

delete from public.dokumen where usulan_kode in ('PIPU-2026-023', 'PS-2026-024', 'SETJEN-2026-025', 'SDA-2026-026', 'BM-2026-027', 'BPSDM-2026-028', 'PS-2026-029', 'BM-2026-030', 'SETJEN-2026-031', 'SETJEN-2026-032', 'SETJEN-2026-033', 'ITJEN-2026-034', 'ITJEN-2026-035', 'SETJEN-2026-036', 'BPSDM-2026-037', 'BK-2026-038', 'SDA-2026-039', 'BM-2026-040', 'SETJEN-2026-041', 'SETJEN-2026-042');

insert into public.usulan (kode, judul, unor_kode, unit_terdampak, jenis_perubahan, sop_kode, langkah_saat_ini, prioritas, posisi_bola, putaran, tanggal_masuk_tahap, tanggal_usulan_awal, status, catatan_terakhir, deleted_at, deleted_by) values
  ('PIPU-2026-023', 'Pembentukan Balai Pengelola DPJT (Calon BLU)', 'PIPU', array['Direktorat Pengembangan Sistem dan Strategi Penyelenggaraan Pembiayaan']::text[], 'pembentukan', 'upt', 25, 'I', 'BIRO_HUKUM', 1, '2026-09-22', '2026-04-01', 'selesai', 'Permen PU No. 17 Tahun 2026 telah terbit; buku Permen dalam proses pencetakan.', null, null),
  ('PS-2026-024', 'Pembentukan Balai Pelaksana Ditjen PS', 'PS', array['Sekretariat Direktorat Jenderal']::text[], 'pembentukan', 'upt', 25, null, 'BIRO_HUKUM', 1, '2026-09-22', '2026-04-01', 'selesai', 'Permen PU No. 17 Tahun 2026 telah terbit; buku Permen dalam proses pencetakan.', null, null),
  ('SETJEN-2026-025', 'Penguatan Tusi UPT terkait Pembinaan SKPD Dekon TP', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'upt', 3, null, 'BKO', 1, '2026-08-19', '2026-04-01', 'dibatalkan', 'Permen PU 15/PRT/M/2011 dicabut; usulan tidak dilanjutkan.', null, null),
  ('SDA-2026-026', 'Peningkatan Balai ke Balai Besar di Ditjen SDA', 'SDA', array['Sekretariat Direktorat Jenderal']::text[], 'perubahan_nomenklatur', 'upt', 9, null, 'PANRB', 3, '2026-10-12', '2026-04-01', 'aktif', 'Surat usulan ke-3 sudah di Kementerian PANRB; bukti dukung BWS Papua Merauke masih dikejar.', null, null),
  ('BM-2026-027', 'Peningkatan Balai ke Balai Besar di Ditjen BM', 'BM', array['Sekretariat Direktorat Jenderal']::text[], 'perubahan_nomenklatur', 'upt', 7, null, 'MENTERI', 3, '2026-10-12', '2026-04-01', 'aktif', 'Bukti dukung baru dikirim 12 Oktober 2026; dalam pengecekan.', null, null),
  ('BPSDM-2026-028', 'Pembentukan Balai Sertifikasi BPSDM', 'BPSDM', array['Sekretariat Badan']::text[], 'pembentukan', 'upt', 11, null, 'PANRB', 1, '2026-10-12', '2026-04-01', 'aktif', 'Konsep Rapermen sudah di Tim PANRB; menunggu Surat Izin Prinsip Menteri PANRB.', null, null),
  ('PS-2026-029', 'Pembentukan Direktorat Infrastruktur Dukungan Pendidikan Wilayah II di Ditjen PS', 'PS', array['Direktorat Infrastruktur Dukungan Pendidikan']::text[], 'pembentukan', 'otk', 7, 'II', 'PANRB', 1, '2026-08-19', '2026-04-01', 'dibatalkan', 'Usulan dibatalkan melalui surat dari Ditjen PS.', null, null),
  ('BM-2026-030', 'Pembentukan Direktorat Pembinaan Jalan Daerah di Ditjen BM', 'BM', array['Direktorat Sistem dan Strategi Penyelenggaraan Jalan dan Jembatan']::text[], 'perubahan_tugas_fungsi', 'otk', 7, null, 'PANRB', 1, '2026-08-19', '2026-04-01', 'ditunda', 'Usulan ditunda; penajaman tusi pembinaan jalan daerah oleh DJBM dan PFID.', null, null),
  ('SETJEN-2026-031', 'Penambahan Bidang di Pusaka', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'pembentukan', 'otk', 7, null, 'PANRB', 1, '2026-10-31', '2026-04-01', 'aktif', 'Usulan belum sesuai arahan PANRB dan Perpres 140 Tahun 2024; perlu pembahasan internal.', null, null),
  ('SETJEN-2026-032', 'Pembentukan Pusat Penegakan Hukum', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'pembentukan', 'otk', 7, null, 'PANRB', 1, '2026-10-12', '2026-04-01', 'aktif', 'Rapat bersama Kementerian PANRB dijadwalkan 16 Oktober 2026.', null, null),
  ('SETJEN-2026-033', 'Penataan Organisasi Biro Komunikasi Publik', 'SETJEN', array['Biro Komunikasi Publik']::text[], 'perubahan_tugas_fungsi', 'otk', 1, null, 'UNOR', 2, '2026-10-12', '2026-08-19', 'aktif', 'Menunggu surat usulan dan kelengkapan data dukung dari Biro Komunikasi Publik.', null, null),
  ('ITJEN-2026-034', 'Penambahan Bagian pada Sekretariat Inspektorat Jenderal', 'ITJEN', array['Sekretariat Inspektorat Jenderal']::text[], 'perubahan_tugas_fungsi', 'otk', 1, null, 'UNOR', 2, '2026-10-12', '2026-04-01', 'aktif', 'Menunggu surat usulan penyempurnaan dari Itjen; ada potensi usulan baru untuk seluruh Itjen.', null, null),
  ('ITJEN-2026-035', 'Penguatan Tugas dan Fungsi Inspektorat IV', 'ITJEN', array['Inspektorat IV']::text[], 'perubahan_tugas_fungsi', 'otk', 1, null, 'UNOR', 2, '2026-10-12', '2026-04-01', 'aktif', 'Menunggu surat usulan penyempurnaan pasca rapat para Kabag di Itjen.', null, null),
  ('SETJEN-2026-036', 'Penataan Tusi TLRHP Biro Keuangan', 'SETJEN', array['Biro Keuangan']::text[], 'perubahan_tugas_fungsi', 'otk', 5, null, 'BKO', 1, '2026-09-22', '2026-04-01', 'aktif', 'Pembahasan internal bersama Itjen selesai; perlu pembahasan bersama Tim PANRB.', null, null),
  ('BPSDM-2026-037', 'Penataan Tusi Pusat-Pusat di BPSDM', 'BPSDM', array['Pusat Pengelolaan Talenta', 'Pusat Pengembangan Kompetensi Manajemen']::text[], 'perubahan_tugas_fungsi', 'otk', 7, null, 'PANRB', 1, '2026-10-12', '2026-09-01', 'aktif', 'Perlu pembahasan lanjutan bersama Tim PANRB.', null, null),
  ('BK-2026-038', 'Penataan Kelembagaan UPT Ditjen Bina Konstruksi', 'BK', array['Sekretariat Direktorat Jenderal Bina Konstruksi']::text[], 'penggabungan', 'upt', 5, null, 'BKO', 1, '2026-10-12', '2026-04-01', 'aktif', 'Perhitungan tipologi sudah dikoreksi dan dikirim ulang; perlu pembahasan bersama Tim PANRB.', null, null),
  ('SDA-2026-039', 'Penataan LNS Sekretariat Dewan SDA Nasional', 'SDA', array['Direktorat Sistem dan Strategi Pengelolaan Sumber Daya Air']::text[], 'perubahan_tugas_fungsi', 'lns', 11, null, 'UNOR', 1, '2026-10-12', '2026-04-01', 'aktif', 'Masih ada kekeliruan nomenklatur pada lampiran yang sudah diparaf; PIC sudah dihubungi.', null, null),
  ('BM-2026-040', 'Penataan LNS BPJT', 'BM', array['Direktorat Jalan Bebas Hambatan']::text[], 'perubahan_nomenklatur', 'lns', 8, null, 'PANRB', 1, '2026-10-12', '2026-04-01', 'aktif', 'Konsep Rapermen sudah di Tim PANRB; menunggu Surat Izin Prinsip Menteri PANRB.', null, null),
  ('SETJEN-2026-041', 'Indeks Kapabilitas Kelembagaan (IPKK) Kementerian PU', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'non_sop', 0, 'III', 'BKO', 1, '2026-10-12', '2026-04-01', 'aktif', 'Hasil sementara IPKK 3,58 (level 4), sanggah sudah disampaikan; menunggu hasil akhir.', null, null),
  ('SETJEN-2026-042', 'Penataan OPD Banten, Sukabumi, Luwu, Luwu Utara', 'SETJEN', array['Biro Kepegawaian, Organisasi, dan Tata Laksana']::text[], 'perubahan_tugas_fungsi', 'opd', 13, null, 'PEMDA', 1, '2026-08-19', '2026-04-01', 'aktif', 'Rekomendasi hasil pemetaan Dinas PUTR Provinsi Banten dimonitor bersama Ditjen Otda.', null, null)
on conflict (kode) do update set
  judul = excluded.judul,
  unor_kode = excluded.unor_kode,
  unit_terdampak = excluded.unit_terdampak,
  jenis_perubahan = excluded.jenis_perubahan,
  sop_kode = excluded.sop_kode,
  langkah_saat_ini = excluded.langkah_saat_ini,
  prioritas = excluded.prioritas,
  posisi_bola = excluded.posisi_bola,
  putaran = excluded.putaran,
  tanggal_masuk_tahap = excluded.tanggal_masuk_tahap,
  tanggal_usulan_awal = excluded.tanggal_usulan_awal,
  status = excluded.status,
  catatan_terakhir = excluded.catatan_terakhir,
  deleted_at = excluded.deleted_at,
  deleted_by = excluded.deleted_by;

insert into public.catatan_progres (usulan_kode, tanggal, progres, tindak_lanjut, oleh_siapa) values
  ('PIPU-2026-023', '2026-04-30', 'Sudah terbit surat persetujuan Menpan dan dilakukan Konsultasi Publik.', 'Usulan harmonisasi bersama dengan usulan UPT Prioritas I.', 'Pelaksana BKO'),
  ('PIPU-2026-023', '2026-05-31', 'Telah dilakukan Konsultasi Publik.', 'Dalam proses permohonan harmonisasi pengaturan Rapermen.', 'Pelaksana BKO'),
  ('PIPU-2026-023', '2026-08-19', 'Dalam proses penetapan Permen PU.', 'Koordinasi dengan Biro Hukum terkait update penetapan.', 'Pelaksana BKO'),
  ('PIPU-2026-023', '2026-09-22', 'Telah terbit Permen PU No. 17 Tahun 2026 tentang Perubahan Permen PU No. 1 Tahun 2025 tentang OTK UPT Di KemenPU.', 'Pencetakan buku Permen : Dalam proses pencetakan.', 'Pelaksana BKO'),
  ('PS-2026-024', '2026-04-30', 'Dalam proses usulan penetapan SK Tim Penyusun Rapermen ke Biro Hukum.', 'Monitoring usulan penetapan SK Tim Penyusun Rapermen.', 'Pelaksana BKO'),
  ('PS-2026-024', '2026-05-31', 'Telah dilakukan Konsultasi Publik.', 'Dalam proses permohonan harmonisasi pengaturan Rapermen.', 'Pelaksana BKO'),
  ('PS-2026-024', '2026-08-19', 'Dalam proses penetapan Permen PU.', 'Koordinasi dengan Biro Hukum terkait update penetapan.', 'Pelaksana BKO'),
  ('PS-2026-024', '2026-09-22', 'Telah terbit Permen PU No. 17 Tahun 2026 tentang Perubahan Permen PU No. 1 Tahun 2025 tentang OTK UPT Di KemenPU.', 'Pencetakan buku Permen : Dalam proses pencetakan.', 'Pelaksana BKO'),
  ('SETJEN-2026-025', '2026-04-30', 'Perumusan Tusi.', 'Rapat pembahasan bersama Unor terkait Dekon-TP.', 'Pelaksana BKO'),
  ('SETJEN-2026-025', '2026-05-31', 'Finalisasi rancangan PermenPU Dekon-TP.', 'Proses finalisasi rancangan PermenPU Dekon-TP.', 'Pelaksana BKO'),
  ('SETJEN-2026-025', '2026-08-19', 'Arahan Pimpinan dilakukan PENCABUTAN PERATURAN MENTERI PEKERJAAN UMUM NOMOR 15/PRT/M/2011 sehingga penguatan tugas dan fungsi UPT terkait pembinaan SKPD Dekon TP menjadi tidak dibutuhkan.', 'Usulan penguatan Tugas dan Fungsi UPT terkait Dekon TP tidak dilanjutkan.', 'Pelaksana BKO'),
  ('SDA-2026-026', '2026-04-30', 'Telah dilakukan validasi naskah akademis.', 'Rapat pembahasan hasil validasi.', 'Pelaksana BKO'),
  ('SDA-2026-026', '2026-05-31', 'Sudah dilakukan validasi tipologi secara internal.', 'Pembahasan bersama Ditjen SDA, terkait pemenuhan bukti dukung yang kurang.', 'Pelaksana BKO'),
  ('SDA-2026-026', '2026-08-19', 'Validasi Perhitungan Tipologi UPT bersama Ditjen SDA serta menunggu penyempurnaan bukti dukung rencana usulan peningkatan BWS Kalimantan II Palangkaraya dan BWS Papua Merauke.', '1. Pembahasan internal atas hasil perhitungan tipologi dan bukti dukung. 2. Pengajuan Surat Menteri usulan baru ke Kementerian PANRB untuk Peningkatan BWS Kalimantan II dan BWS Papua Merauke.', 'Pelaksana BKO'),
  ('SDA-2026-026', '2026-09-29', 'Surat usulan ke-3 sudah di sampaikan ke Menpan RB.', 'UPT sektoral : 1. Pembahasan internal atas hasil perhitungan tipologi dan bukti dukung. 2. menunggu kelengkapan bukti dukung bws. UPT regional : 1. masih menunggu arahan TL setelah rapat dengan Menteri PU.', 'Pelaksana BKO'),
  ('SDA-2026-026', '2026-10-12', '1. surat usulan ke-3 sudah di sampaikan ke Menpan RB. 2. sudah mengontak PIC terkait pemenuhan bukti dukung pada BWS Papua Merauke.', 'Membuat surat monitoring pemenuhan data dukung. UPT regional : masih dilakukan pembahasan bersama biro-biro dan BPIW.', 'Pelaksana BKO'),
  ('BM-2026-027', '2026-04-30', 'Telah dilakukan validasi usulan dan naskah urgensi serta rapat pembahasan teknis hasil validasi.', 'Monitoring penyempurnaan naskah urgensi dan pemenuhan kelengkapan bukti dukung.', 'Pelaksana BKO'),
  ('BM-2026-027', '2026-05-31', 'Rapat pembahasan awal dengan BKO.', 'Telah dilakukan validasi perhitungan tipologi, dalam proses telaah ulang naskah urgensi setelah revisi.', 'Pelaksana BKO'),
  ('BM-2026-027', '2026-08-19', 'Validasi Perhitungan Tipologi UPT bersama Ditjen Bina Marga serta menunggu bukti dukung rencana usulan peningkatan BPJN Papua Selatan.', 'Telah dilakukan validasi perhitungan tipologi untuk usulan awal dan dalam proses perbaikan atau updating atas usulan terbaru. Dapat dilakukan pembahasan internal dan/atau langsung bersama Kementerian PANRB atas konsep usulan Tipologi UPT Ditjen BM.', 'Pelaksana BKO'),
  ('BM-2026-027', '2026-09-22', 'Masih menunggu tanda tangan pak menteri atas surat menteri usulan ke -3 terkait BPJN Papua Selatan.', '1. Menunggu arahan Balai Regional dari Pimpinan. 2. Pembahasan internal atas hasil perhitungan tipologi dan bukti dukung. 3. menunggu kelengkapan bukti dukung BPJN.', 'Pelaksana BKO'),
  ('BM-2026-027', '2026-10-12', 'Telah dikirimkan bukti dukung baru per tanggal 12 Oktober 2026.', 'Pengecekan bukti dukung usulan. UPT regional : masih dilakukan pembahasan bersama biro-biro dan BPIW.', 'Pelaksana BKO'),
  ('BPSDM-2026-028', '2026-04-30', 'Telah dilakukan pembahasan awal atas usulan pembentukan Balai.', 'Monitoring penyampaian naskah urgensi hasil perbaikan.', 'Pelaksana BKO'),
  ('BPSDM-2026-028', '2026-05-31', 'Rapat pembahasan awal dengan BKO.', 'Dalam proses penyempurnaan Naskah Urgensi dan usulan.', 'Pelaksana BKO'),
  ('BPSDM-2026-028', '2026-08-19', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB dan BNSP.', 'Naskah urgensi dan bukti dukung lainnya atas usulan telah disempurnakan dan disampaikan ke BKO. Perlu dilakukan pembahasan internal atas penyesuaian tugas dan fungsi pada beberapa Pusat di BPSDM dan/atau dapat dilakukan pembahasan final bersama Kementerian PANRB.', 'Pelaksana BKO'),
  ('BPSDM-2026-028', '2026-09-22', 'Telah di paraf konsep Rapermen pembentukan UPT BPSDM.', 'Menyampaikan Konsep Rapermen pembentukan UPT BPSDM kepada Tim PANRB.', 'Pelaksana BKO'),
  ('BPSDM-2026-028', '2026-10-12', 'Telah di sampaikan konsep Rapermen pembentukan UPT BPSDM kepada Tim PANRB.', 'Menunggu Surat Izin Prinsip dari Menteri PANRB.', 'Pelaksana BKO'),
  ('PS-2026-029', '2026-04-30', 'Sedang dilakukan validasi usulan dan Naskah Urgensi.', 'Rapat pembahasan hasil validasi.', 'Pelaksana BKO'),
  ('PS-2026-029', '2026-05-31', 'Rapat terakhir dengan Kementerian PANRB belum dapat dipertimbangkan usulan pembentukan Direktorat Infrastruktur Dukungan Pendidikan Wilayah di Ditjen PS.', 'Pengaturan dan penataan tim secara internal.', 'Pelaksana BKO'),
  ('PS-2026-029', '2026-08-19', 'Usulan dibatalkan melalui surat dari Ditjen PS.', 'Ditunda setelah adanya evaluasi kelembagaan di Ditjen PS secara menyeluruh minimal 2 tahun setelah berjalannya UPT di Ditjen PS.', 'Pelaksana BKO'),
  ('BM-2026-030', '2026-04-30', 'Sedang dilakukan validasi usulan dan Naskah Urgensi.', 'Rapat pembahasan hasil validasi.', 'Pelaksana BKO'),
  ('BM-2026-030', '2026-05-31', 'Rapat terakhir dengan Kementerian PAN RB dapat dipertimbangkan usulan penajaman tusi pada internal Direktorat Jenderal Bina Marga.', 'Telah disampaikan nota dinas Sekretaris Direktorat Jenderal Bina Marga Nomor OR0101/B/Bs/2026/36 tanggal 29 Mei 2026 hal penyesuaian penataan organisasi dalam rangka pembinaan Jalan Daerah.', 'Pelaksana BKO'),
  ('BM-2026-030', '2026-08-19', 'Usulan pembentukan Direktorat Jalan Daerah telah dilakukan pemabahasan bersama Kementerian PANRN dan Usulan terbaru dirubah menjadi penegasan Tugas dan Fungsi pembinaan jalan daerah. Atas usulan terbaru telah dilakukan pembahasan bersama PFID atas potensi tumpang tindih tugas dan fungsi pembinaan jalan daerah.', '1. Usulan ditunda dan DJBM dapat melakukan identifikasi dan penajaman kembali rumusan tusi terkait pembinaan jalan daerah pada seluruh unit kerja, sesuai kebutuhan. 2. PFID melakukan identifikasi dan penajaman kembali rumusan tusi, khususnya terkait pengelolaan data jalan daerah dan pembiayaan transfer ke daerah, untuk mempertegas bagi peran dan menghindari tumpang tindih/duplikasi tusi dengan DJBM. 3. Monitoring atas tindak lanjut yang dilakukan pada angka 1 dan 2.', 'Pelaksana BKO'),
  ('SETJEN-2026-031', '2026-04-30', 'Surat BKO ke Pusakha agar menyusun Naskah Urgensi sesuai masukan Menpan.', 'Monitoring agar naskah urgensi segera disampaikan.', 'Pelaksana BKO'),
  ('SETJEN-2026-031', '2026-05-31', 'Telah dilakukan pembahasan dengan Kementerian PANRB.', 'Proses penyempurnaan usulan dan Naskah Urgensi atas hasil pembahasan dengan Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-031', '2026-08-19', 'Telah dilakukan pembahasan dengan Kementerian PANRB dan Usulan terbaru telah disampaikan kepada BKO.', 'Perlu dilakukan pembahasan internal, mengenai usulan yang telah disampaikan. Mengingat usulan masih belum sesuai dengan arahan Kementerian PANRB dan Perpres 140 Tahun 2024 yang membatasi jumlah bidang pada Pusat sebanyak 3 bidang.', 'Pelaksana BKO'),
  ('SETJEN-2026-031', '2026-09-01', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada tanggal 28 Agustus 2026.', 'Perlu dilakukan pembahasan internal, mengenai usulan yang telah disampaikan. Mengingat usulan masih belum sesuai dengan arahan Kementerian PANRB dan Perpres 140 Tahun 2024 yang membatasi jumlah bidang pada Pusat sebanyak 3 bidang.', 'Pelaksana BKO'),
  ('SETJEN-2026-031', '2026-10-31', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada tanggal 28 Agustus 2026.', 'Perlu dilakukan pembahasan internal, mengenai usulan yang telah disampaikan. Mengingat usulan masih belum sesuai dengan arahan Kementerian PANRB dan Perpres 140 Tahun 2024 yang membatasi jumlah bidang pada Pusat sebanyak 3 bidang. Catatan: dicek lebih lanjut.', 'Pelaksana BKO'),
  ('SETJEN-2026-032', '2026-04-30', 'Telah dilakukan penyusunan Naskah Urgensi.', 'Surat permohonan arahan ke Pak Menteri atas pembentukan Pusat Penegakan Hukum.', 'Pelaksana BKO'),
  ('SETJEN-2026-032', '2026-05-31', 'Telah dilakukan pembahasan dengan Kementerian PANRB dan di pending persetujuan pembentukannya dengan adanya kelengkapan data atas pelanggaran-pelanggaran yang telah terjadi sebagai dasar urgensitas pembentukan Pusgakkum.', 'Saat ini sedang dilakukan penyempurnaan naskah urgensi oleh pemrakarsa dan pemenuhan kelengkapan usulan lainnya.', 'Pelaksana BKO'),
  ('SETJEN-2026-032', '2026-08-19', 'Telah dilakukan pembahasan pada tanggal 8 Mei 2026 bersama Kementerian PANRB.', 'Penyempurnaan Bukti Dukung usulan pembentukan organisasi Pusgakum pada naskah urgensi dan data beban kerja penegakan hukum bidang pu dan dapat dilaksanakan pembahasan bersama Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-032', '2026-09-01', 'Telah dilakukan pembahasan pada tanggal 28 Agustus 2026 bersama Kementerian PANRB.', '1. penegasan mandat, memastikan bahwa ursan tugas dan fungsi merupakan multi sektor. 2. pembahasan khusus bersama unit organisasi terkait dan Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-032', '2026-10-12', 'Telah dilakukan pembahasan pada tanggal 28 Agustus 2026 bersama Kementerian PANRB.', 'Akan dilaksanakan rapat bersama Kementerian PANRB hari Jum''at tanggal 16 Okt 2026.', 'Pelaksana BKO'),
  ('SETJEN-2026-033', '2026-08-19', 'Telah dilakukan pembahasan bersama Kementerian PANRB pada tanggal 15 Juni 2026 dan hasil pembahasan secara prinsip dapat dilanjutkan dengan penyempurnaan usulan penataan organisasi dimaksud. Telah disampaikan Nota Dinas permohonan kelengkapan usulan dan bukti dukung kepada Biro Komunikasi Publik.', 'Menunggu surat usulan dari Biro Komunikasi Publik dan arahan pimpinan atas usulan dimaksud.', 'Pelaksana BKO'),
  ('SETJEN-2026-033', '2026-10-12', 'Telah disampaikan Nota Dinas permohonan kelengkapan usulan dan bukti dukung kepada Biro Komunikasi Publik.', 'Menunggu surat usulan dan kelengkapan data pendukung dari Biro Komunikasi Publik.', 'Pelaksana BKO'),
  ('ITJEN-2026-034', '2026-04-30', 'Surat BKO ke Itjen untuk melengkapi bukti dukung salah satunya matriks semula menjadi Tusi yang belum terlampir pada naskah urgensi.', 'Monitoring agar naskah urgensi segera disampaikan. Koordinasi dengan PIC (mas Tama) untuk proses percepatan penyampaian usulan, terutama matriks semula menjadi atas penambahan bagian di set itjen.', 'Pelaksana BKO'),
  ('ITJEN-2026-034', '2026-05-31', 'Usulan penataan kelembagaan tidak dapat dipertimbangkan oleh Kementerian PAN RB dengan alternatif dapat menambah tim kerja yang bertanggung jawab dan berkoordinasi langsung kepada SesItjen.', 'Pengaturan dan penataan tim secara internal.', 'Pelaksana BKO'),
  ('ITJEN-2026-034', '2026-08-19', 'Usulan penataan kelembagaan tidak dapat dipertimbangkan oleh Kementerian PAN RB dengan alternatif dapat menambah tim kerja yang bertanggung jawab dan berkoordinasi langsung kepada SesItjen.', 'Dapat dilakukan pembahasan bersama dengan Kementerian PANRB atas usulan yang diubah menjadi penajaman tugas dan fungsi.', 'Pelaksana BKO'),
  ('ITJEN-2026-034', '2026-09-29', 'Tusi sudah ok.', 'Menunggu rancangan OTK dan Anev.', 'Pelaksana BKO'),
  ('ITJEN-2026-034', '2026-10-12', 'Tusi sudah ok. catatan tambahan: Berdasarkan rapat pembahasan terakhir bersama Kabag di Sekretariat Itjen tanggal 6 Oktober 2026, terdapat potensi usulan baru untuk keseluruhan Inspektorat Jenderal.', 'Menunggu surat usulan penyempurnaan pasca rapat bersama para Kabag di Itjen (masih dibahas dan dilaporkan ke bu Irjen). catatan : ingin mengubah tusi eselon I, perlu komitmen pimpinan apabila mengubah perpres 140 dan 170.', 'Pelaksana BKO'),
  ('ITJEN-2026-035', '2026-04-30', 'Sudah tercantum matriks semula menjadi berdasarkan surat Inspektorat IV, belum ada naskah urgensi.', 'Sudah bersurat ke Set Itjen untuk permintaan penyampaian Naskah urgensi inspektorat IV, monitoring penyampaian naskah urgensi.', 'Pelaksana BKO'),
  ('ITJEN-2026-035', '2026-05-31', 'Usulan penajaman tusi Inspektorat VI dapat dipertimbangkan oleh Kementerian PAN RB, sudah bersurat untuk permintaan kelengkapan (naskah urgensi, matriks semula menjadi).', 'Sudah ada surat terkait penajaman tusi, belum terdapat naskah akademis. Berkoordinasi dengan PIC Sekretariat Inspektorat Jenderal untuk percepatan proses pemenuhan bukti dukung.', 'Pelaksana BKO'),
  ('ITJEN-2026-035', '2026-08-19', 'Usulan penajaman tusi Inspektorat VI dapat dipertimbangkan oleh Kementerian PAN RB, sudah bersurat untuk permintaan kelengkapan (naskah urgensi, matriks semula menjadi).', 'Dapat dilakukan pembahasan bersama dengan Kementerian PANRB atas usulan yang diubah menjadi penajaman tugas dan fungsi.', 'Pelaksana BKO'),
  ('ITJEN-2026-035', '2026-09-29', 'Sudah dilaksanakan rapat bersama birkeu.', 'Sudah menyampaikan surat TL untuk itjen agar dapat memperbarui usulan dan melengkapi anev.', 'Pelaksana BKO'),
  ('ITJEN-2026-035', '2026-10-12', 'Sudah dilaksanakan rapat bersama birkeu.', 'Menunggu surat usulan penyempurnaan pasca rapat bersama para Kabag di Itjen (masih dibahas dan dilaporkan ke bu Irjen).', 'Pelaksana BKO'),
  ('SETJEN-2026-036', '2026-04-30', 'Rapat pembahasan bersama Biro Keuangan dan Itjen.', 'Akan dilakukan konfirmasi kepada Biro Keuangan atas kelanjutan usulan beserta kelengkapan.', 'Pelaksana BKO'),
  ('SETJEN-2026-036', '2026-05-31', 'Telah dilakukan rapat pembahasan dengan Kementerian PAN RB dan pada tanggal 5 Juni 2026 telah dilakukan rapat pemabahasan dengan Itjen dan BKO.', 'Akan disampaikan hasil rapat tanggal 5 juni 2026 kepada masing-masing pimpinan, dengan adanya perubahan tusi yang diusulkan.', 'Pelaksana BKO'),
  ('SETJEN-2026-036', '2026-08-19', 'Telah dilakukan rapat pembahasan dengan Kementerian PAN RB dan pada tanggal 5 Juni 2026 telah dilakukan rapat pembahasan dengan Itjen dan Kementerian PANRB. Telah disampaikan penyempurnaan usulan terbaru yang menyesuaikan fungsi dukungan TLRHP di Biro Keuangan.', 'Dapat dilakukan pembahasan bersama dengan Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-036', '2026-09-22', 'Telah dilakukan pembahasan internal bersama Inspektorat Jenderal.', 'Perlu dilakukan pembahasan bersama Tim PANRB atas usulan perubahan tusi tentang TLRHP.', 'Pelaksana BKO'),
  ('BPSDM-2026-037', '2026-09-30', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada tanggal 28 Agustus 2026.', 'Perlu dilakukan pembahasan internal atas penyesuaian tugas dan fungsi pada beberapa Pusat di BPSDM.', 'Pelaksana BKO'),
  ('BPSDM-2026-037', '2026-10-12', 'Telah dilakukan rapat pembahasan bersama Kementerian PANRB pada tanggal 28 Agustus 2026.', 'Perlu dilakukan pembahasan lanjutan bersama tim PANRB.', 'Pelaksana BKO'),
  ('BK-2026-038', '2026-04-30', 'Sudah dilakukan rapat terkait permintaan kelengkapan bukti dukung atas usulan penataan kelembagaan UPT di Direktorat Jenderal Bina Konstruksi.', 'Monitoring penyampaian kelengkapan bukti dukung atas penataan kelembagaan UPT Direktorat Jenderal Bina Konstruksi.', 'Pelaksana BKO'),
  ('BK-2026-038', '2026-05-31', 'Sudah dilakukan validasi tipologi secara internal, perlu melengkapi bukti dukung seperti probis, wbk dan wbbm.', 'Pembahasan bersama DJBK apabila bukti dukung sudah di penuhi.', 'Pelaksana BKO'),
  ('BK-2026-038', '2026-08-19', 'Sudah dilakukan validasi tipologi secara internal, rapat validasi interval, perlu melengkapi bukti dukung seperti probis, wbk dan wbbm.', 'Dapat dilakukan pembahasan internal kembali untuk penyesuaian bobot pada surat usulan terbaru terhadap rapermen tipologi dan/atau langsung bersama Kementerian PANRB atas konsep usulan Tipologi UPT Ditjen Bikon.', 'Pelaksana BKO'),
  ('BK-2026-038', '2026-10-12', 'Sudah dilakukan validasi tipologi secara internal, rapat validasi interval, perlu melengkapi bukti dukung seperti probis, wbk dan wbbm.', 'Sudah dilakukan pembahasan dengan DJBK terkait perhitungan tipologi nya yang perlu dikoreksi, sudah terkoreksi dan sudah dikirimkan kembali. Perlu dilakukan pembahasan bersama tim PANRB.', 'Pelaksana BKO'),
  ('SDA-2026-039', '2026-04-30', 'Surat BKO ke Setwan DSDAN agar menyampaikan Naskah Urgensi.', 'Monitoring agar Naskah Urgansi segera disampaikan.', 'Pelaksana BKO'),
  ('SDA-2026-039', '2026-05-31', 'Usulan penataan kelembagaan Setwan SDAN dapat dipertimbangkan oleh Kementerian PAN RB. 1. pertanyaan dari Kementerian PAN RB terkait pengaturan pada pasal 3 yang mengatur pemilihan anggota, sedangkan ada poin dukungan administratif, apakah ini merupakan hal yang sama. 2. penyederhanaan struktur organisasi dapat dipertimbangkan.', 'Penyusunan surat usulan terbaru yang menjawab pertanyaan Kementerian PAN RB sedang on progress dari Setwan SDAN yang juga mencakup naskah akademis terbaru, matriks semula menjadi terbaru.', 'Pelaksana BKO'),
  ('SDA-2026-039', '2026-08-19', 'Sudah di validasi ke-2 oleh kementerian PANRB, sedang dilakukan pembahasan secara internal bersama DSDAN, Setditjen SDA, dan Biro Hukum atas draft Rapermen PU tentang Sekretariat Dewan SDA Nasional.', 'Pembahasan draf Permen SOTK bersama Biro Hukum pada tanggal 18 dan 19 Agustus 2026.', 'Pelaksana BKO'),
  ('SDA-2026-039', '2026-09-29', 'Ada tusi yang hilang dari permen eksisting yang belum di TL.', 'Sudah menghubungi PIC untuk di tindak lanjuti.', 'Pelaksana BKO'),
  ('SDA-2026-039', '2026-10-12', 'Ada tusi yang hilang dari permen eksisting yang belum di TL.', 'Sudah mengirimkan surat penyampaian paraf kembali, masih terdapat kekeliruan nomenklatur yang sudah di paraf pada lampiran, sudah menghubungi PIC untuk mengirimkan nya kembali.', 'Pelaksana BKO'),
  ('BM-2026-040', '2026-04-30', 'Surat BKO ke BPJT agar menyampaikan Naskah Urgensi.', 'Monitoring agar Naskah Urgansi segera disampaikan.', 'Pelaksana BKO'),
  ('BM-2026-040', '2026-05-31', 'Rapat terakhir dengan Kementerian PAN RB masih menunggu kelengkapan dokumen usulan.', 'Saat ini sedang dilakukan penyusunan naskah urgensi oleh BPJT dan pemenuhan kelengkapan usulan lainnya.', 'Pelaksana BKO'),
  ('BM-2026-040', '2026-08-19', 'Telah dilakukan pembahasan bersama Kementerian PANRB atas Rancangan Peraturan Menteri dan menunggu tanggapan BPJT atas review terhadap Rapermen dimaksud.', 'Direncanakan pembahasan atas review Kementerian PANRB di internal BPJT dan direncanakan dilakukan pembahasan internal pada tanggal 26 Agustus 2026.', 'Pelaksana BKO'),
  ('BM-2026-040', '2026-09-22', 'Telah di paraf konsep Rapermen LNS BPJT.', 'Menyampaikan Konsep Rapermen LNS BPJT kepada Tim PANRB.', 'Pelaksana BKO'),
  ('BM-2026-040', '2026-10-12', 'Telah di sampaikan konsep Rapermen LNS BPJT kepada Tim PANRB.', 'Menunggu Surat Izin Prinsip dari Menteri PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-041', '2026-04-30', 'Penyusunan instrumen.', 'Pembahasan instrumen.', 'Pelaksana BKO'),
  ('SETJEN-2026-041', '2026-05-31', 'Telah mengikuti sosialisasi indeks kapabilitas kelembagaan yang diselenggarakan oleh Kementerian PANRB.', 'Akan dilakukan pengisian atas instrumen-instrumen yang menjadi penilaian dalam indeks kapabilitas kelembagaan di Kementerian PU sesuai dengan jadwal yang telah ditentukan oleh Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-041', '2026-08-19', 'Telah mengumpulkan Indeks Kapabilitas Kelembagaan (IKK) kepada Kementerian PANRB untuk mendapatkan nilai hasil validasi dari Kementerian PANRB.', 'Monitoring update hasil validasi nilai IKK kepada Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-041', '2026-09-30', 'Telah keluar hasil sementara IPKK Kementerian PU dengan nilai 3,58 masuk dalam kategori level 4.', 'Rapat pemabahasan bersama unor dan MenPANRB untuk melakukan sanggah.', 'Pelaksana BKO'),
  ('SETJEN-2026-041', '2026-10-12', 'Telah keluar hasil sementara IPKK Kementerian PU dengan nilai 3,58 masuk dalam kategori level 4 dan telah dilakukan sanggah kepada Kementerian PANRB.', 'Menunggu hasil akhir penilaian IPKK dari Kementerian PANRB.', 'Pelaksana BKO'),
  ('SETJEN-2026-042', '2026-04-30', '1. Prov. Banten dan Kab. Luwu telah dikirimkan surat hasil validasi. 2. Prov. Jawa Barat, Kab. Bogor, Kab. Sukabumi dan Kab. Luwu Utara sedang dilakukan validasi data teknis oleh PFID.', 'Koordinasi dengan PFID untuk Prov. Jawa Barat, Kab. Bogor, Kab. Sukabumi dan Kab. Luwu Utara.', 'Pelaksana BKO'),
  ('SETJEN-2026-042', '2026-05-31', 'Telah dilakukan rapat pembahasan bersama Ditjen OTDA, Kemendagri dalam rangka permohonan rekomendasi hasil pemetaan Dinas PUTR Prov Banten.', 'Akan dilakukan pembahasan lanjutan dengan Ditjen Otda terkait rekomendasi hasil pemetaaan Dinas PUTR Prov Banten yang telah dilakukan.', 'Pelaksana BKO'),
  ('SETJEN-2026-042', '2026-08-19', 'Telah dilakukan rapat pembahasan bersama Ditjen OTDA, Kemendagri dalam rangka permohonan rekomendasi hasil pemetaan Dinas PUTR Prov Banten.', 'Monitoring usulan.', 'Pelaksana BKO');

insert into public.dokumen (usulan_kode, putaran, jenis, versi, tanggal_terima, status_validasi, catatan_validasi, validator_nama, tanggal_validasi) values
  ('SDA-2026-026', 3, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Sudah ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('SDA-2026-026', 3, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Sudah ada matriks perubahan pada naskah akademis.', 'Pelaksana BKO', '2026-04-30'),
  ('BM-2026-027', 3, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('BM-2026-027', 3, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Sudah ada matriks perubahan pada naskah akademis.', 'Pelaksana BKO', '2026-04-30'),
  ('BPSDM-2026-028', 1, 'naskah_urgensi', 1, '2026-04-30', 'perlu_perbaikan', 'Ada, sudah divalidasi dan menunggu penyempurnaan NU.', 'Pelaksana BKO', '2026-04-30'),
  ('PS-2026-029', 1, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Sudah ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('PS-2026-029', 1, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Sudah ada matriks perubahan atau semula menjadi.', 'Pelaksana BKO', '2026-04-30'),
  ('BM-2026-030', 1, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('BM-2026-030', 1, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Sudah ada matriks perubahan pada naskah akademis.', 'Pelaksana BKO', '2026-04-30'),
  ('SETJEN-2026-031', 1, 'naskah_urgensi', 1, '2026-04-30', 'perlu_perbaikan', 'Ada, sudah divalidasi dan menunggu penyempurnaan NU.', 'Pelaksana BKO', '2026-04-30'),
  ('SETJEN-2026-031', 1, 'matriks_perubahan', 1, '2026-04-30', 'perlu_perbaikan', 'Matriks perubahan semula menjadi Tugas sudah ada, Fungsi belum ada.', 'Pelaksana BKO', '2026-04-30'),
  ('ITJEN-2026-034', 2, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('ITJEN-2026-034', 2, 'matriks_perubahan', 1, '2026-04-30', 'perlu_perbaikan', 'Struktur organisasi semula menjadi sudah ada, untuk tugas dan fungsi belum ada.', 'Pelaksana BKO', '2026-04-30'),
  ('ITJEN-2026-035', 2, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Sudah ada matriks semula menjadi tugas dan fungsi.', 'Pelaksana BKO', '2026-04-30'),
  ('BK-2026-038', 1, 'naskah_urgensi', 1, '2026-04-30', 'valid', 'Ada, sudah di validasi.', 'Pelaksana BKO', '2026-04-30'),
  ('BK-2026-038', 1, 'matriks_perubahan', 1, '2026-04-30', 'valid', '', 'Pelaksana BKO', '2026-04-30'),
  ('SETJEN-2026-032', 1, 'naskah_urgensi', 1, '2026-04-30', 'valid', '', 'Pelaksana BKO', '2026-04-30'),
  ('SDA-2026-039', 1, 'naskah_urgensi', 1, '2026-04-30', 'dalam_validasi', 'Sudah ada, belum di validasi.', '', null),
  ('SDA-2026-039', 1, 'matriks_perubahan', 1, '2026-04-30', 'valid', 'Matriks tugas dan fungsi sudah ada dalam naskah urgensi.', 'Pelaksana BKO', '2026-04-30'),
  ('SDA-2026-026', 3, 'naskah_urgensi', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('SDA-2026-026', 3, 'matriks_perubahan', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BM-2026-027', 3, 'naskah_urgensi', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BM-2026-027', 3, 'matriks_perubahan', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BPSDM-2026-028', 1, 'naskah_urgensi', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (perlu penyempurnaan).', 'Pelaksana BKO', '2026-05-31'),
  ('PS-2026-029', 1, 'naskah_urgensi', 2, '2026-05-31', 'valid', 'Sudah ada tapi hasil pembahasan tgl 8 Mei 2026 belum jadi dilakukan penataan.', 'Pelaksana BKO', '2026-05-31'),
  ('PS-2026-029', 1, 'matriks_perubahan', 2, '2026-05-31', 'valid', 'Sudah ada tapi hasil pembahasan tgl 8 Mei 2026 belum jadi dilakukan penataan.', 'Pelaksana BKO', '2026-05-31'),
  ('BM-2026-030', 1, 'naskah_urgensi', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BM-2026-030', 1, 'matriks_perubahan', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('SETJEN-2026-031', 1, 'naskah_urgensi', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (perlu penyempurnaan).', 'Pelaksana BKO', '2026-05-31'),
  ('SETJEN-2026-031', 1, 'matriks_perubahan', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (perlu penyempurnaan).', 'Pelaksana BKO', '2026-05-31'),
  ('ITJEN-2026-034', 2, 'naskah_urgensi', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (tidak berlaku).', 'Pelaksana BKO', '2026-05-31'),
  ('ITJEN-2026-035', 2, 'matriks_perubahan', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BK-2026-038', 1, 'naskah_urgensi', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('BK-2026-038', 1, 'matriks_perubahan', 2, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('SETJEN-2026-036', 1, 'matriks_perubahan', 1, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('SETJEN-2026-032', 1, 'naskah_urgensi', 2, '2026-05-31', 'dalam_validasi', 'Masih dalam penyempurnaan data.', '', null),
  ('SETJEN-2026-032', 1, 'matriks_perubahan', 1, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31'),
  ('SDA-2026-039', 1, 'naskah_urgensi', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (perlu penyempurnaan).', 'Pelaksana BKO', '2026-05-31'),
  ('SDA-2026-039', 1, 'matriks_perubahan', 2, '2026-05-31', 'perlu_perbaikan', 'Sudah ada (perlu penyempurnaan).', 'Pelaksana BKO', '2026-05-31'),
  ('BM-2026-040', 1, 'matriks_perubahan', 1, '2026-05-31', 'valid', '', 'Pelaksana BKO', '2026-05-31');

-- Kode usulan baru dari aplikasi lanjut setelah 042.
select setval('public.usulan_seq', 42);

commit;
