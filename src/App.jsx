import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Redirect, Route, Router, Switch, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import * as db from "./db.js";

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
  { kode: "T1", romawi: "I", label: "Telaah surat usulan", posisiBola: "BKO", deadlineDays: 7 },
  { kode: "T2", romawi: "II", label: "Validasi dokumen", posisiBola: "BKO", deadlineDays: 14 },
  { kode: "T3", romawi: "III", label: "Penyempurnaan di unit organisasi", posisiBola: "UNOR", deadlineDays: null },
  { kode: "T4", romawi: "IV", label: "Penjadwalan dan rapat PANRB", posisiBola: "PANRB", deadlineDays: null },
  { kode: "T5", romawi: "V", label: "Pembahasan rancangan permen", posisiBola: "BKO", deadlineDays: 21 },
  { kode: "T6", romawi: "VI", label: "Konsultasi publik", posisiBola: "BKO", deadlineDays: null },
  { kode: "T7", romawi: "VII", label: "Harmonisasi Kemenkumham", posisiBola: "KUMHAM", deadlineDays: null },
  { kode: "T8", romawi: "VIII", label: "Penetapan dan pengundangan", posisiBola: "KUMHAM", deadlineDays: null },
];

const TAHAP_BY_KODE = Object.fromEntries(TAHAP_LIST.map((t) => [t.kode, t]));
const ROMAWI_BY_KODE = Object.fromEntries(TAHAP_LIST.map((t) => [t.kode, t.romawi]));

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

// Single source of truth for status color treatment — pill badge + bar-chart fill —
// keyed by the same color name used throughout POSISI_BOLA_LIST/STATUS_VALIDASI_LIST.
// dark: variants are baked in now so step 4 (dark mode) needs no changes here.
const STATUS_TONE = {
  blue: {
    pill: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    bar: "bg-blue-500 dark:bg-blue-400",
  },
  amber: {
    pill: "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    bar: "bg-amber-500 dark:bg-amber-400",
  },
  purple: {
    pill: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
    bar: "bg-purple-500 dark:bg-purple-400",
  },
  teal: {
    pill: "bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
    bar: "bg-teal-500 dark:bg-teal-400",
  },
  green: {
    pill: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
    bar: "bg-green-500 dark:bg-green-400",
  },
  red: {
    pill: "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
    bar: "bg-red-500 dark:bg-red-400",
  },
  gray: {
    pill: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    bar: "bg-slate-500 dark:bg-slate-400",
  },
};

// Shared visible-focus treatment for every interactive element (buttons, links,
// keyboard-activatable rows/headers) — the app had zero focus indicators before this.
const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 dark:ring-offset-slate-900";

// Shared card-surface treatment, factored out of the 17 duplicated call sites below so
// dark mode (step 4) only needs to touch this one constant instead of every site.
const CARD_BASE = "rounded-lg border bg-white shadow-sm dark:bg-slate-800";
const CARD_SURFACE = `${CARD_BASE} border-slate-200 dark:border-slate-700`;

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

// Shared by ProposalTable's desktop <table> rows and mobile card rows so the two
// layouts never compute overdue/umur/dokumen status differently.
function getProposalRowFields(u, dokumenList, today) {
  const tahap = TAHAP_BY_KODE[u.tahapSaatIni];
  const posisi = POSISI_BOLA_BY_KODE[u.posisiBola];
  const overdue = isOverdue(u, today);
  const umur = getStageAgeDays(u, today);
  const { masuk, total } = getDocCompleteness(dokumenList, u.kode, u.putaran, u.tahapSaatIni);
  return { tahap, posisi, overdue, umur, masuk, total };
}

// Tabel aturan transisi tahap — satu-satunya sumber kebenaran untuk tombol aksi yang boleh
// ditampilkan maupun untuk validasi saat aksi dieksekusi. keTahap "SELESAI" adalah sentinel
// penanda pengundangan, bukan bagian dari enum tahapSaatIni (T1..T8).
const TRANSITION_MAP = {
  T1: [
    { toTahap: "T2", putaranDelta: 0, label: "Setujui, Lanjut Validasi Dokumen (Tahap II)" },
    { toTahap: "T3", putaranDelta: 1, label: "Tolak, Kembalikan ke Unit Organisasi (Tahap III)" },
  ],
  T2: [
    { toTahap: "T3", putaranDelta: 1, label: "Perlu Perbaikan, Kembalikan (Tahap III)" },
    { toTahap: "T4", putaranDelta: 0, label: "Seluruh Dokumen Valid, Lanjut ke PANRB (Tahap IV)" },
  ],
  T3: [{ toTahap: "T1", putaranDelta: 0, label: "Surat Usulan Versi Baru Diajukan (Tahap I)" }],
  T4: [
    { toTahap: "T5", putaranDelta: 0, label: "Lanjut Pembahasan Rancangan Permen (Tahap V)" },
    { toTahap: "T6", putaranDelta: 0, label: "Lanjut Konsultasi Publik (Tahap VI)" },
    { toTahap: "T1", putaranDelta: 1, label: "Kembalikan ke Telaah Surat Usulan (Tahap I)" },
    { toTahap: "T2", putaranDelta: 1, label: "Kembalikan ke Validasi Dokumen (Tahap II)" },
  ],
  T5: [{ toTahap: "T6", putaranDelta: 0, label: "Lanjut Konsultasi Publik (Tahap VI)" }],
  T6: [{ toTahap: "T7", putaranDelta: 0, label: "Lanjut Harmonisasi Kemenkumham (Tahap VII)" }],
  T7: [{ toTahap: "T8", putaranDelta: 0, label: "Lanjut Penetapan dan Pengundangan (Tahap VIII)" }],
  T8: [{ toTahap: "SELESAI", putaranDelta: 0, label: "Tetapkan dan Undangkan (Selesai)" }],
};

function validateTransition({ usulan, toTahap, keterangan, manual = false }) {
  if (!keterangan || !keterangan.trim()) {
    return { ok: false, error: "Keterangan wajib diisi sebelum memindahkan tahap." };
  }
  if (manual) {
    if (!TAHAP_BY_KODE[toTahap] || toTahap === usulan.tahapSaatIni) {
      return { ok: false, error: "Tahap tujuan tidak valid." };
    }
    return { ok: true, putaranDelta: 0 };
  }
  const options = TRANSITION_MAP[usulan.tahapSaatIni] || [];
  const match = options.find((o) => o.toTahap === toTahap);
  if (!match) {
    return { ok: false, error: "Perpindahan tahap tidak diizinkan dari tahap saat ini." };
  }
  return { ok: true, putaranDelta: match.putaranDelta };
}

// Validasi tanggal tahap yang diedit ulang tetap konsisten secara kronologis dengan
// entri tetangganya (urutan kemunculan asli, bukan urutan tampilan yang diurutkan tanggal).
function validateTanggalEdit({ newTanggal, prevTanggal, nextTanggal, todayIso }) {
  if (!newTanggal) {
    return { ok: false, error: "Tanggal wajib diisi." };
  }
  if (prevTanggal && newTanggal < prevTanggal) {
    return { ok: false, error: `Tanggal tidak boleh sebelum ${formatTanggal(prevTanggal)}.` };
  }
  if (nextTanggal && newTanggal > nextTanggal) {
    return { ok: false, error: `Tanggal tidak boleh sesudah ${formatTanggal(nextTanggal)}.` };
  }
  if (!nextTanggal && newTanggal > todayIso) {
    return { ok: false, error: "Tanggal tidak boleh di masa depan." };
  }
  return { ok: true };
}

// Satu-satunya titik yang menghasilkan patch Usulan + baris LogStatus untuk setiap perpindahan tahap.
function applyTransition(usulan, { toTahap, keterangan, olehSiapa, manual = false }, today = new Date()) {
  const validation = validateTransition({ usulan, toTahap, keterangan, manual });
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
    manual,
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
// KOMPONEN PRESENTASI
// =====================================================================

// Shared input treatment for every text input, select, and textarea.
const INPUT_BASE = `w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`;

const BUTTON_VARIANT_CLASSES = {
  secondary:
    "rounded border border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700",
  primary: "rounded bg-blue-600 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  success: "rounded bg-green-600 font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
  warning: "rounded bg-amber-600 font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
  danger: "rounded bg-red-600 font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  ghost: "rounded text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
  link: "rounded text-sm text-blue-600 hover:underline dark:text-blue-400",
};

function Button({ variant = "secondary", size = "sm", className = "", type = "button", children, ...rest }) {
  const sizeClasses = variant === "link" ? "" : size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-sm";
  return (
    <button
      type={type}
      className={`${sizeClasses} ${BUTTON_VARIANT_CLASSES[variant]} ${FOCUS_RING} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Underline-indicator tab button, shared by FormulirPage's tabs and the header nav.
function TabButton({ active, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      className={`border-b-2 px-3 py-2 text-sm font-medium ${FOCUS_RING} ${
        active
          ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400"
          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function Card({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`${CARD_SURFACE} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

function FormField({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Input({ id, className = "", ...rest }) {
  return <input id={id} className={`${INPUT_BASE} ${className}`} {...rest} />;
}

function Select({ id, className = "", children, ...rest }) {
  return (
    <select id={id} className={`${INPUT_BASE} ${className}`} {...rest}>
      {children}
    </select>
  );
}

function Textarea({ id, className = "", ...rest }) {
  return <textarea id={id} className={`${INPUT_BASE} ${className}`} {...rest} />;
}

function FormFeedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div
      role="alert"
      aria-live={feedback.type === "error" ? "assertive" : "polite"}
      className={
        feedback.type === "error"
          ? "rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          : "rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
      }
    >
      {feedback.text}
    </div>
  );
}

function EmptyState({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {message}
      </td>
    </tr>
  );
}

// Minimal dependency-free modal: focus trap, Escape-to-close, focus-return-to-trigger.
function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocusedRef.current = document.activeElement;
    const dialogEl = dialogRef.current;
    const focusable = dialogEl
      ? Array.from(dialogEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      : [];
    focusable[0]?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`w-full max-w-md ${CARD_SURFACE} p-4`}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 id="modal-title" className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <Button variant="ghost" className="!p-1 leading-none" aria-label="Tutup dialog" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Pill({ children, color = "gray" }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[color].pill}`}
    >
      {children}
    </span>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100",
    danger: "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
    success: "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400",
  }[tone];
  return (
    <div className={`${CARD_BASE} p-4 ${toneClasses}`}>
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function StageBarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <Card className="p-4">
      <h3 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Jumlah Usulan per Tahap</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.tahapKode} className="flex items-center gap-3">
            <div className="w-8 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{ROMAWI_BY_KODE[d.tahapKode]}</div>
            <div className="flex-1">
              <div className="h-5 w-full overflow-hidden rounded bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full ${STATUS_TONE[POSISI_BOLA_BY_KODE[d.posisiBola].color].bar} transition-all motion-reduce:transition-none`}
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-6 shrink-0 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">{d.count}</div>
            <div className="w-56 shrink-0 truncate text-xs text-slate-500 dark:text-slate-400" title={d.label}>
              {d.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 dark:border-slate-700">
        {POSISI_BOLA_LIST.map((p) => (
          <div key={p.kode} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className={`h-2.5 w-2.5 rounded-sm ${STATUS_TONE[p.color].bar}`} />
            {p.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilterBar({ filters, onChange }) {
  const handle = (field) => (e) => onChange({ ...filters, [field]: e.target.value });
  return (
    <Card className="print:hidden grid grid-cols-2 items-end gap-3 p-3 sm:grid-cols-4">
      <div>
        <label htmlFor="filter-unor" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Unit Organisasi
        </label>
        <select
          id="filter-unor"
          className={`mt-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
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
        <label htmlFor="filter-tahap" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Tahap
        </label>
        <select
          id="filter-tahap"
          className={`mt-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
          value={filters.tahap}
          onChange={handle("tahap")}
        >
          <option value="">Semua Tahap</option>
          {TAHAP_LIST.map((t) => (
            <option key={t.kode} value={t.kode}>
              {t.romawi} — {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-jenis" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Jenis Perubahan
        </label>
        <select
          id="filter-jenis"
          className={`mt-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
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
        <label htmlFor="filter-posisi" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Penanggung Jawab Saat Ini
        </label>
        <select
          id="filter-posisi"
          className={`mt-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
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
      <Button onClick={() => onChange({ unorKode: "", tahap: "", jenisPerubahan: "", posisiBola: "" })}>
        Atur Ulang Filter
      </Button>
    </Card>
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
      className={`cursor-pointer select-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 ${FOCUS_RING}`}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      {label}{" "}
      <span aria-hidden="true" className={active ? "text-slate-600 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"}>
        {active ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );
}

function RowActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Menu aksi usulan"
        onClick={() => setOpen((v) => !v)}
        className={`rounded px-1.5 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300 ${FOCUS_RING}`}
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <div role="menu" className={`absolute right-0 z-10 mt-1 w-32 ${CARD_SURFACE} py-1 shadow-lg`}>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className={`block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 ${FOCUS_RING}`}
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

function ProposalRowCard({ u, dokumenList, onSelect, today, canDelete, onDelete }) {
  const { tahap, posisi, overdue, umur, masuk, total } = getProposalRowFields(u, dokumenList, today);
  return (
    <Card
      as="div"
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
      className={`cursor-pointer p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${FOCUS_RING}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-slate-900 dark:text-slate-100">{u.kode}</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={UNOR_BY_KODE[u.unorKode]?.nama}>
            {u.unorKode} — {u.judul}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill color={posisi.color}>{posisi.label}</Pill>
          {canDelete && <RowActionsMenu onDelete={() => onDelete(u.kode)} />}
        </div>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Jenis Perubahan</dt>
          <dd className="text-slate-700 dark:text-slate-300">{JENIS_PERUBAHAN_LABEL[u.jenisPerubahan]}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Tahap</dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {ROMAWI_BY_KODE[u.tahapSaatIni]} — {tahap.label}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Putaran</dt>
          <dd className="text-slate-700 dark:text-slate-300">{u.putaran}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Umur di Tahap</dt>
          <dd className={overdue ? "font-semibold text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}>
            {umur} hari
            {overdue ? (
              <>
                {" "}
                <span aria-hidden="true">⚠</span> Lewat Batas
              </>
            ) : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Dokumen</dt>
          <dd className="text-slate-700 dark:text-slate-300">
            {masuk}/{total} masuk
          </dd>
        </div>
      </dl>
    </Card>
  );
}

function ProposalTable({ usulanList, dokumenList, onSelect, sort, onSortChange, today, canDelete, onDelete }) {
  return (
    <>
      <Card className="hidden overflow-x-auto sm:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              <SortHeader label="Kode / Unit" field="kode" sort={sort} onSortChange={onSortChange} />
              <SortHeader label="Jenis Perubahan" field="jenisPerubahan" sort={sort} onSortChange={onSortChange} />
              <SortHeader label="Tahap" field="tahapSaatIni" sort={sort} onSortChange={onSortChange} />
              <SortHeader label="Penanggung Jawab Saat Ini" field="posisiBola" sort={sort} onSortChange={onSortChange} />
              <SortHeader label="Putaran" field="putaran" sort={sort} onSortChange={onSortChange} />
              <SortHeader label="Umur di Tahap" field="umur" sort={sort} onSortChange={onSortChange} />
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dokumen
              </th>
              {canDelete && <th className="px-2 py-2" aria-hidden="true"></th>}
              <th className="px-2 py-2" aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {usulanList.map((u) => {
              const { tahap, posisi, overdue, umur, masuk, total } = getProposalRowFields(u, dokumenList, today);
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
                  className={`group cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-700/50`}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{u.kode}</div>
                    <div
                      className="max-w-[220px] truncate text-xs text-slate-500 dark:text-slate-400"
                      title={UNOR_BY_KODE[u.unorKode]?.nama}
                    >
                      {u.unorKode} — {u.judul}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{JENIS_PERUBAHAN_LABEL[u.jenisPerubahan]}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                    {ROMAWI_BY_KODE[u.tahapSaatIni]} — {tahap.label}
                  </td>
                  <td className="px-3 py-2.5">
                    <Pill color={posisi.color}>{posisi.label}</Pill>
                  </td>
                  <td className="px-3 py-2.5 text-center text-sm text-slate-700 dark:text-slate-300">{u.putaran}</td>
                  <td className="px-3 py-2.5 text-sm">
                    <span className={overdue ? "font-semibold text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}>
                      {umur} hari
                      {overdue ? (
                        <>
                          {" "}
                          <span aria-hidden="true">⚠</span> Lewat Batas
                        </>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                    {masuk}/{total} masuk
                  </td>
                  {canDelete && (
                    <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu onDelete={() => onDelete(u.kode)} />
                    </td>
                  )}
                  <td className="px-2 py-2.5 text-slate-300 group-hover:text-slate-500 group-focus-visible:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 dark:group-focus-visible:text-slate-400">
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
              <EmptyState colSpan={canDelete ? 9 : 8} message="Tidak ada usulan yang sesuai dengan filter." />
            )}
          </tbody>
        </table>
      </Card>
      <div className="space-y-3 sm:hidden">
        {usulanList.map((u) => (
          <ProposalRowCard
            key={u.kode}
            u={u}
            dokumenList={dokumenList}
            onSelect={onSelect}
            today={today}
            canDelete={canDelete}
            onDelete={onDelete}
          />
        ))}
        {usulanList.length === 0 && (
          <Card className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Tidak ada usulan yang sesuai dengan filter.
          </Card>
        )}
      </div>
    </>
  );
}

// Ikon pensil kecil (Heroicons "pencil-square", 20x20) dipakai tombol ubah tanggal.
function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M13.488 2.513a1.75 1.75 0 012.475 2.474L6.75 14.199l-3.25.75.75-3.25 9.238-9.186zM12.25 4.25l3 3" />
    </svg>
  );
}

function Timeline({ usulan, logs, canEdit = false, onEditTanggalAwal, onEditLogTanggal }) {
  const maxPutaran = usulan.putaran;
  const rounds = [];
  for (let r = 1; r <= maxPutaran; r += 1) {
    rounds.push({
      putaran: r,
      logs: logs.filter((l) => l.putaran === r).sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1)),
    });
  }

  const [editingKey, setEditingKey] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [draftError, setDraftError] = useState("");
  const dateInputRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (editingKey) dateInputRef.current?.focus();
  }, [editingKey]);

  const startEdit = (entryKey, currentIso, triggerEl) => {
    returnFocusRef.current = triggerEl;
    setEditingKey(entryKey);
    setDraftValue(currentIso);
    setDraftError("");
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setDraftError("");
    returnFocusRef.current?.focus?.();
  };

  const saveEdit = async (persist) => {
    const result = await persist(draftValue);
    if (!result || !result.ok) {
      setDraftError(result?.error ?? "Tanggal tidak valid.");
      return;
    }
    setEditingKey(null);
    setDraftError("");
    returnFocusRef.current?.focus?.();
  };

  const renderTanggal = ({ entryKey, tanggal, editedAt, editedBy, ariaLabel, onSave }) => {
    if (editingKey !== entryKey) {
      return (
        <>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{formatTanggal(tanggal)}</span>
            {canEdit && (
              <Button
                variant="ghost"
                className="!p-0.5 leading-none"
                aria-label={ariaLabel}
                onClick={(e) => startEdit(entryKey, tanggal, e.currentTarget)}
              >
                <EditIcon />
              </Button>
            )}
          </div>
          {editedAt && (
            <div className="text-xs italic text-slate-400 dark:text-slate-500">
              Tanggal disunting pada {formatTanggal(editedAt)} oleh {editedBy}
            </div>
          )}
        </>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <label htmlFor={`tanggal-edit-${entryKey}`} className="sr-only">
          {ariaLabel}
        </label>
        <input
          id={`tanggal-edit-${entryKey}`}
          ref={dateInputRef}
          type="date"
          className={`${INPUT_BASE} w-auto py-1 text-xs`}
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveEdit(onSave);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancelEdit();
            }
          }}
          aria-invalid={draftError ? "true" : undefined}
          aria-describedby={draftError ? `tanggal-edit-error-${entryKey}` : undefined}
        />
        <Button
          variant="ghost"
          className="!p-1 leading-none text-green-600 dark:text-green-400"
          aria-label="Simpan tanggal"
          onClick={() => saveEdit(onSave)}
        >
          <span aria-hidden="true">&#10003;</span>
        </Button>
        <Button variant="ghost" className="!p-1 leading-none" aria-label="Batalkan pengeditan tanggal" onClick={cancelEdit}>
          <span aria-hidden="true">&times;</span>
        </Button>
        {draftError && (
          <div id={`tanggal-edit-error-${entryKey}`} role="alert" className="w-full text-xs text-red-600 dark:text-red-400">
            {draftError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <Card key={round.putaran} className="p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {round.putaran === 1 ? "Putaran ke-1 — Pengajuan Awal" : `Putaran ke-${round.putaran} — Pengajuan Ulang`}
          </h4>
          <ol className="space-y-3 border-l-2 border-slate-200 pl-4 dark:border-slate-700">
            {round.putaran === 1 && (
              <li className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                {renderTanggal({
                  entryKey: "__awal__",
                  tanggal: usulan.tanggalUsulanAwal,
                  editedAt: usulan.tanggalUsulanAwalEditedAt,
                  editedBy: usulan.tanggalUsulanAwalEditedBy,
                  ariaLabel: "Ubah tanggal usulan diterima",
                  onSave: onEditTanggalAwal,
                })}
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Usulan diterima</div>
              </li>
            )}
            {round.logs.map((log) => (
              <li key={log.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                {renderTanggal({
                  entryKey: log.id,
                  tanggal: log.tanggal,
                  editedAt: log.tanggalEditedAt,
                  editedBy: log.tanggalEditedBy,
                  ariaLabel: `Ubah tanggal perpindahan ke ${log.keTahap === "SELESAI" ? "Selesai" : (TAHAP_BY_KODE[log.keTahap]?.label ?? log.keTahap)}`,
                  onSave: (value) => onEditLogTanggal(log.id, value),
                })}
                <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                  <span>
                    {ROMAWI_BY_KODE[log.dariTahap] ? `${ROMAWI_BY_KODE[log.dariTahap]} — ${TAHAP_BY_KODE[log.dariTahap]?.label}` : (TAHAP_BY_KODE[log.dariTahap]?.label ?? log.dariTahap)} &rarr;{" "}
                    {log.keTahap === "SELESAI" ? "Selesai (Diundangkan)" : `${ROMAWI_BY_KODE[log.keTahap]} — ${TAHAP_BY_KODE[log.keTahap]?.label}`}
                  </span>
                  {log.manual && <Pill color="amber">Manual</Pill>}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300">{log.keterangan}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">oleh {log.olehSiapa}</div>
              </li>
            ))}
            {round.logs.length === 0 && round.putaran !== 1 && (
              <li className="text-sm text-slate-500 dark:text-slate-400">Belum ada perpindahan tahap pada putaran ini.</li>
            )}
          </ol>
        </Card>
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
        <Card key={putaran} className="overflow-x-auto">
          <div className="border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300">
            Dokumen Putaran ke-{putaran}
          </div>
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Jenis Dokumen</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Versi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tanggal Terima</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status Validasi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Validator</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dokumenList
                .filter((d) => d.usulanKode === usulanKode && d.putaran === putaran)
                .map((d) => {
                  const status = STATUS_VALIDASI_BY_KODE[d.statusValidasi];
                  return (
                    <tr key={d.id}>
                      <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{DOKUMEN_JENIS_LABEL[d.jenis]}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">v{d.versi}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{formatTanggal(d.tanggalTerima)}</td>
                      <td className="px-3 py-2.5">
                        <Pill color={status.color}>{status.label}</Pill>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{d.validatorNama || "-"}</td>
                      <td className="px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400">{d.catatanValidasi || "-"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Card>
      ))}
      {rounds.length === 0 && (
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Jenis Dokumen</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Versi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tanggal Terima</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status Validasi</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Validator</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <EmptyState colSpan={6} message="Belum ada dokumen tercatat untuk usulan ini." />
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function TransitionActions({ usulan, onTransition }) {
  const [openTo, setOpenTo] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (usulan.status !== "aktif") {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        Usulan ini sudah berstatus {usulan.status === "selesai" ? "selesai" : usulan.status} dan tidak dapat dipindahkan tahapnya lagi.
      </div>
    );
  }

  const options = TRANSITION_MAP[usulan.tahapSaatIni] || [];

  const closeAll = () => {
    setOpenTo(null);
    setConfirmDialogOpen(false);
    setKeterangan("");
    setError("");
  };

  const handleConfirm = async (toTahap) => {
    const result = await onTransition(toTahap, keterangan);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    closeAll();
  };

  const keteranganField = (
    <>
      <label htmlFor="transition-keterangan" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
        Keterangan (wajib diisi, akan tercatat pada log)
      </label>
      <Textarea id="transition-keterangan" rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
      {error && (
        <div role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </>
  );

  return (
    <Card className="p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Pindahkan Tahap</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isTerminal = opt.toTahap === "SELESAI";
          // isOpen is only ever true for non-terminal options: terminal clicks open the
          // confirm Modal instead of toggling openTo, so the terminal button never shows
          // this "active" (expanded) style.
          const isOpen = openTo === opt.toTahap;
          const activeClasses = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
          const inactiveClasses = isTerminal
            ? "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/40"
            : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700";
          return (
            <button
              key={opt.toTahap}
              type="button"
              onClick={() => {
                if (isTerminal) {
                  setConfirmDialogOpen(true);
                } else {
                  setOpenTo(isOpen ? null : opt.toTahap);
                }
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
          {keteranganField}
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => handleConfirm(openTo)}>
              Konfirmasi
            </Button>
            <Button onClick={closeAll}>Batal</Button>
          </div>
        </div>
      )}
      <Modal open={confirmDialogOpen} onClose={closeAll} title="Tetapkan dan Undangkan — Tindakan Tidak Dapat Dibatalkan">
        <div className="space-y-2">
          {keteranganField}
          <div className="flex gap-2 pt-1">
            <Button variant="success" onClick={() => handleConfirm("SELESAI")}>
              Konfirmasi — Tindakan Tidak Dapat Dibatalkan
            </Button>
            <Button onClick={closeAll}>Batal</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function BypassTransitionPanel({ usulan, onTransition }) {
  const [expanded, setExpanded] = useState(false);
  const [toTahap, setToTahap] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (usulan.status !== "aktif") return null;

  const currentIndex = TAHAP_LIST.findIndex((t) => t.kode === usulan.tahapSaatIni);
  const otherTahap = TAHAP_LIST.filter((t) => t.kode !== usulan.tahapSaatIni);
  const selectedTahap = TAHAP_BY_KODE[toTahap];

  const closeAll = () => {
    setExpanded(false);
    setConfirmOpen(false);
    setToTahap("");
    setKeterangan("");
    setError("");
  };

  const handleConfirm = async () => {
    const result = await onTransition(toTahap, keterangan, true);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    closeAll();
  };

  return (
    <Card className="border-amber-200 p-4 dark:border-amber-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`text-sm font-medium text-amber-700 hover:underline dark:text-amber-400 ${FOCUS_RING}`}
      >
        <span aria-hidden="true">{expanded ? "↓" : "→"}</span>{" "}
        {expanded ? "Sembunyikan opsi lanjutan" : "Tampilkan opsi lanjutan: Pindahkan Tahap Manual"}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gunakan hanya untuk kondisi khusus di luar alur baku (mis. koreksi kesalahan input). Perpindahan ini akan
            tercatat pada log sebagai tindakan manual.
          </p>
          <label htmlFor="bypass-tahap" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
            Tahap Tujuan
          </label>
          <Select
            id="bypass-tahap"
            value={toTahap}
            onChange={(e) => {
              setToTahap(e.target.value);
              setError("");
            }}
          >
            <option value="">Pilih tahap tujuan</option>
            {otherTahap.map((t) => {
              const idx = TAHAP_LIST.findIndex((x) => x.kode === t.kode);
              return (
                <option key={t.kode} value={t.kode}>
                  {t.romawi} — {t.label} ({idx > currentIndex ? "Maju" : "Mundur"})
                </option>
              );
            })}
          </Select>
          {toTahap && (
            <>
              <label htmlFor="bypass-keterangan" className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                Alasan (wajib diisi, akan tercatat pada log)
              </label>
              <Textarea id="bypass-keterangan" rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </>
          )}
          {error && (
            <div role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {toTahap && (
            <div className="flex gap-2">
              <Button variant="warning" onClick={() => setConfirmOpen(true)}>
                Pindahkan Tahap
              </Button>
              <Button onClick={closeAll}>Batal</Button>
            </div>
          )}
        </div>
      )}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Pindahkan Tahap Manual — Lewati Alur Normal">
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Usulan akan dipindahkan langsung dari {ROMAWI_BY_KODE[usulan.tahapSaatIni]} —{" "}
            {TAHAP_BY_KODE[usulan.tahapSaatIni]?.label} ke{" "}
            {selectedTahap && `${ROMAWI_BY_KODE[toTahap]} — ${selectedTahap.label}`}, di luar alur transisi baku.
            Pastikan alasan sudah benar.
          </p>
          {error && (
            <div role="alert" aria-live="assertive" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="warning" onClick={handleConfirm}>
              Konfirmasi Pindahkan
            </Button>
            <Button onClick={() => setConfirmOpen(false)}>Batal</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

function EselonIIMultiSelect({ eselonIKode, selected, onChange }) {
  const unit = UNOR_BY_KODE[eselonIKode]?.unit ?? [];
  const toggle = (name) => {
    if (selected.includes(name)) onChange(selected.filter((s) => s !== name));
    else onChange([...selected, name]);
  };
  if (!eselonIKode) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">Pilih unit organisasi eselon I terlebih dahulu.</div>;
  }
  return (
    <div className="max-h-48 space-y-1.5 overflow-y-auto rounded border border-slate-300 p-2 dark:border-slate-600">
      {unit.map((name) => (
        <label key={name} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
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
      className={`rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
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
      className={`rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${FOCUS_RING}`}
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

function DasborPage({
  usulanList,
  dokumenList,
  filters,
  onFilterChange,
  onSelect,
  sort,
  onSortChange,
  today,
  canDelete,
  onDelete,
}) {
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
      <h2 id="page-heading" tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
        Dasbor
      </h2>
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
        canDelete={canDelete}
        onDelete={onDelete}
      />
    </div>
  );
}

function DetailUsulanPage({ usulan, dokumenList, logs, onBack, onTransition, onEditTanggalAwal, onEditLogTanggal, canEdit }) {
  const usulanLogs = logs.filter((l) => l.usulanKode === usulan.kode);
  const posisi = POSISI_BOLA_BY_KODE[usulan.posisiBola];
  const tahap = TAHAP_BY_KODE[usulan.tahapSaatIni];

  return (
    <div className="space-y-4">
      <nav aria-label="Navigasi" className="print:hidden text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className={`hover:underline dark:text-blue-400 text-blue-600 ${FOCUS_RING}`}>
          Dasbor
        </Link>{" "}
        / {usulan.kode}
      </nav>
      <Button variant="link" className="print:hidden" onClick={onBack}>
        <span aria-hidden="true">&larr;</span> Kembali ke Dasbor
      </Button>

      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{usulan.kode}</div>
            <h2 id="page-heading" tabIndex={-1} className="text-xl font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
              {usulan.judul}
            </h2>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pengusul: {UNOR_BY_KODE[usulan.unorKode]?.nama} ({usulan.unorKode})
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Pill color={posisi.color}>{posisi.label}</Pill>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {ROMAWI_BY_KODE[usulan.tahapSaatIni]} — {tahap.label} · Putaran ke-{usulan.putaran}
            </div>
            {usulan.status === "selesai" && <Pill color="green">Selesai</Pill>}
          </div>
        </div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Catatan terakhir: </span>
          {usulan.catatanTerakhir}
        </div>
      </Card>

      {usulan.deletedAt && (
        <div
          role="status"
          className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        >
          Usulan ini telah dihapus pada {usulan.deletedAt}
          {usulan.deletedBy ? ` oleh ${usulan.deletedBy}` : ""}. Kunjungi halaman{" "}
          <span className="font-medium">Usulan Terhapus</span> untuk memulihkannya.
        </div>
      )}

      <Card className="p-4">
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Jenis Perubahan &amp; Unit Eselon II Terdampak</h3>
        <div className="mb-2">
          <Pill color="gray">{JENIS_PERUBAHAN_LABEL[usulan.jenisPerubahan]}</Pill>
        </div>
        <ul className="list-inside list-disc text-sm text-slate-700 dark:text-slate-300">
          {usulan.unitTerdampak.map((unit) => (
            <li key={unit}>{unit}</li>
          ))}
        </ul>
      </Card>

      {canEdit && !usulan.deletedAt && <TransitionActions usulan={usulan} onTransition={onTransition} />}
      {canEdit && !usulan.deletedAt && <BypassTransitionPanel usulan={usulan} onTransition={onTransition} />}

      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Lini Masa</h3>
        <Timeline
          usulan={usulan}
          logs={usulanLogs}
          canEdit={canEdit && !usulan.deletedAt}
          onEditTanggalAwal={onEditTanggalAwal}
          onEditLogTanggal={onEditLogTanggal}
        />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Dokumen</h3>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!judul.trim() || !unorKode || unitTerdampak.length === 0) {
      setFeedback({ type: "error", text: "Judul, unit organisasi, dan minimal satu unit terdampak wajib diisi." });
      return;
    }
    const result = await onAddUsulan({ judul: judul.trim(), unorKode, unitTerdampak, jenisPerubahan });
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setJudul("");
    setUnorKode("");
    setUnitTerdampak([]);
    setJenisPerubahan(JENIS_PERUBAHAN_LIST[0].kode);
    setFeedback({ type: "success", text: "Usulan baru berhasil dicatat." });
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="max-w-xl space-y-4 p-4">
      <FormField id="tambah-judul" label="Judul Usulan">
        <Input id="tambah-judul" type="text" value={judul} onChange={(e) => setJudul(e.target.value)} />
      </FormField>
      <FormField id="tambah-unor" label="Unit Organisasi Pengusul (Eselon I)">
        <Select
          id="tambah-unor"
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
        </Select>
      </FormField>
      <fieldset className="min-w-0 border-0 p-0 m-0">
        <legend className="block text-xs font-medium text-slate-500 dark:text-slate-400">Unit Eselon II Terdampak</legend>
        <div className="mt-1">
          <EselonIIMultiSelect eselonIKode={unorKode} selected={unitTerdampak} onChange={setUnitTerdampak} />
        </div>
      </fieldset>
      <FormField id="tambah-jenis" label="Jenis Perubahan">
        <Select id="tambah-jenis" value={jenisPerubahan} onChange={(e) => setJenisPerubahan(e.target.value)}>
          {JENIS_PERUBAHAN_LIST.map((j) => (
            <option key={j.kode} value={j.kode}>
              {j.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormFeedback feedback={feedback} />
      <Button type="submit" variant="primary" size="md">
        Simpan Usulan
      </Button>
    </Card>
  );
}

function CatatDokumenForm({ usulanList, onAddDokumen }) {
  const aktifList = usulanList.filter((u) => u.status === "aktif");
  const [usulanKode, setUsulanKode] = useState("");
  const [jenis, setJenis] = useState(DOKUMEN_JENIS_LIST[0].kode);
  const [tanggalTerima, setTanggalTerima] = useState("");
  const [feedback, setFeedback] = useState(null);

  const selectedUsulan = aktifList.find((u) => u.kode === usulanKode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!usulanKode || !tanggalTerima) {
      setFeedback({ type: "error", text: "Usulan dan tanggal terima wajib diisi." });
      return;
    }
    const result = await onAddDokumen({ usulanKode, putaran: selectedUsulan.putaran, jenis, tanggalTerima });
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setTanggalTerima("");
    setFeedback({ type: "success", text: "Penerimaan dokumen berhasil dicatat." });
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="max-w-xl space-y-4 p-4">
      <FormField id="dokumen-usulan" label="Usulan">
        <Select id="dokumen-usulan" value={usulanKode} onChange={(e) => setUsulanKode(e.target.value)}>
          <option value="">Pilih usulan</option>
          {aktifList.map((u) => (
            <option key={u.kode} value={u.kode}>
              {u.kode} — {u.judul}
            </option>
          ))}
        </Select>
        {selectedUsulan && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Akan dicatat pada putaran ke-{selectedUsulan.putaran}.</div>
        )}
      </FormField>
      <FormField id="dokumen-jenis" label="Jenis Dokumen">
        <Select id="dokumen-jenis" value={jenis} onChange={(e) => setJenis(e.target.value)}>
          {DOKUMEN_JENIS_LIST.map((d) => (
            <option key={d.kode} value={d.kode}>
              {d.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="dokumen-tanggal" label="Tanggal Terima">
        <Input id="dokumen-tanggal" type="date" value={tanggalTerima} onChange={(e) => setTanggalTerima(e.target.value)} />
      </FormField>
      <FormFeedback feedback={feedback} />
      <Button type="submit" variant="primary" size="md">
        Catat Penerimaan
      </Button>
    </Card>
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    if (!dokumenId || !validatorNama.trim()) {
      setFeedback({ type: "error", text: "Dokumen dan nama validator wajib diisi." });
      return;
    }
    const result = await onValidateDokumen(dokumenId, {
      statusValidasi,
      catatanValidasi: catatanValidasi.trim(),
      validatorNama: validatorNama.trim(),
    });
    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }
    setCatatanValidasi("");
    setFeedback({ type: "success", text: "Hasil validasi berhasil dicatat." });
  };

  return (
    <Card as="form" onSubmit={handleSubmit} className="max-w-xl space-y-4 p-4">
      <FormField id="validasi-usulan" label="Usulan">
        <Select
          id="validasi-usulan"
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
        </Select>
      </FormField>
      <FormField id="validasi-dokumen" label="Dokumen (putaran berjalan)">
        <Select id="validasi-dokumen" value={dokumenId} onChange={(e) => setDokumenId(e.target.value)}>
          <option value="">Pilih dokumen</option>
          {dokumenPilihan.map((d) => (
            <option key={d.id} value={d.id}>
              {DOKUMEN_JENIS_LABEL[d.jenis]} (v{d.versi}) — status saat ini: {STATUS_VALIDASI_BY_KODE[d.statusValidasi].label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="validasi-status" label="Status Validasi">
        <Select id="validasi-status" value={statusValidasi} onChange={(e) => setStatusValidasi(e.target.value)}>
          {STATUS_VALIDASI_LIST.filter((s) => s.kode !== "belum_masuk").map((s) => (
            <option key={s.kode} value={s.kode}>
              {s.label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="validasi-catatan" label="Catatan Validasi">
        <Textarea id="validasi-catatan" rows={2} value={catatanValidasi} onChange={(e) => setCatatanValidasi(e.target.value)} />
      </FormField>
      <FormField id="validasi-nama" label="Nama Validator">
        <Input id="validasi-nama" type="text" value={validatorNama} onChange={(e) => setValidatorNama(e.target.value)} />
      </FormField>
      <FormFeedback feedback={feedback} />
      <Button type="submit" variant="primary" size="md">
        Simpan Hasil Validasi
      </Button>
    </Card>
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
      <h2 id="page-heading" tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
        Formulir Pencatatan
      </h2>
      <div role="tablist" className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((t) => (
          <TabButton
            key={t.kode}
            role="tab"
            aria-selected={activeTab === t.kode}
            active={activeTab === t.kode}
            onClick={() => setActiveTab(t.kode)}
          >
            {t.label}
          </TabButton>
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

  const thClass = "px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400";
  const tdClass = "px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300";
  const tdStrongClass = "px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-100";

  return (
    <div className="space-y-6">
      <h2 id="page-heading" tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
        Laporan
      </h2>
      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Rata-Rata Putaran per Unit Organisasi</h3>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className={thClass}>Unit</th>
                <th className={thClass}>Jumlah Usulan</th>
                <th className={thClass}>Rata-Rata Putaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {avgPutaran.map((row) => (
                <tr key={row.unorKode}>
                  <td className={tdStrongClass} title={row.unorNama}>
                    {row.unorKode} — {row.unorNama}
                  </td>
                  <td className={tdClass}>{row.jumlahUsulan}</td>
                  <td className={tdStrongClass}>{row.avgPutaran.toFixed(1)}</td>
                </tr>
              ))}
              {avgPutaran.length === 0 && <EmptyState colSpan={3} message="Belum ada data usulan." />}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Rata-Rata Waktu Tinggal per Tahap</h3>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className={thClass}>Tahap</th>
                <th className={thClass}>Rata-Rata Hari</th>
                <th className={thClass}>Jumlah Sampel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {avgDwell.map((row) => (
                <tr key={row.tahapKode}>
                  <td className={tdStrongClass}>
                    {ROMAWI_BY_KODE[row.tahapKode]} — {row.label}
                  </td>
                  <td className={tdStrongClass}>{row.avgDays === null ? "-" : `${row.avgDays.toFixed(1)} hari`}</td>
                  <td className={tdClass}>{row.sampleCount}</td>
                </tr>
              ))}
              {avgDwell.length === 0 && <EmptyState colSpan={3} message="Belum ada data usulan." />}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Usulan yang Melewati Batas Waktu</h3>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className={thClass}>Kode</th>
                <th className={thClass}>Tahap</th>
                <th className={thClass}>Umur</th>
                <th className={thClass}>Batas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {overdueList.map((u) => (
                <tr key={u.kode}>
                  <td className={tdStrongClass}>{u.kode}</td>
                  <td className={tdClass}>
                    {ROMAWI_BY_KODE[u.tahapSaatIni]} — {TAHAP_BY_KODE[u.tahapSaatIni].label}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400">{u.umurHari} hari</td>
                  <td className={tdClass}>{u.batasHari} hari</td>
                </tr>
              ))}
              {overdueList.length === 0 && <EmptyState colSpan={4} message="Tidak ada usulan yang melewati batas waktu." />}
            </tbody>
          </table>
        </Card>
      </section>

      <section>
        <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">Unit Eselon II Paling Sering Menjadi Objek Usulan</h3>
        <Card className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className={thClass}>Unit Eselon II</th>
                <th className={thClass}>Jumlah Usulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {ranking.map((row) => (
                <tr key={row.unit}>
                  <td className={tdStrongClass}>{row.unit}</td>
                  <td className={tdStrongClass}>{row.count}</td>
                </tr>
              ))}
              {ranking.length === 0 && <EmptyState colSpan={2} message="Belum ada data unit terdampak." />}
            </tbody>
          </table>
        </Card>
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

function RecycleBinPage({ usulanList, onRestore, onSelect }) {
  return (
    <div className="space-y-4">
      <h2 id="page-heading" tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
        Usulan Terhapus
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Usulan yang dihapus disimpan di sini dan dapat dipulihkan kapan saja.
      </p>
      <Card className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Kode / Judul
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dihapus Pada
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Dihapus Oleh
              </th>
              <th className="px-2 py-2" aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {usulanList.map((u) => (
              <tr key={u.kode} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onSelect(u.kode)}
                    className={`font-medium text-blue-600 hover:underline dark:text-blue-400 ${FOCUS_RING}`}
                  >
                    {u.kode}
                  </button>
                  <div className="max-w-[280px] truncate text-xs text-slate-500 dark:text-slate-400" title={u.judul}>
                    {u.judul}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{u.deletedAt}</td>
                <td className="px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300">{u.deletedBy}</td>
                <td className="px-3 py-2.5">
                  <Button variant="success" onClick={() => onRestore(u.kode)}>
                    Pulihkan
                  </Button>
                </td>
              </tr>
            ))}
            {usulanList.length === 0 && <EmptyState colSpan={4} message="Tidak ada usulan yang dihapus." />}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// =====================================================================
// APLIKASI UTAMA
// =====================================================================

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <AppShell />
    </Router>
  );
}

function upsertByKey(list, row, key) {
  const idx = list.findIndex((item) => String(item[key]) === String(row[key]));
  return idx === -1 ? [...list, row] : list.map((item, i) => (i === idx ? row : item));
}

function AppShell() {
  const today = useMemo(() => new Date(), []);
  const [location, navigate] = useLocation();

  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const [role, setRole] = useState("kepala_biro");
  const [unorViewingAs, setUnorViewingAs] = useState(UNIT_ORGANISASI[0].kode);

  const [usulanList, setUsulanList] = useState([]);
  const [dokumenList, setDokumenList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadState, setLoadState] = useState({ status: "loading", error: null });
  const [actionError, setActionError] = useState(null);

  const applyData = (data) => {
    setUsulanList(data.usulanList);
    setDokumenList(data.dokumenList);
    setLogs(data.logs);
  };

  const loadData = async () => {
    setLoadState({ status: "loading", error: null });
    try {
      applyData(await db.fetchAll());
      setLoadState({ status: "ready", error: null });
    } catch (err) {
      setLoadState({ status: "error", error: err.message });
    }
  };

  // Baris baru atau yang berubah (dari handler sendiri maupun dari perangkat lain lewat
  // Realtime) digabung berdasarkan kunci, sehingga gema Realtime tidak menduplikasi baris.
  const upsertUsulan = (row) => setUsulanList((prev) => upsertByKey(prev, row, "kode"));
  const upsertDokumen = (row) => setDokumenList((prev) => upsertByKey(prev, row, "id"));
  const upsertLog = (row) => setLogs((prev) => upsertByKey(prev, row, "id").sort((a, b) => a.id - b.id));

  useEffect(() => {
    const unsubscribe = db.subscribeToChanges({ onUsulan: upsertUsulan, onDokumen: upsertDokumen, onLog: upsertLog });
    loadData();
    // Perangkat yang tertidur bisa melewatkan event Realtime; muat ulang diam-diam saat tab
    // kembali terlihat (tanpa status "loading", agar isian formulir tidak hilang).
    const handleVisible = () => {
      if (document.visibilityState === "visible") db.fetchAll().then(applyData).catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, []);

  const [filters, setFilters] = useState({ unorKode: "", tahap: "", jenisPerubahan: "", posisiBola: "" });
  const [sort, setSort] = useState({ field: "kode", direction: "asc" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // "Cetak Ringkasan" triggers window.print() directly rather than navigating to a
  // route — CetakRingkasanPage stays mounted (hidden) at every route, shown only
  // via the `print:` media query, so printing never disturbs browser history.
  const [printRequested, setPrintRequested] = useState(false);
  useEffect(() => {
    if (printRequested) {
      window.print();
      setPrintRequested(false);
    }
  }, [printRequested]);

  // Moves focus to the current page's heading on every route change, and announces
  // the new page to screen readers via the live region rendered below.
  useEffect(() => {
    document.getElementById("page-heading")?.focus();
  }, [location]);

  const routeLabel = useMemo(() => {
    if (location === "/") return "Dasbor";
    if (location === "/formulir") return "Formulir Pencatatan";
    if (location === "/laporan") return "Laporan";
    if (location === "/recycle-bin") return "Usulan Terhapus";
    if (location.startsWith("/usulan/")) return `Detail usulan ${location.slice("/usulan/".length)}`;
    return "Halaman tidak ditemukan";
  }, [location]);

  const visibleUsulanList = useMemo(() => {
    const notDeleted = usulanList.filter((u) => !u.deletedAt);
    if (role === "unor") return notDeleted.filter((u) => u.unorKode === unorViewingAs);
    return notDeleted;
  }, [usulanList, role, unorViewingAs]);

  const deletedUsulanList = useMemo(() => usulanList.filter((u) => u.deletedAt), [usulanList]);

  // Setiap handler menulis ke Supabase lebih dulu, lalu memasukkan baris hasil simpan
  // ke state lokal. Kegagalan dikembalikan sebagai { ok: false, error } ke pemanggil.
  const saveError = (err) => ({ ok: false, error: `Gagal menyimpan ke server: ${err.message}` });

  const handleAddUsulan = async ({ judul, unorKode, unitTerdampak, jenisPerubahan }) => {
    try {
      const seq = await db.nextUsulanSeq();
      const kode = `${unorKode}-2026-${String(seq).padStart(3, "0")}`;
      const tanggalIso = toIsoDate(today);
      const saved = await db.insertUsulan({
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
        deletedAt: null,
        deletedBy: null,
      });
      upsertUsulan(saved);
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleAddDokumen = async ({ usulanKode, putaran, jenis, tanggalTerima }) => {
    try {
      const saved = await db.insertDokumen({
        usulanKode,
        putaran,
        jenis,
        versi: dokumenList.filter((d) => d.usulanKode === usulanKode && d.putaran === putaran && d.jenis === jenis).length + 1,
        tanggalTerima,
        statusValidasi: "diterima",
        catatanValidasi: "",
        validatorNama: "",
        tanggalValidasi: "",
      });
      upsertDokumen(saved);
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleValidateDokumen = async (dokumenId, { statusValidasi, catatanValidasi, validatorNama }) => {
    try {
      const saved = await db.updateDokumen(dokumenId, {
        statusValidasi,
        catatanValidasi,
        validatorNama,
        tanggalValidasi: toIsoDate(today),
      });
      upsertDokumen(saved);
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleTransition = async (usulan, toTahap, keterangan, manual = false) => {
    const result = applyTransition(usulan, { toTahap, keterangan, olehSiapa: ROLE_LABEL[role], manual }, today);
    if (!result.ok) return result;

    try {
      const savedLog = await db.insertLog(result.logEntry);
      const savedUsulan = await db.updateUsulan(usulan.kode, result.usulanPatch);
      upsertLog(savedLog);
      upsertUsulan(savedUsulan);
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  // Perbaikan tanggal tahap retroaktif (mis. saat setup awal): batas kronologis diambil
  // dari urutan kemunculan asli logs usulan tersebut, bukan urutan tampilan Timeline.
  const handleEditTanggalUsulanAwal = async (usulanKode, newTanggal) => {
    const usulan = usulanList.find((u) => u.kode === usulanKode);
    if (!usulan) return { ok: false, error: "Usulan tidak ditemukan." };
    const usulanLogs = logs.filter((l) => l.usulanKode === usulanKode);
    const validation = validateTanggalEdit({
      newTanggal,
      prevTanggal: null,
      nextTanggal: usulanLogs.length > 0 ? usulanLogs[0].tanggal : null,
      todayIso: toIsoDate(today),
    });
    if (!validation.ok) return validation;

    try {
      const saved = await db.updateUsulan(usulanKode, {
        tanggalUsulanAwal: newTanggal,
        tanggalUsulanAwalEditedAt: toIsoDate(today),
        tanggalUsulanAwalEditedBy: ROLE_LABEL[role],
      });
      upsertUsulan(saved);
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleEditLogTanggal = async (logId, newTanggal) => {
    const log = logs.find((l) => l.id === logId);
    if (!log) return { ok: false, error: "Entri tidak ditemukan." };
    const usulan = usulanList.find((u) => u.kode === log.usulanKode);
    const usulanLogs = logs.filter((l) => l.usulanKode === log.usulanKode);
    const idx = usulanLogs.findIndex((l) => l.id === logId);
    const validation = validateTanggalEdit({
      newTanggal,
      prevTanggal: idx === 0 ? (usulan?.tanggalUsulanAwal ?? null) : usulanLogs[idx - 1].tanggal,
      nextTanggal: idx === usulanLogs.length - 1 ? null : usulanLogs[idx + 1].tanggal,
      todayIso: toIsoDate(today),
    });
    if (!validation.ok) return validation;

    try {
      const savedLog = await db.updateLog(logId, {
        tanggal: newTanggal,
        tanggalEditedAt: toIsoDate(today),
        tanggalEditedBy: ROLE_LABEL[role],
      });
      upsertLog(savedLog);
      // Log paling akhir (urutan asli) adalah transisi yang membentuk tahapSaatIni saat ini,
      // jadi tanggalMasukTahap harus ikut disinkronkan agar umur/overdue tetap akurat.
      if (idx === usulanLogs.length - 1) {
        upsertUsulan(await db.updateUsulan(log.usulanKode, { tanggalMasukTahap: newTanggal }));
      }
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleDeleteUsulan = async (kode) => {
    try {
      upsertUsulan(await db.updateUsulan(kode, { deletedAt: toIsoDate(today), deletedBy: ROLE_LABEL[role] }));
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
  };

  const handleRestoreUsulan = async (kode) => {
    try {
      upsertUsulan(await db.updateUsulan(kode, { deletedAt: null, deletedBy: null }));
      return { ok: true };
    } catch (err) {
      return saveError(err);
    }
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

  const canSeeFormulir = role === "pelaksana_biro";
  const canEditDetail = role === "pelaksana_biro";
  const canManageTrash = role === "pelaksana_biro";

  const navItems = [
    { path: "/", label: "Dasbor" },
    ...(canSeeFormulir ? [{ path: "/formulir", label: "Formulir Pencatatan" }] : []),
    { path: "/laporan", label: "Laporan" },
    ...(canManageTrash ? [{ path: "/recycle-bin", label: "Usulan Terhapus" }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-900">
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-blue-700 focus:shadow-lg dark:focus:bg-slate-800 dark:focus:text-blue-400 ${FOCUS_RING}`}
      >
        Langsung ke konten utama
      </a>
      <div aria-live="polite" className="sr-only">
        {routeLabel}
      </div>
      <header className="print:hidden border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Dasbor Pemantauan Usulan Perubahan Organisasi
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biro Kepegawaian, Organisasi, dan Tata Laksana — Sekretariat Jenderal Kementerian Pekerjaan Umum
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {role === "unor" && <UnorUnitPicker unorKode={unorViewingAs} onChange={setUnorViewingAs} />}
            <RoleSwitcher
              role={role}
              onChange={(newRole) => {
                setRole(newRole);
                navigate("/");
              }}
            />
            <Button onClick={handleExportJson}>Ekspor JSON</Button>
            <Button onClick={() => setPrintRequested(true)}>Cetak Ringkasan</Button>
            <Button aria-label={darkMode ? "Aktifkan mode terang" : "Aktifkan mode gelap"} onClick={() => setDarkMode((v) => !v)}>
              {darkMode ? "☀ Terang" : "🌙 Gelap"}
            </Button>
          </div>
        </div>
        <nav aria-label="Navigasi utama" className="mx-auto flex max-w-7xl gap-1 px-4">
          {navItems.map((item) => (
            <TabButton
              key={item.path}
              aria-current={location === item.path ? "page" : undefined}
              active={location === item.path}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </TabButton>
          ))}
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6">
        <div className="print:hidden">
          {actionError && (
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <FormFeedback feedback={{ type: "error", text: actionError }} />
              </div>
              <Button onClick={() => setActionError(null)}>Tutup</Button>
            </div>
          )}
          {loadState.status === "loading" && (
            <p role="status" className="text-sm text-slate-500 dark:text-slate-400">
              Memuat data dari server…
            </p>
          )}
          {loadState.status === "error" && (
            <div className="space-y-3">
              <FormFeedback feedback={{ type: "error", text: `Gagal memuat data: ${loadState.error}` }} />
              <Button variant="primary" onClick={loadData}>
                Coba lagi
              </Button>
            </div>
          )}
          {loadState.status === "ready" && (
            <Switch>
              <Route path="/">
                <DasborPage
                  usulanList={visibleUsulanList}
                  dokumenList={dokumenList}
                  filters={filters}
                  onFilterChange={setFilters}
                  onSelect={(kode) => navigate(`/usulan/${kode}`)}
                  sort={sort}
                  onSortChange={setSort}
                  today={today}
                  canDelete={canManageTrash}
                  onDelete={(kode) => setDeleteTarget(kode)}
                />
              </Route>
              <Route path="/usulan/:kode">
                {(params) => {
                  const usulan =
                    usulanList.find(
                      (u) => u.kode === params.kode && (role !== "unor" || u.unorKode === unorViewingAs),
                    ) ?? null;
                  if (!usulan) {
                    return (
                      <div className="space-y-4">
                        <h2 id="page-heading" tabIndex={-1} className="text-lg font-semibold text-slate-900 focus:outline-none dark:text-slate-100">
                          Usulan tidak ditemukan
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Usulan dengan kode &ldquo;{params.kode}&rdquo; tidak ditemukan atau tidak terlihat oleh peran Anda saat ini.
                        </p>
                        <Button variant="link" onClick={() => navigate("/")}>
                          <span aria-hidden="true">&larr;</span> Kembali ke Dasbor
                        </Button>
                      </div>
                    );
                  }
                  return (
                    <DetailUsulanPage
                      usulan={usulan}
                      dokumenList={dokumenList}
                      logs={logs}
                      onBack={() => navigate("/")}
                      onTransition={(toTahap, keterangan, manual) => handleTransition(usulan, toTahap, keterangan, manual)}
                      onEditTanggalAwal={(newTanggal) => handleEditTanggalUsulanAwal(usulan.kode, newTanggal)}
                      onEditLogTanggal={handleEditLogTanggal}
                      canEdit={canEditDetail}
                    />
                  );
                }}
              </Route>
              <Route path="/formulir">
                {canSeeFormulir ? (
                  <FormulirPage
                    usulanList={usulanList.filter((u) => !u.deletedAt)}
                    dokumenList={dokumenList}
                    onAddUsulan={handleAddUsulan}
                    onAddDokumen={handleAddDokumen}
                    onValidateDokumen={handleValidateDokumen}
                  />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/laporan">
                <LaporanPage usulanList={visibleUsulanList} logs={logs} today={today} />
              </Route>
              <Route path="/recycle-bin">
                {canManageTrash ? (
                  <RecycleBinPage
                    usulanList={deletedUsulanList}
                    onRestore={async (kode) => {
                      const result = await handleRestoreUsulan(kode);
                      if (!result.ok) setActionError(result.error);
                    }}
                    onSelect={(kode) => navigate(`/usulan/${kode}`)}
                  />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route>
                <Redirect to="/" />
              </Route>
            </Switch>
          )}
        </div>
        <div className="hidden print:block">
          <CetakRingkasanPage usulanList={visibleUsulanList} dokumenList={dokumenList} today={today} />
        </div>
      </main>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus Usulan">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Usulan <span className="font-medium text-slate-900 dark:text-slate-100">{deleteTarget}</span> akan
            dipindahkan ke Usulan Terhapus dan disembunyikan dari Dasbor dan Laporan. Tindakan ini dapat dibatalkan
            kapan saja melalui halaman <span className="font-medium">Usulan Terhapus</span>.
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              variant="danger"
              onClick={async () => {
                const result = await handleDeleteUsulan(deleteTarget);
                setDeleteTarget(null);
                if (!result.ok) setActionError(result.error);
              }}
            >
              Hapus Usulan
            </Button>
            <Button onClick={() => setDeleteTarget(null)}>Batal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
