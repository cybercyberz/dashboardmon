import { useEffect, useMemo, useRef, useState } from "react";

// =====================================================================
// KONSTANTA UNIT ORGANISASI (Permen PU 1/2024)
// Domain field names (kode, nama, unit) kept in Indonesian per spec.
// =====================================================================

const UNIT_ORGANISASI = [
  {
    kode: "SETJEN",
    nama: "Sekretariat Jenderal",
    unit: [
      "Biro Perencanaan Anggaran dan Kerja Sama Luar Negeri",
      "Biro Kepegawaian, Organisasi, dan Tata Laksana",
      "Biro Keuangan",
      "Biro Umum",
      "Biro Hukum",
      "Biro Pengelolaan Barang Milik Negara",
      "Biro Komunikasi Publik",
    ],
  },
  {
    kode: "SDA",
    nama: "Direktorat Jenderal Sumber Daya Air",
    unit: [
      "Sekretariat Direktorat Jenderal",
      "Direktorat Sistem dan Strategi Pengelolaan Sumber Daya Air",
      "Direktorat Bina Teknik Sumber Daya Air",
      "Direktorat Sungai dan Pantai",
      "Direktorat Irigasi dan Rawa",
      "Direktorat Bendungan dan Danau",
      "Direktorat Air Tanah dan Air Baku",
      "Direktorat Bina Operasi dan Pemeliharaan",
      "Direktorat Kepatuhan Intern",
    ],
  },
  {
    kode: "BM",
    nama: "Direktorat Jenderal Bina Marga",
    unit: [
      "Sekretariat Direktorat Jenderal",
      "Direktorat Sistem dan Strategi Penyelenggaraan Jalan dan Jembatan",
      "Direktorat Bina Teknik Jalan dan Jembatan",
      "Direktorat Pembangunan Jalan",
      "Direktorat Pembangunan Jembatan",
      "Direktorat Preservasi Jalan dan Jembatan Wilayah I",
      "Direktorat Preservasi Jalan dan Jembatan Wilayah II",
      "Direktorat Jalan Bebas Hambatan",
      "Direktorat Kepatuhan Intern",
    ],
  },
  {
    kode: "CK",
    nama: "Direktorat Jenderal Cipta Karya",
    unit: [
      "Sekretariat Direktorat Jenderal",
      "Direktorat Sistem dan Strategi Penyelenggaraan Infrastruktur Cipta Karya",
      "Direktorat Bina Teknik Bangunan Gedung dan Penyehatan Lingkungan",
      "Direktorat Bina Penataan Bangunan",
      "Direktorat Air Minum",
      "Direktorat Sanitasi",
      "Direktorat Pengembangan Kawasan Strategis",
      "Direktorat Kepatuhan Intern",
    ],
  },
  {
    kode: "PS",
    nama: "Direktorat Jenderal Prasarana Strategis",
    unit: [
      "Sekretariat Direktorat Jenderal",
      "Direktorat Sistem dan Strategi Penyelenggaraan Prasarana Strategis",
      "Direktorat Infrastruktur Dukungan Pendidikan",
      "Direktorat Infrastruktur Dukungan Perekonomian, Peribadatan, Kesehatan, Olahraga dan Sosial Budaya",
      "Direktorat Kepatuhan Intern",
    ],
  },
  {
    kode: "BK",
    nama: "Direktorat Jenderal Bina Konstruksi",
    unit: [
      "Sekretariat Direktorat Jenderal Bina Konstruksi",
      "Direktorat Usaha dan Kelembagaan Jasa Konstruksi",
      "Direktorat Kompetensi dan Produktivitas Tenaga Kerja Konstruksi",
      "Direktorat Pengadaan Jasa Konstruksi",
      "Direktorat Keselamatan dan Keberlanjutan Konstruksi",
      "Direktorat Kepatuhan Intern",
    ],
  },
  {
    kode: "PIPU",
    nama: "Direktorat Jenderal Pembiayaan Infrastruktur Pekerjaan Umum",
    unit: [
      "Sekretariat Direktorat Jenderal",
      "Direktorat Pengembangan Sistem dan Strategi Penyelenggaraan Pembiayaan",
      "Direktorat Pelaksanaan Pembiayaan Infrastruktur Sumber Daya Air",
      "Direktorat Pelaksanaan Pembiayaan Infrastruktur Bina Marga",
      "Direktorat Pelaksanaan Pembiayaan Infrastruktur Cipta Karya",
    ],
  },
  {
    kode: "ITJEN",
    nama: "Inspektorat Jenderal",
    unit: [
      "Sekretariat Inspektorat Jenderal",
      "Inspektorat I",
      "Inspektorat II",
      "Inspektorat III",
      "Inspektorat IV",
      "Inspektorat V",
      "Inspektorat VI",
    ],
  },
  {
    kode: "BPIW",
    nama: "Badan Pengembangan Infrastruktur Wilayah",
    unit: [
      "Sekretariat Badan",
      "Pusat Pengembangan Infrastruktur Wilayah Nasional",
      "Pusat Pengembangan Infrastruktur Pekerjaan Umum Wilayah I",
      "Pusat Pengembangan Infrastruktur Pekerjaan Umum Wilayah II",
      "Pusat Pengembangan Infrastruktur Pekerjaan Umum Wilayah III",
    ],
  },
  {
    kode: "BPSDM",
    nama: "Badan Pengembangan Sumber Daya Manusia",
    unit: [
      "Sekretariat Badan",
      "Pusat Pengelolaan Talenta",
      "Pusat Pengembangan Kompetensi Sumber Daya Air, Cipta Karya, dan Prasarana Strategis",
      "Pusat Pengembangan Kompetensi Bina Marga, Pembiayaan Infrastruktur, dan Pengembangan Infrastruktur Wilayah",
      "Pusat Pengembangan Kompetensi Manajemen",
    ],
  },
];

const UNOR_BY_KODE = Object.fromEntries(UNIT_ORGANISASI.map((u) => [u.kode, u]));

// =====================================================================
// KONSTANTA TAHAPAN, ENUM, DAN WARNA TAMPILAN
// =====================================================================

// deadlineDays hanya diisi untuk tahap dalam kendali internal Biro KOTL (T1, T2, T5).
const TAHAP_LIST = [
  { kode: "T1", label: "Telaah surat usulan", posisiBola: "BKO", deadlineDays: 7 },
  { kode: "T2", label: "Validasi dokumen", posisiBola: "BKO", deadlineDays: 14 },
  { kode: "T3", label: "Penyempurnaan di unit organisasi", posisiBola: "UNOR", deadlineDays: null },
  { kode: "T4", label: "Penjadwalan dan rapat PANRB", posisiBola: "PANRB", deadlineDays: null },
  { kode: "T5", label: "Pembahasan rancangan permen", posisiBola: "BKO", deadlineDays: 21 },
  { kode: "T6", label: "Konsultasi publik", posisiBola: "BKO", deadlineDays: null },
  { kode: "T7", label: "Harmonisasi Kemenkumham", posisiBola: "KUMHAM", deadlineDays: null },
  { kode: "T8", label: "Penetapan dan pengundangan", posisiBola: "KUMHAM", deadlineDays: null },
];

const TAHAP_BY_KODE = Object.fromEntries(TAHAP_LIST.map((t) => [t.kode, t]));

// Dokumen wajib per tahap, dipakai untuk indikator kelengkapan "N/M masuk".
const REQUIRED_DOCS_BY_TAHAP = {
  T1: ["surat_usulan"],
  T2: ["surat_usulan", "naskah_urgensi"],
  T3: ["surat_usulan"],
  T4: ["surat_usulan", "naskah_urgensi"],
  T5: ["surat_usulan", "naskah_urgensi", "rancangan_permen"],
  T6: ["surat_usulan", "naskah_urgensi", "rancangan_permen"],
  T7: ["surat_usulan", "naskah_urgensi", "rancangan_permen"],
  T8: ["surat_usulan", "naskah_urgensi", "rancangan_permen"],
};

const JENIS_PERUBAHAN_LIST = [
  { kode: "pembentukan", label: "Pembentukan" },
  { kode: "penggabungan", label: "Penggabungan" },
  { kode: "penghapusan", label: "Penghapusan" },
  { kode: "perubahan_nomenklatur", label: "Perubahan Nomenklatur" },
  { kode: "perubahan_tugas_fungsi", label: "Perubahan Tugas dan Fungsi" },
];
const JENIS_PERUBAHAN_LABEL = Object.fromEntries(JENIS_PERUBAHAN_LIST.map((j) => [j.kode, j.label]));

const POSISI_BOLA_LIST = [
  { kode: "BKO", label: "Biro KOTL", color: "blue" },
  { kode: "UNOR", label: "Unit Organisasi", color: "amber" },
  { kode: "PANRB", label: "Kementerian PANRB", color: "purple" },
  { kode: "KUMHAM", label: "Kementerian Hukum dan HAM", color: "teal" },
];
const POSISI_BOLA_BY_KODE = Object.fromEntries(POSISI_BOLA_LIST.map((p) => [p.kode, p]));

const DOKUMEN_JENIS_LIST = [
  { kode: "surat_usulan", label: "Surat Usulan" },
  { kode: "naskah_urgensi", label: "Naskah Urgensi" },
  { kode: "rancangan_permen", label: "Rancangan Peraturan Menteri" },
];
const DOKUMEN_JENIS_LABEL = Object.fromEntries(DOKUMEN_JENIS_LIST.map((d) => [d.kode, d.label]));

const STATUS_VALIDASI_LIST = [
  { kode: "belum_masuk", label: "Belum Masuk", color: "gray" },
  { kode: "diterima", label: "Diterima", color: "blue" },
  { kode: "dalam_validasi", label: "Dalam Validasi", color: "amber" },
  { kode: "perlu_perbaikan", label: "Perlu Perbaikan", color: "red" },
  { kode: "valid", label: "Valid", color: "green" },
];
const STATUS_VALIDASI_BY_KODE = Object.fromEntries(STATUS_VALIDASI_LIST.map((s) => [s.kode, s]));

const ROLES = [
  { kode: "kepala_biro", label: "Kepala Biro KOTL" },
  { kode: "pelaksana_biro", label: "Pelaksana Biro KOTL" },
  { kode: "unor", label: "Unit Organisasi Pengusul" },
];
const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.kode, r.label]));

const PILL_COLOR_CLASSES = {
  blue: "bg-blue-100 text-blue-800 border border-blue-200",
  amber: "bg-amber-100 text-amber-800 border border-amber-200",
  purple: "bg-purple-100 text-purple-800 border border-purple-200",
  teal: "bg-teal-100 text-teal-800 border border-teal-200",
  green: "bg-green-100 text-green-800 border border-green-200",
  red: "bg-red-100 text-red-800 border border-red-200",
  gray: "bg-slate-100 text-slate-700 border border-slate-200",
};

const BAR_COLOR_CLASSES = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
};

// Shared visible-focus treatment for every interactive element (buttons, links,
// keyboard-activatable rows/headers) — the app had zero focus indicators before this.
const FOCUS_RING = "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500";

// =====================================================================
// FUNGSI BANTU MURNI (tanpa React) — tanggal, durasi, dan aturan transisi
// =====================================================================

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromIso, toDateOrIso) {
  const from = new Date(`${fromIso}T00:00:00`);
  const to =
    typeof toDateOrIso === "string"
      ? new Date(`${toDateOrIso}T00:00:00`)
      : new Date(toDateOrIso.getFullYear(), toDateOrIso.getMonth(), toDateOrIso.getDate());
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

function formatTanggal(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`),
  );
}

function getStageAgeDays(usulan, today = new Date()) {
  return daysBetween(usulan.tanggalMasukTahap, today);
}

// Penanda lewat batas waktu HANYA berlaku untuk tahap dengan deadlineDays terisi (T1, T2, T5).
function isOverdue(usulan, today = new Date()) {
  if (usulan.status !== "aktif") return false;
  const tahap = TAHAP_BY_KODE[usulan.tahapSaatIni];
  if (!tahap || tahap.deadlineDays == null) return false;
  return getStageAgeDays(usulan, today) > tahap.deadlineDays;
}

function getDocCompleteness(dokumenList, usulanKode, putaran, tahapSaatIni) {
  const required = REQUIRED_DOCS_BY_TAHAP[tahapSaatIni] || [];
  const masuk = required.filter((jenis) =>
    dokumenList.some(
      (d) =>
        d.usulanKode === usulanKode &&
        d.putaran === putaran &&
        d.jenis === jenis &&
        d.statusValidasi !== "belum_masuk",
    ),
  ).length;
  return { masuk, total: required.length };
}

// Tabel aturan transisi tahap — satu-satunya sumber kebenaran untuk tombol aksi yang boleh
// ditampilkan maupun untuk validasi saat aksi dieksekusi. keTahap "SELESAI" adalah sentinel
// penanda pengundangan, bukan bagian dari enum tahapSaatIni (T1..T8).
const TRANSITION_MAP = {
  T1: [
    { toTahap: "T2", putaranDelta: 0, label: "Setujui, Lanjut Validasi Dokumen (T2)" },
    { toTahap: "T3", putaranDelta: 1, label: "Tolak, Kembalikan ke Unit Organisasi (T3)" },
  ],
  T2: [
    { toTahap: "T3", putaranDelta: 1, label: "Perlu Perbaikan, Kembalikan (T3)" },
    { toTahap: "T4", putaranDelta: 0, label: "Seluruh Dokumen Valid, Lanjut ke PANRB (T4)" },
  ],
  T3: [{ toTahap: "T1", putaranDelta: 0, label: "Surat Usulan Versi Baru Diajukan (T1)" }],
  T4: [
    { toTahap: "T5", putaranDelta: 0, label: "Lanjut Pembahasan Rancangan Permen (T5)" },
    { toTahap: "T6", putaranDelta: 0, label: "Lanjut Konsultasi Publik (T6)" },
    { toTahap: "T1", putaranDelta: 1, label: "Kembalikan ke Telaah Surat Usulan (T1)" },
    { toTahap: "T2", putaranDelta: 1, label: "Kembalikan ke Validasi Dokumen (T2)" },
  ],
  T5: [{ toTahap: "T6", putaranDelta: 0, label: "Lanjut Konsultasi Publik (T6)" }],
  T6: [{ toTahap: "T7", putaranDelta: 0, label: "Lanjut Harmonisasi Kemenkumham (T7)" }],
  T7: [{ toTahap: "T8", putaranDelta: 0, label: "Lanjut Penetapan dan Pengundangan (T8)" }],
  T8: [{ toTahap: "SELESAI", putaranDelta: 0, label: "Tetapkan dan Undangkan (Selesai)" }],
};

function validateTransition({ usulan, toTahap, keterangan }) {
  if (!keterangan || !keterangan.trim()) {
    return { ok: false, error: "Keterangan wajib diisi sebelum memindahkan tahap." };
  }
  const options = TRANSITION_MAP[usulan.tahapSaatIni] || [];
  const match = options.find((o) => o.toTahap === toTahap);
  if (!match) {
    return { ok: false, error: "Perpindahan tahap tidak diizinkan dari tahap saat ini." };
  }
  return { ok: true, putaranDelta: match.putaranDelta };
}

// Satu-satunya titik yang menghasilkan patch Usulan + baris LogStatus untuk setiap perpindahan tahap.
function applyTransition(usulan, { toTahap, keterangan, olehSiapa }, today = new Date()) {
  const validation = validateTransition({ usulan, toTahap, keterangan });
  if (!validation.ok) return { ok: false, error: validation.error };

  const isSelesai = toTahap === "SELESAI";
  const newPutaran = usulan.putaran + validation.putaranDelta;
  const newPosisiBola = isSelesai ? usulan.posisiBola : TAHAP_BY_KODE[toTahap].posisiBola;
  const tanggalIso = toIsoDate(today);
  const catatan = keterangan.trim();

  const usulanPatch = {
    tahapSaatIni: isSelesai ? usulan.tahapSaatIni : toTahap,
    posisiBola: newPosisiBola,
    putaran: newPutaran,
    tanggalMasukTahap: tanggalIso,
    catatanTerakhir: catatan,
    status: isSelesai ? "selesai" : usulan.status,
  };

  const logEntry = {
    usulanKode: usulan.kode,
    dariTahap: usulan.tahapSaatIni,
    keTahap: toTahap,
    dariPosisiBola: usulan.posisiBola,
    kePosisiBola: newPosisiBola,
    putaran: newPutaran,
    tanggal: tanggalIso,
    keterangan: catatan,
    olehSiapa,
  };

  return { ok: true, usulanPatch, logEntry };
}

// =====================================================================
// FUNGSI AGREGASI — dipakai Dasbor dan Laporan, selalu dihitung dari data
// =====================================================================

function computeSummary(usulanList, today = new Date()) {
  const aktif = usulanList.filter((u) => u.status === "aktif");
  return {
    aktif: aktif.length,
    menungguBKO: aktif.filter((u) => u.posisiBola === "BKO").length,
    overdue: aktif.filter((u) => isOverdue(u, today)).length,
    selesai: usulanList.filter((u) => u.status === "selesai").length,
  };
}

function computeStageChartData(usulanList) {
  return TAHAP_LIST.map((t) => ({
    tahapKode: t.kode,
    label: t.label,
    posisiBola: t.posisiBola,
    count: usulanList.filter((u) => u.status === "aktif" && u.tahapSaatIni === t.kode).length,
  }));
}

function computeAvgPutaranPerUnit(usulanList) {
  const groups = {};
  usulanList.forEach((u) => {
    if (!groups[u.unorKode]) groups[u.unorKode] = [];
    groups[u.unorKode].push(u.putaran);
  });
  return Object.entries(groups)
    .map(([unorKode, putaranArr]) => ({
      unorKode,
      unorNama: UNOR_BY_KODE[unorKode]?.nama ?? unorKode,
      jumlahUsulan: putaranArr.length,
      avgPutaran: putaranArr.reduce((a, b) => a + b, 0) / putaranArr.length,
    }))
    .sort((a, b) => b.avgPutaran - a.avgPutaran);
}

// Lama tinggal per tahap dihitung murni dari selisih tanggal antar-baris LogStatus
// (dan tanggalUsulanAwal sebagai titik masuk pertama ke T1), bukan input manual.
function computeAvgDwellPerStage(usulanList, logs) {
  const dwellByTahap = {};
  usulanList.forEach((u) => {
    const usulanLogs = logs
      .filter((l) => l.usulanKode === u.kode)
      .sort((a, b) => (a.tanggal < b.tanggal ? -1 : a.tanggal > b.tanggal ? 1 : 0));
    let prevDate = u.tanggalUsulanAwal;
    usulanLogs.forEach((log) => {
      const dwell = daysBetween(prevDate, log.tanggal);
      if (!dwellByTahap[log.dariTahap]) dwellByTahap[log.dariTahap] = [];
      dwellByTahap[log.dariTahap].push(dwell);
      prevDate = log.tanggal;
    });
  });
  return TAHAP_LIST.map((t) => {
    const arr = dwellByTahap[t.kode] || [];
    const avgDays = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    return { tahapKode: t.kode, label: t.label, avgDays, sampleCount: arr.length };
  });
}

function computeOverdueList(usulanList, today = new Date()) {
  return usulanList
    .filter((u) => isOverdue(u, today))
    .map((u) => ({
      ...u,
      umurHari: getStageAgeDays(u, today),
      batasHari: TAHAP_BY_KODE[u.tahapSaatIni].deadlineDays,
    }))
    .sort((a, b) => b.umurHari - a.umurHari);
}

function computeUnitRanking(usulanList) {
  const counts = {};
  usulanList.forEach((u) => {
    u.unitTerdampak.forEach((unit) => {
      counts[unit] = (counts[unit] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([unit, count]) => ({ unit, count }))
    .sort((a, b) => b.count - a.count);
}

// =====================================================================
// DATA CONTOH — 12 usulan lintas tahap, jenis perubahan, dan unit organisasi
// =====================================================================

const initialUsulan = [
  {
    kode: "SETJEN-2026-001",
    judul: "Pembentukan Unit Pengelola Data dan Informasi pada Biro Umum",
    unorKode: "SETJEN",
    unitTerdampak: ["Biro Umum"],
    jenisPerubahan: "pembentukan",
    tahapSaatIni: "T1",
    posisiBola: "BKO",
    putaran: 1,
    tanggalMasukTahap: "2026-07-28",
    tanggalUsulanAwal: "2026-07-28",
    status: "aktif",
    catatanTerakhir: "Surat usulan diterima, menunggu telaah awal.",
  },
  {
    kode: "SDA-2026-002",
    judul: "Perubahan Nomenklatur Direktorat Air Tanah dan Air Baku",
    unorKode: "SDA",
    unitTerdampak: ["Direktorat Air Tanah dan Air Baku"],
    jenisPerubahan: "perubahan_nomenklatur",
    tahapSaatIni: "T2",
    posisiBola: "BKO",
    putaran: 1,
    tanggalMasukTahap: "2026-07-20",
    tanggalUsulanAwal: "2026-07-05",
    status: "aktif",
    catatanTerakhir: "Naskah urgensi perlu dilengkapi data dukung analisis beban kerja.",
  },
  {
    kode: "BM-2026-003",
    judul:
      "Penggabungan Direktorat Preservasi Jalan dan Jembatan Wilayah I dan Wilayah II",
    unorKode: "BM",
    unitTerdampak: [
      "Direktorat Preservasi Jalan dan Jembatan Wilayah I",
      "Direktorat Preservasi Jalan dan Jembatan Wilayah II",
    ],
    jenisPerubahan: "penggabungan",
    tahapSaatIni: "T3",
    posisiBola: "UNOR",
    putaran: 2,
    tanggalMasukTahap: "2026-06-15",
    tanggalUsulanAwal: "2026-05-10",
    status: "aktif",
    catatanTerakhir: "Menunggu penyempurnaan naskah urgensi sesuai catatan validasi.",
  },
  {
    kode: "CK-2026-004",
    judul: "Penggabungan Direktorat Air Minum dan Direktorat Sanitasi",
    unorKode: "CK",
    unitTerdampak: ["Direktorat Air Minum", "Direktorat Sanitasi"],
    jenisPerubahan: "penggabungan",
    tahapSaatIni: "T4",
    posisiBola: "PANRB",
    putaran: 1,
    tanggalMasukTahap: "2026-05-02",
    tanggalUsulanAwal: "2026-04-01",
    status: "aktif",
    catatanTerakhir: "Menunggu jadwal rapat pembahasan bersama Kementerian PANRB.",
  },
  {
    kode: "PS-2026-005",
    judul: "Penghapusan Direktorat Infrastruktur Dukungan Pendidikan",
    unorKode: "PS",
    unitTerdampak: ["Direktorat Infrastruktur Dukungan Pendidikan"],
    jenisPerubahan: "penghapusan",
    tahapSaatIni: "T5",
    posisiBola: "BKO",
    putaran: 1,
    tanggalMasukTahap: "2026-07-13",
    tanggalUsulanAwal: "2026-03-01",
    status: "aktif",
    catatanTerakhir: "Menunggu rancangan Peraturan Menteri dari tim penyusun.",
  },
  {
    kode: "BK-2026-006",
    judul: "Perubahan Tugas dan Fungsi Direktorat Pengadaan Jasa Konstruksi",
    unorKode: "BK",
    unitTerdampak: ["Direktorat Pengadaan Jasa Konstruksi"],
    jenisPerubahan: "perubahan_tugas_fungsi",
    tahapSaatIni: "T6",
    posisiBola: "BKO",
    putaran: 1,
    tanggalMasukTahap: "2026-05-20",
    tanggalUsulanAwal: "2026-02-01",
    status: "aktif",
    catatanTerakhir: "Sedang proses konsultasi publik dengan pemangku kepentingan terkait.",
  },
  {
    kode: "PIPU-2026-007",
    judul:
      "Pembentukan Direktorat Baru melalui Pemekaran Direktorat Pelaksanaan Pembiayaan Infrastruktur Bina Marga",
    unorKode: "PIPU",
    unitTerdampak: ["Direktorat Pelaksanaan Pembiayaan Infrastruktur Bina Marga"],
    jenisPerubahan: "pembentukan",
    tahapSaatIni: "T7",
    posisiBola: "KUMHAM",
    putaran: 1,
    tanggalMasukTahap: "2026-06-01",
    tanggalUsulanAwal: "2025-11-01",
    status: "aktif",
    catatanTerakhir: "Dalam proses harmonisasi rancangan Peraturan Menteri bersama Kementerian Hukum dan HAM.",
  },
  {
    kode: "ITJEN-2026-008",
    judul: "Perubahan Nomenklatur Inspektorat VI menjadi Inspektorat Investigasi",
    unorKode: "ITJEN",
    unitTerdampak: ["Inspektorat VI"],
    jenisPerubahan: "perubahan_nomenklatur",
    tahapSaatIni: "T8",
    posisiBola: "KUMHAM",
    putaran: 1,
    tanggalMasukTahap: "2026-06-20",
    tanggalUsulanAwal: "2025-09-01",
    status: "aktif",
    catatanTerakhir: "Menunggu penetapan dan pengundangan oleh Kementerian Hukum dan HAM.",
  },
  {
    kode: "SDA-2026-009",
    judul: "Penggabungan Direktorat Sungai dan Pantai dengan Direktorat Irigasi dan Rawa",
    unorKode: "SDA",
    unitTerdampak: ["Direktorat Sungai dan Pantai", "Direktorat Irigasi dan Rawa"],
    jenisPerubahan: "penggabungan",
    tahapSaatIni: "T1",
    posisiBola: "BKO",
    putaran: 3,
    tanggalMasukTahap: "2026-07-30",
    tanggalUsulanAwal: "2026-01-05",
    status: "aktif",
    catatanTerakhir: "Surat usulan versi ketiga diterima, menunggu telaah ulang.",
  },
  {
    kode: "BPIW-2026-010",
    judul: "Pembentukan Pusat Pengembangan Infrastruktur Pekerjaan Umum Wilayah IV",
    unorKode: "BPIW",
    unitTerdampak: ["Pusat Pengembangan Infrastruktur Pekerjaan Umum Wilayah III"],
    jenisPerubahan: "pembentukan",
    tahapSaatIni: "T2",
    posisiBola: "BKO",
    putaran: 1,
    tanggalMasukTahap: "2026-08-04",
    tanggalUsulanAwal: "2026-08-01",
    status: "aktif",
    catatanTerakhir: "Dokumen naskah urgensi sedang dalam proses validasi.",
  },
  {
    kode: "BPSDM-2026-011",
    judul: "Perubahan Tugas dan Fungsi Pusat Pengelolaan Talenta",
    unorKode: "BPSDM",
    unitTerdampak: ["Pusat Pengelolaan Talenta"],
    jenisPerubahan: "perubahan_tugas_fungsi",
    tahapSaatIni: "T8",
    posisiBola: "KUMHAM",
    putaran: 1,
    tanggalMasukTahap: "2026-06-15",
    tanggalUsulanAwal: "2025-06-01",
    status: "selesai",
    catatanTerakhir: "Peraturan Menteri telah diundangkan, perubahan organisasi berlaku efektif.",
  },
  {
    kode: "BM-2026-012",
    judul: "Perubahan Nomenklatur Direktorat Preservasi Jalan dan Jembatan Wilayah I",
    unorKode: "BM",
    unitTerdampak: ["Direktorat Preservasi Jalan dan Jembatan Wilayah I"],
    jenisPerubahan: "perubahan_nomenklatur",
    tahapSaatIni: "T3",
    posisiBola: "UNOR",
    putaran: 2,
    tanggalMasukTahap: "2026-06-25",
    tanggalUsulanAwal: "2026-06-01",
    status: "aktif",
    catatanTerakhir: "Menunggu penyempurnaan dokumen sesuai catatan Biro KOTL.",
  },
];

let dokumenIdSeq = 0;
const nextDokumenId = () => `D${String((dokumenIdSeq += 1)).padStart(3, "0")}`;

const initialDokumen = [
  { usulanKode: "SETJEN-2026-001", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-07-28", statusValidasi: "diterima", catatanValidasi: "", validatorNama: "", tanggalValidasi: "" },

  { usulanKode: "SDA-2026-002", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-07-05", statusValidasi: "valid", catatanValidasi: "Dokumen lengkap dan sesuai format.", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2026-07-18" },
  { usulanKode: "SDA-2026-002", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-07-19", statusValidasi: "perlu_perbaikan", catatanValidasi: "Analisis beban kerja belum memadai, perlu dilengkapi data dukung.", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2026-07-22" },

  { usulanKode: "BM-2026-003", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-05-12", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Siti Rahma", tanggalValidasi: "2026-05-18" },
  { usulanKode: "BM-2026-003", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-05-25", statusValidasi: "perlu_perbaikan", catatanValidasi: "Kajian dampak organisasi terhadap dua wilayah kerja belum jelas.", validatorNama: "Siti Rahma", tanggalValidasi: "2026-06-14" },

  { usulanKode: "CK-2026-004", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-04-03", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Bambang Prakoso", tanggalValidasi: "2026-04-08" },
  { usulanKode: "CK-2026-004", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-04-15", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Bambang Prakoso", tanggalValidasi: "2026-04-28" },

  { usulanKode: "PS-2026-005", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-03-03", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Dewi Anggraini", tanggalValidasi: "2026-03-08" },
  { usulanKode: "PS-2026-005", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-03-15", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Dewi Anggraini", tanggalValidasi: "2026-03-22" },

  { usulanKode: "BK-2026-006", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-02-03", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Eko Wibowo", tanggalValidasi: "2026-02-08" },
  { usulanKode: "BK-2026-006", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-02-15", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Eko Wibowo", tanggalValidasi: "2026-02-22" },
  { usulanKode: "BK-2026-006", putaran: 1, jenis: "rancangan_permen", versi: 1, tanggalTerima: "2026-03-10", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Eko Wibowo", tanggalValidasi: "2026-03-18" },

  { usulanKode: "PIPU-2026-007", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2025-11-05", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Fitri Handayani", tanggalValidasi: "2025-11-12" },
  { usulanKode: "PIPU-2026-007", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2025-11-20", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Fitri Handayani", tanggalValidasi: "2025-11-28" },
  { usulanKode: "PIPU-2026-007", putaran: 1, jenis: "rancangan_permen", versi: 1, tanggalTerima: "2025-12-15", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Fitri Handayani", tanggalValidasi: "2025-12-22" },

  { usulanKode: "ITJEN-2026-008", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2025-09-05", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Guntur Saputra", tanggalValidasi: "2025-09-12" },
  { usulanKode: "ITJEN-2026-008", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2025-09-20", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Guntur Saputra", tanggalValidasi: "2025-09-28" },
  { usulanKode: "ITJEN-2026-008", putaran: 1, jenis: "rancangan_permen", versi: 1, tanggalTerima: "2025-10-25", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Guntur Saputra", tanggalValidasi: "2025-11-02" },

  { usulanKode: "SDA-2026-009", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-01-06", statusValidasi: "perlu_perbaikan", catatanValidasi: "Kajian penggabungan dua direktorat belum memuat analisis risiko.", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2026-01-18" },
  { usulanKode: "SDA-2026-009", putaran: 2, jenis: "surat_usulan", versi: 2, tanggalTerima: "2026-02-16", statusValidasi: "perlu_perbaikan", catatanValidasi: "Masih diperlukan kajian dampak terhadap layanan operasional.", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2026-02-28" },
  { usulanKode: "SDA-2026-009", putaran: 3, jenis: "surat_usulan", versi: 3, tanggalTerima: "2026-07-30", statusValidasi: "diterima", catatanValidasi: "", validatorNama: "", tanggalValidasi: "" },

  { usulanKode: "BPIW-2026-010", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-08-01", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Hesti Kurniawati", tanggalValidasi: "2026-08-03" },
  { usulanKode: "BPIW-2026-010", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-08-05", statusValidasi: "dalam_validasi", catatanValidasi: "", validatorNama: "", tanggalValidasi: "" },

  { usulanKode: "BPSDM-2026-011", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2025-06-05", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2025-06-12" },
  { usulanKode: "BPSDM-2026-011", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2025-06-20", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2025-06-28" },
  { usulanKode: "BPSDM-2026-011", putaran: 1, jenis: "rancangan_permen", versi: 1, tanggalTerima: "2025-07-10", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Ahmad Fauzi", tanggalValidasi: "2025-07-18" },

  { usulanKode: "BM-2026-012", putaran: 1, jenis: "surat_usulan", versi: 1, tanggalTerima: "2026-06-02", statusValidasi: "valid", catatanValidasi: "", validatorNama: "Siti Rahma", tanggalValidasi: "2026-06-06" },
  { usulanKode: "BM-2026-012", putaran: 1, jenis: "naskah_urgensi", versi: 1, tanggalTerima: "2026-06-10", statusValidasi: "perlu_perbaikan", catatanValidasi: "Perubahan nomenklatur belum disertai dasar pertimbangan yang memadai.", validatorNama: "Siti Rahma", tanggalValidasi: "2026-06-24" },
].map((d) => ({ ...d, id: nextDokumenId() }));

let logIdSeq = 0;
const nextLogId = () => `L${String((logIdSeq += 1)).padStart(3, "0")}`;

const initialLogs = [
  { usulanKode: "SDA-2026-002", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-07-20", keterangan: "Surat usulan disetujui, dilanjutkan ke tahap validasi dokumen.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "BM-2026-003", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-05-20", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BM-2026-003", dariTahap: "T2", keTahap: "T3", dariPosisiBola: "BKO", kePosisiBola: "UNOR", putaran: 2, tanggal: "2026-06-15", keterangan: "Naskah urgensi belum memadai, dikembalikan untuk disempurnakan.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "CK-2026-004", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-04-10", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "CK-2026-004", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2026-05-02", keterangan: "Seluruh dokumen valid, diusulkan untuk dijadwalkan rapat bersama Kementerian PANRB.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "PS-2026-005", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-03-10", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "PS-2026-005", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2026-03-25", keterangan: "Seluruh dokumen valid.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "PS-2026-005", dariTahap: "T4", keTahap: "T5", dariPosisiBola: "PANRB", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-07-13", keterangan: "Hasil rapat PANRB: lanjut ke pembahasan rancangan Peraturan Menteri.", olehSiapa: "Kementerian PANRB" },

  { usulanKode: "BK-2026-006", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-02-10", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BK-2026-006", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2026-02-24", keterangan: "Seluruh dokumen valid.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BK-2026-006", dariTahap: "T4", keTahap: "T5", dariPosisiBola: "PANRB", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-03-05", keterangan: "Hasil rapat PANRB: lanjut ke pembahasan rancangan Peraturan Menteri.", olehSiapa: "Kementerian PANRB" },
  { usulanKode: "BK-2026-006", dariTahap: "T5", keTahap: "T6", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-05-20", keterangan: "Rancangan Peraturan Menteri selesai dibahas, dilanjutkan ke konsultasi publik.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "PIPU-2026-007", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-11-15", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "PIPU-2026-007", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2025-12-01", keterangan: "Seluruh dokumen valid.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "PIPU-2026-007", dariTahap: "T4", keTahap: "T5", dariPosisiBola: "PANRB", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-12-20", keterangan: "Hasil rapat PANRB: lanjut ke pembahasan rancangan Peraturan Menteri.", olehSiapa: "Kementerian PANRB" },
  { usulanKode: "PIPU-2026-007", dariTahap: "T5", keTahap: "T6", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-02-10", keterangan: "Rancangan selesai dibahas, dilanjutkan ke konsultasi publik.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "PIPU-2026-007", dariTahap: "T6", keTahap: "T7", dariPosisiBola: "BKO", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2026-06-01", keterangan: "Konsultasi publik selesai, dokumen diteruskan untuk harmonisasi.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "ITJEN-2026-008", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-09-15", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "ITJEN-2026-008", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2025-10-01", keterangan: "Seluruh dokumen valid.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "ITJEN-2026-008", dariTahap: "T4", keTahap: "T5", dariPosisiBola: "PANRB", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-10-20", keterangan: "Hasil rapat PANRB: lanjut ke pembahasan rancangan Peraturan Menteri.", olehSiapa: "Kementerian PANRB" },
  { usulanKode: "ITJEN-2026-008", dariTahap: "T5", keTahap: "T6", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-12-15", keterangan: "Rancangan selesai dibahas, dilanjutkan ke konsultasi publik.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "ITJEN-2026-008", dariTahap: "T6", keTahap: "T7", dariPosisiBola: "BKO", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2026-03-01", keterangan: "Konsultasi publik selesai, dokumen diteruskan untuk harmonisasi.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "ITJEN-2026-008", dariTahap: "T7", keTahap: "T8", dariPosisiBola: "KUMHAM", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2026-06-20", keterangan: "Harmonisasi selesai, dilanjutkan ke tahap penetapan dan pengundangan.", olehSiapa: "Kementerian Hukum dan HAM" },

  { usulanKode: "SDA-2026-009", dariTahap: "T1", keTahap: "T3", dariPosisiBola: "BKO", kePosisiBola: "UNOR", putaran: 2, tanggal: "2026-01-20", keterangan: "Surat usulan ditolak, perlu disusun ulang.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "SDA-2026-009", dariTahap: "T3", keTahap: "T1", dariPosisiBola: "UNOR", kePosisiBola: "BKO", putaran: 2, tanggal: "2026-02-15", keterangan: "Surat usulan versi kedua diajukan.", olehSiapa: "Direktorat Jenderal Sumber Daya Air" },
  { usulanKode: "SDA-2026-009", dariTahap: "T1", keTahap: "T3", dariPosisiBola: "BKO", kePosisiBola: "UNOR", putaran: 3, tanggal: "2026-03-01", keterangan: "Surat usulan kembali ditolak, masih terdapat kekurangan substansi.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "SDA-2026-009", dariTahap: "T3", keTahap: "T1", dariPosisiBola: "UNOR", kePosisiBola: "BKO", putaran: 3, tanggal: "2026-07-30", keterangan: "Surat usulan versi ketiga diajukan.", olehSiapa: "Direktorat Jenderal Sumber Daya Air" },

  { usulanKode: "BPIW-2026-010", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-08-04", keterangan: "Surat usulan disetujui, dilanjutkan ke validasi dokumen.", olehSiapa: "Pelaksana Biro KOTL" },

  { usulanKode: "BPSDM-2026-011", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-06-15", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T2", keTahap: "T4", dariPosisiBola: "BKO", kePosisiBola: "PANRB", putaran: 1, tanggal: "2025-07-01", keterangan: "Seluruh dokumen valid.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T4", keTahap: "T5", dariPosisiBola: "PANRB", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-07-20", keterangan: "Hasil rapat PANRB: lanjut ke pembahasan rancangan Peraturan Menteri.", olehSiapa: "Kementerian PANRB" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T5", keTahap: "T6", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2025-09-10", keterangan: "Rancangan selesai dibahas, dilanjutkan ke konsultasi publik.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T6", keTahap: "T7", dariPosisiBola: "BKO", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2025-11-05", keterangan: "Konsultasi publik selesai, dokumen diteruskan untuk harmonisasi.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T7", keTahap: "T8", dariPosisiBola: "KUMHAM", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2026-02-01", keterangan: "Harmonisasi selesai, dilanjutkan ke tahap penetapan dan pengundangan.", olehSiapa: "Kementerian Hukum dan HAM" },
  { usulanKode: "BPSDM-2026-011", dariTahap: "T8", keTahap: "SELESAI", dariPosisiBola: "KUMHAM", kePosisiBola: "KUMHAM", putaran: 1, tanggal: "2026-06-15", keterangan: "Peraturan Menteri ditetapkan dan diundangkan.", olehSiapa: "Kementerian Hukum dan HAM" },

  { usulanKode: "BM-2026-012", dariTahap: "T1", keTahap: "T2", dariPosisiBola: "BKO", kePosisiBola: "BKO", putaran: 1, tanggal: "2026-06-08", keterangan: "Surat usulan disetujui.", olehSiapa: "Pelaksana Biro KOTL" },
  { usulanKode: "BM-2026-012", dariTahap: "T2", keTahap: "T3", dariPosisiBola: "BKO", kePosisiBola: "UNOR", putaran: 2, tanggal: "2026-06-25", keterangan: "Naskah urgensi perlu diperbaiki, dikembalikan ke unit organisasi.", olehSiapa: "Pelaksana Biro KOTL" },
].map((l) => ({ ...l, id: nextLogId() }));

// =====================================================================
// KOMPONEN PRESENTASI
// =====================================================================

function Pill({ children, color = "gray" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${PILL_COLOR_CLASSES[color]}`}
    >
      {children}
    </span>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 text-slate-900",
    danger: "border-red-200 text-red-700",
    success: "border-green-200 text-green-700",
  }[tone];
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${toneClasses}`}>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function StageBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-slate-800">Jumlah Usulan per Tahap</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.tahapKode} className="flex items-center gap-3">
            <div className="w-8 shrink-0 text-xs font-medium text-slate-500">{d.tahapKode}</div>
            <div className="flex-1">
              <div className="h-5 w-full overflow-hidden rounded bg-slate-100">
                <div
                  className={`h-full ${BAR_COLOR_CLASSES[POSISI_BOLA_BY_KODE[d.posisiBola].color]} transition-all`}
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-6 shrink-0 text-right text-sm font-semibold text-slate-700">{d.count}</div>
            <div className="w-56 shrink-0 truncate text-xs text-slate-500" title={d.label}>
              {d.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
        {POSISI_BOLA_LIST.map((p) => (
          <div key={p.kode} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-sm ${BAR_COLOR_CLASSES[p.color]}`} />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBar({ filters, onChange }) {
  const handle = (field) => (e) => onChange({ ...filters, [field]: e.target.value });
  return (
    <div className="print:hidden flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div>
        <label htmlFor="filter-unor" className="block text-xs font-medium text-slate-500">
          Unit Organisasi
        </label>
        <select
          id="filter-unor"
          className={`mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={filters.unorKode}
          onChange={handle("unorKode")}
        >
          <option value="">Semua Unit</option>
          {UNIT_ORGANISASI.map((u) => (
            <option key={u.kode} value={u.kode}>
              {u.kode}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-tahap" className="block text-xs font-medium text-slate-500">
          Tahap
        </label>
        <select
          id="filter-tahap"
          className={`mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={filters.tahap}
          onChange={handle("tahap")}
        >
          <option value="">Semua Tahap</option>
          {TAHAP_LIST.map((t) => (
            <option key={t.kode} value={t.kode}>
              {t.kode} — {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-jenis" className="block text-xs font-medium text-slate-500">
          Jenis Perubahan
        </label>
        <select
          id="filter-jenis"
          className={`mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={filters.jenisPerubahan}
          onChange={handle("jenisPerubahan")}
        >
          <option value="">Semua Jenis</option>
          {JENIS_PERUBAHAN_LIST.map((j) => (
            <option key={j.kode} value={j.kode}>
              {j.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-posisi" className="block text-xs font-medium text-slate-500">
          Posisi Bola
        </label>
        <select
          id="filter-posisi"
          className={`mt-1 rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={filters.posisiBola}
          onChange={handle("posisiBola")}
        >
          <option value="">Semua Posisi</option>
          {POSISI_BOLA_LIST.map((p) => (
            <option key={p.kode} value={p.kode}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => onChange({ unorKode: "", tahap: "", jenisPerubahan: "", posisiBola: "" })}
        className={`rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 ${FOCUS_RING}`}
      >
        Reset Filter
      </button>
    </div>
  );
}

function SortHeader({ label, field, sort, onSortChange }) {
  const active = sort.field === field;
  const handleActivate = () => onSortChange(field);
  return (
    <th
      role="button"
      tabIndex={0}
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={`cursor-pointer select-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 ${FOCUS_RING}`}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      {label}{" "}
      <span aria-hidden="true" className={active ? "text-slate-600" : "text-slate-300"}>
        {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );
}

function ProposalTable({ usulanList, dokumenList, onSelect, sort, onSortChange, today }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <SortHeader label="Kode / Unit" field="kode" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Jenis Perubahan" field="jenisPerubahan" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Tahap" field="tahapSaatIni" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Posisi Bola" field="posisiBola" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Putaran" field="putaran" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Umur di Tahap" field="umur" sort={sort} onSortChange={onSortChange} />
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dokumen
            </th>
            <th className="px-2 py-2" aria-hidden="true"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {usulanList.map((u) => {
            const tahap = TAHAP_BY_KODE[u.tahapSaatIni];
            const posisi = POSISI_BOLA_BY_KODE[u.posisiBola];
            const overdue = isOverdue(u, today);
            const umur = getStageAgeDays(u, today);
            const { masuk, total } = getDocCompleteness(dokumenList, u.kode, u.putaran, u.tahapSaatIni);
            return (
              <tr
                key={u.kode}
                tabIndex={0}
                role="button"
                aria-label={`Buka detail usulan ${u.kode}`}
                onClick={() => onSelect(u.kode)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(u.kode);
                  }
                }}
                className={`group cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500`}
              >
                <td className="px-3 py-2.5">
                  <div className="font-medium text-slate-900">{u.kode}</div>
                  <div
                    className="max-w-[220px] truncate text-xs text-slate-500"
                    title={UNOR_BY_KODE[u.unorKode]?.nama}
                  >
                    {u.unorKode} — {u.judul}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-700">{JENIS_PERUBAHAN_LABEL[u.jenisPerubahan]}</td>
                <td className="px-3 py-2.5 text-sm text-slate-700">
                  {u.tahapSaatIni} — {tahap.label}
                </td>
                <td className="px-3 py-2.5">
                  <Pill color={posisi.color}>{posisi.label}</Pill>
                </td>
                <td className="px-3 py-2.5 text-center text-sm text-slate-700">{u.putaran}</td>
                <td className="px-3 py-2.5 text-sm">
                  <span className={overdue ? "font-semibold text-red-600" : "text-slate-700"}>
                    {umur} hari
                    {overdue ? (
                      <>
                        {" "}
                        <span aria-hidden="true">⚠</span> Lewat Batas
                      </>
                    ) : null}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-700">
                  {masuk}/{total} masuk
                </td>
                <td className="px-2 py-2.5 text-slate-300 group-hover:text-slate-500 group-focus-visible:text-slate-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </td>
              </tr>
            );
          })}
          {usulanList.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                Tidak ada usulan yang sesuai dengan filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Timeline({ usulan, logs }) {
  const maxPutaran = usulan.putaran;
  const rounds = [];
  for (let r = 1; r <= maxPutaran; r += 1) {
    rounds.push({
      putaran: r,
      logs: logs.filter((l) => l.putaran === r).sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1)),
    });
  }
  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <div key={round.putaran} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            {round.putaran === 1 ? "Putaran ke-1 — Pengajuan Awal" : `Putaran ke-${round.putaran} — Pengajuan Ulang`}
          </h4>
          <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
            {round.putaran === 1 && (
              <li className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400" />
                <div className="text-xs text-slate-500">{formatTanggal(usulan.tanggalUsulanAwal)}</div>
                <div className="text-sm font-medium text-slate-800">Usulan diterima</div>
              </li>
            )}
            {round.logs.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div className="text-xs text-slate-500">{formatTanggal(log.tanggal)}</div>
                <div className="text-sm font-medium text-slate-800">
                  {TAHAP_BY_KODE[log.dariTahap]?.label ?? log.dariTahap} &rarr;{" "}
                  {log.keTahap === "SELESAI" ? "Selesai (Diundangkan)" : `${log.keTahap} — ${TAHAP_BY_KODE[log.keTahap]?.label}`}
                </div>
                <div className="text-sm text-slate-600">{log.keterangan}</div>
                <div className="text-xs text-slate-500">oleh {log.olehSiapa}</div>
              </li>
            ))}
            {round.logs.length === 0 && round.putaran !== 1 && (
              <li className="text-sm text-slate-500">Belum ada perpindahan tahap pada putaran ini.</li>
            )}
          </ol>
        </div>
      ))}
    </div>
  );
}

function DocumentTable({ dokumenList, usulanKode }) {
  const rounds = [...new Set(dokumenList.filter((d) => d.usulanKode === usulanKode).map((d) => d.putaran))].sort(
    (a, b) => b - a,
  );
  return (
    <div className="space-y-4">
      {rounds.map((putaran) => (
        <div key={putaran} className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            Dokumen Putaran ke-{putaran}
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Jenis Dokumen</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Versi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Terima</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status Validasi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Validator</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dokumenList
                .filter((d) => d.usulanKode === usulanKode && d.putaran === putaran)
                .map((d) => {
                  const status = STATUS_VALIDASI_BY_KODE[d.statusValidasi];
                  return (
                    <tr key={d.id}>
                      <td className="px-3 py-2.5 text-sm text-slate-700">{DOKUMEN_JENIS_LABEL[d.jenis]}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">v{d.versi}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">{formatTanggal(d.tanggalTerima)}</td>
                      <td className="px-3 py-2.5">
                        <Pill color={status.color}>{status.label}</Pill>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-700">{d.validatorNama || "-"}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600">{d.catatanValidasi || "-"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
      {rounds.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          Belum ada dokumen tercatat untuk usulan ini.
        </div>
      )}
    </div>
  );
}

function TransitionActions({ usulan, onTransition }) {
  const [openTo, setOpenTo] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState("");

  if (usulan.status !== "aktif") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Usulan ini sudah berstatus {usulan.status === "selesai" ? "selesai" : usulan.status} dan tidak dapat dipindahkan tahapnya lagi.
      </div>
    );
  }

  const options = TRANSITION_MAP[usulan.tahapSaatIni] || [];
  const isTerminalOpen = openTo === "SELESAI";

  const handleConfirm = (toTahap) => {
    const result = onTransition(toTahap, keterangan);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpenTo(null);
    setKeterangan("");
    setError("");
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-slate-700">Pindahkan Tahap</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isTerminal = opt.toTahap === "SELESAI";
          const isOpen = openTo === opt.toTahap;
          const activeClasses = isTerminal
            ? "border-green-600 bg-green-600 text-white"
            : "border-blue-600 bg-blue-600 text-white";
          const inactiveClasses = isTerminal
            ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
            : "border-slate-300 text-slate-700 hover:bg-slate-50";
          return (
            <button
              key={opt.toTahap}
              type="button"
              onClick={() => {
                setOpenTo(isOpen ? null : opt.toTahap);
                setError("");
              }}
              className={`rounded border px-3 py-1.5 text-sm font-medium ${FOCUS_RING} ${
                isOpen ? activeClasses : inactiveClasses
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {openTo && (
        <div className="mt-3 space-y-2">
          <label htmlFor="transition-keterangan" className="block text-xs font-medium text-slate-500">
            Keterangan (wajib diisi, akan tercatat pada log)
          </label>
          <textarea
            id="transition-keterangan"
            className={`w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
          />
          {error && (
            <div role="alert" aria-live="assertive" className="text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleConfirm(openTo)}
              className={`rounded px-3 py-1.5 text-sm font-medium text-white ${FOCUS_RING} ${
                isTerminalOpen ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isTerminalOpen ? "Konfirmasi — Tindakan Tidak Dapat Dibatalkan" : "Konfirmasi"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenTo(null);
                setKeterangan("");
                setError("");
              }}
              className={`rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 ${FOCUS_RING}`}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EselonIIMultiSelect({ eselonIKode, selected, onChange }) {
  const unit = UNOR_BY_KODE[eselonIKode]?.unit ?? [];
  const toggle = (name) => {
    if (selected.includes(name)) onChange(selected.filter((s) => s !== name));
    else onChange([...selected, name]);
  };
  if (!eselonIKode) {
    return <div className="text-sm text-slate-500">Pilih unit organisasi eselon I terlebih dahulu.</div>;
  }
  return (
    <div className="max-h-48 space-y-1.5 overflow-y-auto rounded border border-slate-300 p-2">
      {unit.map((name) => (
        <label key={name} className="flex items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={selected.includes(name)}
            onChange={() => toggle(name)}
          />
          {name}
        </label>
      ))}
    </div>
  );
}

function RoleSwitcher({ role, onChange }) {
  return (
    <select
      aria-label="Ganti peran pengguna"
      className={`rounded border border-slate-300 bg-white px-2 py-1.5 text-sm ${FOCUS_RING}`}
      value={role}
      onChange={(e) => onChange(e.target.value)}
    >
      {ROLES.map((r) => (
        <option key={r.kode} value={r.kode}>
          {r.label}
        </option>
      ))}
    </select>
  );
}

function UnorUnitPicker({ unorKode, onChange }) {
  return (
    <select
      aria-label="Melihat sebagai unit organisasi"
      className={`rounded border border-slate-300 bg-white px-2 py-1.5 text-sm ${FOCUS_RING}`}
      value={unorKode}
      onChange={(e) => onChange(e.target.value)}
    >
      {UNIT_ORGANISASI.map((u) => (
        <option key={u.kode} value={u.kode}>
          Melihat sebagai: {u.kode}
        </option>
      ))}
    </select>
  );
}

function compareUsulanField(a, b, field, today) {
  let av;
  let bv;
  if (field === "tahapSaatIni") {
    av = TAHAP_LIST.findIndex((t) => t.kode === a.tahapSaatIni);
    bv = TAHAP_LIST.findIndex((t) => t.kode === b.tahapSaatIni);
  } else if (field === "umur") {
    av = getStageAgeDays(a, today);
    bv = getStageAgeDays(b, today);
  } else {
    av = a[field];
    bv = b[field];
  }
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
}

// =====================================================================
// HALAMAN
// =====================================================================

function DasborPage({ usulanList, dokumenList, filters, onFilterChange, onSelect, sort, onSortChange, today }) {
  const summary = useMemo(() => computeSummary(usulanList, today), [usulanList, today]);
  const chartData = useMemo(() => computeStageChartData(usulanList), [usulanList]);

  const filtered = useMemo(
    () =>
      usulanList.filter((u) => {
        if (filters.unorKode && u.unorKode !== filters.unorKode) return false;
        if (filters.tahap && u.tahapSaatIni !== filters.tahap) return false;
        if (filters.jenisPerubahan && u.jenisPerubahan !== filters.jenisPerubahan) return false;
        if (filters.posisiBola && u.posisiBola !== filters.posisiBola) return false;
        return true;
      }),
    [usulanList, filters],
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const result = compareUsulanField(a, b, sort.field, today);
      return sort.direction === "asc" ? result : -result;
    });
    return copy;
  }, [filtered, sort, today]);

  const handleSortChange = (field) => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ field, direction: "asc" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Usulan Aktif" value={summary.aktif} />
        <SummaryCard label="Menunggu Tindakan BKO" value={summary.menungguBKO} />
        <SummaryCard
          label="Lewat Batas Waktu"
          value={summary.overdue}
          tone={summary.overdue > 0 ? "danger" : "default"}
        />
        <SummaryCard label="Sudah Diundangkan" value={summary.selesai} tone="success" />
      </div>
      <StageBarChart data={chartData} />
      <FilterBar filters={filters} onChange={onFilterChange} />
      <ProposalTable
        usulanList={sorted}
        dokumenList={dokumenList}
        onSelect={onSelect}
        sort={sort}
        onSortChange={handleSortChange}
        today={today}
      />
    </div>
  );
}

function DetailUsulanPage({ usulan, dokumenList, logs, onBack, onTransition, canEdit }) {
  const usulanLogs = logs.filter((l) => l.usulanKode === usulan.kode);
  const posisi = POSISI_BOLA_BY_KODE[usulan.posisiBola];
  const tahap = TAHAP_BY_KODE[usulan.tahapSaatIni];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className={`print:hidden text-sm text-blue-600 hover:underline rounded ${FOCUS_RING}`}
      >
        <span aria-hidden="true">&larr;</span> Kembali ke Dasbor
      </button>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-slate-500">{usulan.kode}</div>
            <h2 className="text-xl font-semibold text-slate-900">{usulan.judul}</h2>
            <div className="mt-1 text-sm text-slate-500">
              Pengusul: {UNOR_BY_KODE[usulan.unorKode]?.nama} ({usulan.unorKode})
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Pill color={posisi.color}>{posisi.label}</Pill>
            <div className="text-xs text-slate-500">
              {usulan.tahapSaatIni} — {tahap.label} · Putaran ke-{usulan.putaran}
            </div>
            {usulan.status === "selesai" && <Pill color="green">Selesai</Pill>}
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Catatan terakhir: </span>
          {usulan.catatanTerakhir}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-base font-semibold text-slate-800">Jenis Perubahan &amp; Unit Eselon II Terdampak</h3>
        <div className="mb-2">
          <Pill color="gray">{JENIS_PERUBAHAN_LABEL[usulan.jenisPerubahan]}</Pill>
        </div>
        <ul className="list-inside list-disc text-sm text-slate-700">
          {usulan.unitTerdampak.map((unit) => (
            <li key={unit}>{unit}</li>
          ))}
        </ul>
      </div>

      {canEdit && <TransitionActions usulan={usulan} onTransition={onTransition} />}

      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Lini Masa</h3>
        <Timeline usulan={usulan} logs={usulanLogs} />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Dokumen</h3>
        <DocumentTable dokumenList={dokumenList} usulanKode={usulan.kode} />
      </div>
    </div>
  );
}

function TambahUsulanForm({ onAddUsulan }) {
  const [judul, setJudul] = useState("");
  const [unorKode, setUnorKode] = useState("");
  const [unitTerdampak, setUnitTerdampak] = useState([]);
  const [jenisPerubahan, setJenisPerubahan] = useState(JENIS_PERUBAHAN_LIST[0].kode);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!judul.trim() || !unorKode || unitTerdampak.length === 0) {
      setFeedback({ type: "error", text: "Judul, unit organisasi, dan minimal satu unit terdampak wajib diisi." });
      return;
    }
    onAddUsulan({ judul: judul.trim(), unorKode, unitTerdampak, jenisPerubahan });
    setJudul("");
    setUnorKode("");
    setUnitTerdampak([]);
    setJenisPerubahan(JENIS_PERUBAHAN_LIST[0].kode);
    setFeedback({ type: "success", text: "Usulan baru berhasil dicatat." });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label htmlFor="tambah-judul" className="block text-xs font-medium text-slate-500">
          Judul Usulan
        </label>
        <input
          id="tambah-judul"
          type="text"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="tambah-unor" className="block text-xs font-medium text-slate-500">
          Unit Organisasi Pengusul (Eselon I)
        </label>
        <select
          id="tambah-unor"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={unorKode}
          onChange={(e) => {
            setUnorKode(e.target.value);
            setUnitTerdampak([]);
          }}
        >
          <option value="">Pilih unit organisasi</option>
          {UNIT_ORGANISASI.map((u) => (
            <option key={u.kode} value={u.kode}>
              {u.kode} — {u.nama}
            </option>
          ))}
        </select>
      </div>
      <fieldset className="min-w-0 border-0 p-0 m-0">
        <legend className="block text-xs font-medium text-slate-500">Unit Eselon II Terdampak</legend>
        <div className="mt-1">
          <EselonIIMultiSelect eselonIKode={unorKode} selected={unitTerdampak} onChange={setUnitTerdampak} />
        </div>
      </fieldset>
      <div>
        <label htmlFor="tambah-jenis" className="block text-xs font-medium text-slate-500">
          Jenis Perubahan
        </label>
        <select
          id="tambah-jenis"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={jenisPerubahan}
          onChange={(e) => setJenisPerubahan(e.target.value)}
        >
          {JENIS_PERUBAHAN_LIST.map((j) => (
            <option key={j.kode} value={j.kode}>
              {j.label}
            </option>
          ))}
        </select>
      </div>
      {feedback && (
        <div
          role="alert"
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
          className={
            feedback.type === "error"
              ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              : "rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          }
        >
          {feedback.text}
        </div>
      )}
      <button
        type="submit"
        className={`rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${FOCUS_RING}`}
      >
        Simpan Usulan
      </button>
    </form>
  );
}

function CatatDokumenForm({ usulanList, onAddDokumen }) {
  const aktifList = usulanList.filter((u) => u.status === "aktif");
  const [usulanKode, setUsulanKode] = useState("");
  const [jenis, setJenis] = useState(DOKUMEN_JENIS_LIST[0].kode);
  const [tanggalTerima, setTanggalTerima] = useState("");
  const [feedback, setFeedback] = useState(null);

  const selectedUsulan = aktifList.find((u) => u.kode === usulanKode);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!usulanKode || !tanggalTerima) {
      setFeedback({ type: "error", text: "Usulan dan tanggal terima wajib diisi." });
      return;
    }
    onAddDokumen({ usulanKode, putaran: selectedUsulan.putaran, jenis, tanggalTerima });
    setTanggalTerima("");
    setFeedback({ type: "success", text: "Penerimaan dokumen berhasil dicatat." });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label htmlFor="dokumen-usulan" className="block text-xs font-medium text-slate-500">
          Usulan
        </label>
        <select
          id="dokumen-usulan"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={usulanKode}
          onChange={(e) => setUsulanKode(e.target.value)}
        >
          <option value="">Pilih usulan</option>
          {aktifList.map((u) => (
            <option key={u.kode} value={u.kode}>
              {u.kode} — {u.judul}
            </option>
          ))}
        </select>
        {selectedUsulan && (
          <div className="mt-1 text-xs text-slate-500">Akan dicatat pada putaran ke-{selectedUsulan.putaran}.</div>
        )}
      </div>
      <div>
        <label htmlFor="dokumen-jenis" className="block text-xs font-medium text-slate-500">
          Jenis Dokumen
        </label>
        <select
          id="dokumen-jenis"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
        >
          {DOKUMEN_JENIS_LIST.map((d) => (
            <option key={d.kode} value={d.kode}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dokumen-tanggal" className="block text-xs font-medium text-slate-500">
          Tanggal Terima
        </label>
        <input
          id="dokumen-tanggal"
          type="date"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={tanggalTerima}
          onChange={(e) => setTanggalTerima(e.target.value)}
        />
      </div>
      {feedback && (
        <div
          role="alert"
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
          className={
            feedback.type === "error"
              ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              : "rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          }
        >
          {feedback.text}
        </div>
      )}
      <button
        type="submit"
        className={`rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${FOCUS_RING}`}
      >
        Catat Penerimaan
      </button>
    </form>
  );
}

function CatatValidasiForm({ usulanList, dokumenList, onValidateDokumen }) {
  const aktifList = usulanList.filter((u) => u.status === "aktif");
  const [usulanKode, setUsulanKode] = useState("");
  const [dokumenId, setDokumenId] = useState("");
  const [statusValidasi, setStatusValidasi] = useState("valid");
  const [catatanValidasi, setCatatanValidasi] = useState("");
  const [validatorNama, setValidatorNama] = useState("");
  const [feedback, setFeedback] = useState(null);

  const selectedUsulan = aktifList.find((u) => u.kode === usulanKode);
  const dokumenPilihan = selectedUsulan
    ? dokumenList.filter((d) => d.usulanKode === usulanKode && d.putaran === selectedUsulan.putaran)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!dokumenId || !validatorNama.trim()) {
      setFeedback({ type: "error", text: "Dokumen dan nama validator wajib diisi." });
      return;
    }
    onValidateDokumen(dokumenId, {
      statusValidasi,
      catatanValidasi: catatanValidasi.trim(),
      validatorNama: validatorNama.trim(),
    });
    setCatatanValidasi("");
    setFeedback({ type: "success", text: "Hasil validasi berhasil dicatat." });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label htmlFor="validasi-usulan" className="block text-xs font-medium text-slate-500">
          Usulan
        </label>
        <select
          id="validasi-usulan"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={usulanKode}
          onChange={(e) => {
            setUsulanKode(e.target.value);
            setDokumenId("");
          }}
        >
          <option value="">Pilih usulan</option>
          {aktifList.map((u) => (
            <option key={u.kode} value={u.kode}>
              {u.kode} — {u.judul}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="validasi-dokumen" className="block text-xs font-medium text-slate-500">
          Dokumen (putaran berjalan)
        </label>
        <select
          id="validasi-dokumen"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={dokumenId}
          onChange={(e) => setDokumenId(e.target.value)}
        >
          <option value="">Pilih dokumen</option>
          {dokumenPilihan.map((d) => (
            <option key={d.id} value={d.id}>
              {DOKUMEN_JENIS_LABEL[d.jenis]} (v{d.versi}) — status saat ini: {STATUS_VALIDASI_BY_KODE[d.statusValidasi].label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="validasi-status" className="block text-xs font-medium text-slate-500">
          Status Validasi
        </label>
        <select
          id="validasi-status"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={statusValidasi}
          onChange={(e) => setStatusValidasi(e.target.value)}
        >
          {STATUS_VALIDASI_LIST.filter((s) => s.kode !== "belum_masuk").map((s) => (
            <option key={s.kode} value={s.kode}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="validasi-catatan" className="block text-xs font-medium text-slate-500">
          Catatan Validasi
        </label>
        <textarea
          id="validasi-catatan"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          rows={2}
          value={catatanValidasi}
          onChange={(e) => setCatatanValidasi(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="validasi-nama" className="block text-xs font-medium text-slate-500">
          Nama Validator
        </label>
        <input
          id="validasi-nama"
          type="text"
          className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${FOCUS_RING}`}
          value={validatorNama}
          onChange={(e) => setValidatorNama(e.target.value)}
        />
      </div>
      {feedback && (
        <div
          role="alert"
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
          className={
            feedback.type === "error"
              ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              : "rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          }
        >
          {feedback.text}
        </div>
      )}
      <button
        type="submit"
        className={`rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${FOCUS_RING}`}
      >
        Simpan Hasil Validasi
      </button>
    </form>
  );
}

function FormulirPage({ usulanList, dokumenList, onAddUsulan, onAddDokumen, onValidateDokumen }) {
  const [activeTab, setActiveTab] = useState("tambah");
  const tabs = [
    { kode: "tambah", label: "Tambah Usulan Baru" },
    { kode: "dokumen", label: "Catat Penerimaan Dokumen" },
    { kode: "validasi", label: "Catat Hasil Validasi" },
  ];
  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.kode}
            type="button"
            role="tab"
            aria-selected={activeTab === t.kode}
            onClick={() => setActiveTab(t.kode)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${FOCUS_RING} ${
              activeTab === t.kode
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === "tambah" && <TambahUsulanForm onAddUsulan={onAddUsulan} />}
      {activeTab === "dokumen" && <CatatDokumenForm usulanList={usulanList} onAddDokumen={onAddDokumen} />}
      {activeTab === "validasi" && (
        <CatatValidasiForm usulanList={usulanList} dokumenList={dokumenList} onValidateDokumen={onValidateDokumen} />
      )}
    </div>
  );
}

function LaporanPage({ usulanList, logs, today }) {
  const avgPutaran = useMemo(() => computeAvgPutaranPerUnit(usulanList), [usulanList]);
  const avgDwell = useMemo(() => computeAvgDwellPerStage(usulanList, logs), [usulanList, logs]);
  const overdueList = useMemo(() => computeOverdueList(usulanList, today), [usulanList, today]);
  const ranking = useMemo(() => computeUnitRanking(usulanList), [usulanList]);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Rata-Rata Putaran per Unit Organisasi</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Unit</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Jumlah Usulan</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Rata-Rata Putaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {avgPutaran.map((row) => (
                <tr key={row.unorKode}>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900" title={row.unorNama}>
                    {row.unorKode} — {row.unorNama}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{row.jumlahUsulan}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{row.avgPutaran.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Rata-Rata Waktu Tinggal per Tahap</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Tahap</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Rata-Rata Hari</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Jumlah Sampel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {avgDwell.map((row) => (
                <tr key={row.tahapKode}>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">
                    {row.tahapKode} — {row.label}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">
                    {row.avgDays === null ? "-" : `${row.avgDays.toFixed(1)} hari`}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{row.sampleCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Usulan yang Melewati Batas Waktu</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Kode</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Tahap</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Umur</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Batas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {overdueList.map((u) => (
                <tr key={u.kode}>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{u.kode}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">
                    {u.tahapSaatIni} — {TAHAP_BY_KODE[u.tahapSaatIni].label}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-red-600">{u.umurHari} hari</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{u.batasHari} hari</td>
                </tr>
              ))}
              {overdueList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-500">
                    Tidak ada usulan yang melewati batas waktu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800">Unit Eselon II Paling Sering Menjadi Objek Usulan</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Unit Eselon II</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Jumlah Usulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ranking.map((row) => (
                <tr key={row.unit}>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{row.unit}</td>
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Dedicated print-ready summary — always renders the same portfolio snapshot
// regardless of which tab was open when "Cetak Ringkasan" was pressed.
function CetakRingkasanPage({ usulanList, dokumenList, today }) {
  const summary = useMemo(() => computeSummary(usulanList, today), [usulanList, today]);
  const chartData = useMemo(() => computeStageChartData(usulanList), [usulanList]);
  const sort = { field: "kode", direction: "asc" };
  const sorted = useMemo(() => {
    const copy = [...usulanList];
    copy.sort((a, b) => compareUsulanField(a, b, sort.field, today));
    return copy;
  }, [usulanList, today]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Ringkasan Usulan Perubahan Organisasi</h2>
        <p className="text-sm text-slate-500">Dicetak pada {formatTanggal(toIsoDate(today))}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Usulan Aktif" value={summary.aktif} />
        <SummaryCard label="Menunggu Tindakan BKO" value={summary.menungguBKO} />
        <SummaryCard
          label="Lewat Batas Waktu"
          value={summary.overdue}
          tone={summary.overdue > 0 ? "danger" : "default"}
        />
        <SummaryCard label="Sudah Diundangkan" value={summary.selesai} tone="success" />
      </div>
      <StageBarChart data={chartData} />
      <ProposalTable
        usulanList={sorted}
        dokumenList={dokumenList}
        onSelect={() => {}}
        sort={sort}
        onSortChange={() => {}}
        today={today}
      />
    </div>
  );
}

// =====================================================================
// APLIKASI UTAMA
// =====================================================================

export default function App() {
  const today = useMemo(() => new Date(), []);

  const [role, setRole] = useState("kepala_biro");
  const [unorViewingAs, setUnorViewingAs] = useState(UNIT_ORGANISASI[0].kode);
  const [currentView, setCurrentView] = useState("dasbor");
  const [selectedKode, setSelectedKode] = useState(null);

  const [usulanList, setUsulanList] = useState(initialUsulan);
  const [dokumenList, setDokumenList] = useState(initialDokumen);
  const [logs, setLogs] = useState(initialLogs);

  const [filters, setFilters] = useState({ unorKode: "", tahap: "", jenisPerubahan: "", posisiBola: "" });
  const [sort, setSort] = useState({ field: "kode", direction: "asc" });

  const [usulanSeq, setUsulanSeq] = useState(initialUsulan.length);
  const [dokumenSeq, setDokumenSeq] = useState(dokumenIdSeq);
  const [logSeq, setLogSeq] = useState(logIdSeq);

  // Remembers which tab was open before "Cetak Ringkasan" was pressed, so printing
  // always shows the same portfolio summary but returns the user to where they were.
  const viewBeforePrintRef = useRef("dasbor");
  useEffect(() => {
    if (currentView === "cetak") {
      window.print();
      setCurrentView(viewBeforePrintRef.current);
    }
  }, [currentView]);

  const visibleUsulanList = useMemo(() => {
    if (role === "unor") return usulanList.filter((u) => u.unorKode === unorViewingAs);
    return usulanList;
  }, [usulanList, role, unorViewingAs]);

  const selectedUsulan = usulanList.find((u) => u.kode === selectedKode) ?? null;

  const handleSelectUsulan = (kode) => {
    setSelectedKode(kode);
    setCurrentView("detail");
  };

  const handleAddUsulan = ({ judul, unorKode, unitTerdampak, jenisPerubahan }) => {
    const seq = usulanSeq + 1;
    setUsulanSeq(seq);
    const kode = `${unorKode}-2026-${String(seq).padStart(3, "0")}`;
    const tanggalIso = toIsoDate(today);
    setUsulanList((prev) => [
      ...prev,
      {
        kode,
        judul,
        unorKode,
        unitTerdampak,
        jenisPerubahan,
        tahapSaatIni: "T1",
        posisiBola: "BKO",
        putaran: 1,
        tanggalMasukTahap: tanggalIso,
        tanggalUsulanAwal: tanggalIso,
        status: "aktif",
        catatanTerakhir: "Usulan baru dicatat, menunggu telaah awal.",
      },
    ]);
  };

  const handleAddDokumen = ({ usulanKode, putaran, jenis, tanggalTerima }) => {
    const seq = dokumenSeq + 1;
    setDokumenSeq(seq);
    setDokumenList((prev) => [
      ...prev,
      {
        id: `D${String(seq).padStart(3, "0")}`,
        usulanKode,
        putaran,
        jenis,
        versi: prev.filter((d) => d.usulanKode === usulanKode && d.putaran === putaran && d.jenis === jenis).length + 1,
        tanggalTerima,
        statusValidasi: "diterima",
        catatanValidasi: "",
        validatorNama: "",
        tanggalValidasi: "",
      },
    ]);
  };

  const handleValidateDokumen = (dokumenId, { statusValidasi, catatanValidasi, validatorNama }) => {
    const tanggalIso = toIsoDate(today);
    setDokumenList((prev) =>
      prev.map((d) =>
        String(d.id) === String(dokumenId)
          ? { ...d, statusValidasi, catatanValidasi, validatorNama, tanggalValidasi: tanggalIso }
          : d,
      ),
    );
  };

  const handleTransition = (toTahap, keterangan) => {
    if (!selectedUsulan) return { ok: false, error: "Usulan tidak ditemukan." };
    const result = applyTransition(
      selectedUsulan,
      { toTahap, keterangan, olehSiapa: ROLE_LABEL[role] },
      today,
    );
    if (!result.ok) return result;

    const seq = logSeq + 1;
    setLogSeq(seq);
    setUsulanList((prev) =>
      prev.map((u) => (u.kode === selectedUsulan.kode ? { ...u, ...result.usulanPatch } : u)),
    );
    setLogs((prev) => [...prev, { ...result.logEntry, id: `L${String(seq).padStart(3, "0")}` }]);
    return { ok: true };
  };

  const handleExportJson = () => {
    const payload = { usulan: usulanList, dokumen: dokumenList, logs };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usulan-perubahan-organisasi-${toIsoDate(today)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintSummary = () => {
    viewBeforePrintRef.current = currentView;
    setCurrentView("cetak");
  };

  const canSeeFormulir = role === "pelaksana_biro";
  const canEditDetail = role === "pelaksana_biro";

  const navItems = [
    { kode: "dasbor", label: "Dasbor" },
    ...(canSeeFormulir ? [{ kode: "formulir", label: "Formulir Pencatatan" }] : []),
    { kode: "laporan", label: "Laporan" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="print:hidden border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900">
              Dasbor Pemantauan Usulan Perubahan Organisasi
            </h1>
            <p className="text-xs text-slate-500">
              Biro Kepegawaian, Organisasi, dan Tata Laksana — Sekretariat Jenderal Kementerian Pekerjaan Umum
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {role === "unor" && <UnorUnitPicker unorKode={unorViewingAs} onChange={setUnorViewingAs} />}
            <RoleSwitcher
              role={role}
              onChange={(newRole) => {
                setRole(newRole);
                setCurrentView("dasbor");
                setSelectedKode(null);
              }}
            />
            <button
              type="button"
              onClick={handleExportJson}
              className={`rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 ${FOCUS_RING}`}
            >
              Ekspor JSON
            </button>
            <button
              type="button"
              onClick={handlePrintSummary}
              className={`rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 ${FOCUS_RING}`}
            >
              Cetak Ringkasan
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4">
          {navItems.map((item) => (
            <button
              key={item.kode}
              type="button"
              aria-current={currentView === item.kode ? "page" : undefined}
              onClick={() => {
                setCurrentView(item.kode);
                setSelectedKode(null);
              }}
              className={`border-b-2 px-3 py-2 text-sm font-medium ${FOCUS_RING} ${
                currentView === item.kode
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {currentView === "dasbor" && (
          <DasborPage
            usulanList={visibleUsulanList}
            dokumenList={dokumenList}
            filters={filters}
            onFilterChange={setFilters}
            onSelect={handleSelectUsulan}
            sort={sort}
            onSortChange={setSort}
            today={today}
          />
        )}
        {currentView === "detail" && selectedUsulan && (
          <DetailUsulanPage
            usulan={selectedUsulan}
            dokumenList={dokumenList}
            logs={logs}
            onBack={() => setCurrentView("dasbor")}
            onTransition={handleTransition}
            canEdit={canEditDetail}
          />
        )}
        {currentView === "formulir" && canSeeFormulir && (
          <FormulirPage
            usulanList={usulanList}
            dokumenList={dokumenList}
            onAddUsulan={handleAddUsulan}
            onAddDokumen={handleAddDokumen}
            onValidateDokumen={handleValidateDokumen}
          />
        )}
        {currentView === "laporan" && (
          <LaporanPage usulanList={visibleUsulanList} logs={logs} today={today} />
        )}
        {currentView === "cetak" && (
          <CetakRingkasanPage usulanList={visibleUsulanList} dokumenList={dokumenList} today={today} />
        )}
      </main>
    </div>
  );
}
