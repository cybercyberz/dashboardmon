import { supabase, supabaseConfigError } from "./supabaseClient.js";

// Aplikasi memakai camelCase; kolom database memakai snake_case.
const toSnake = (k) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (k) => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// Tanggal kosong di aplikasi ("") disimpan sebagai null, dan sebaliknya untuk kolom teks dokumen.
function toRow(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), v === "" && /tanggal|At$/.test(k) ? null : v]));
}

function fromRow(row) {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));
}

function fromUsulanRow(row) {
  const { createdAt, ...u } = fromRow(row);
  return u;
}

function fromDokumenRow(row) {
  const d = fromRow(row);
  return { ...d, tanggalValidasi: d.tanggalValidasi ?? "" };
}

function client() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

function unwrap({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchAll() {
  const db = client();
  const [usulan, dokumen, logs] = await Promise.all([
    db.from("usulan").select("*").order("created_at").order("kode"),
    db.from("dokumen").select("*").order("id"),
    db.from("logs").select("*").order("id"),
  ]);
  return {
    usulanList: unwrap(usulan).map(fromUsulanRow),
    dokumenList: unwrap(dokumen).map(fromDokumenRow),
    logs: unwrap(logs).map(fromRow),
  };
}

export async function nextUsulanSeq() {
  return unwrap(await client().rpc("next_usulan_seq"));
}

export async function insertUsulan(usulan) {
  return fromUsulanRow(unwrap(await client().from("usulan").insert(toRow(usulan)).select().single()));
}

export async function updateUsulan(kode, patch) {
  return fromUsulanRow(unwrap(await client().from("usulan").update(toRow(patch)).eq("kode", kode).select().single()));
}

export async function insertDokumen(dokumen) {
  return fromDokumenRow(unwrap(await client().from("dokumen").insert(toRow(dokumen)).select().single()));
}

export async function updateDokumen(id, patch) {
  return fromDokumenRow(unwrap(await client().from("dokumen").update(toRow(patch)).eq("id", id).select().single()));
}

export async function insertLog(log) {
  return fromRow(unwrap(await client().from("logs").insert(toRow(log)).select().single()));
}

export async function updateLog(id, patch) {
  return fromRow(unwrap(await client().from("logs").update(toRow(patch)).eq("id", id).select().single()));
}

// Perubahan dari perangkat lain (Supabase Realtime). Mengembalikan fungsi untuk berhenti berlangganan.
export function subscribeToChanges({ onUsulan, onDokumen, onLog }) {
  if (!supabase) return () => {};
  const handlers = { usulan: [onUsulan, fromUsulanRow], dokumen: [onDokumen, fromDokumenRow], logs: [onLog, fromRow] };
  let channel = supabase.channel("dashboardmon-changes");
  for (const [table, [callback, map]] of Object.entries(handlers)) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
      if (payload.new && Object.keys(payload.new).length > 0) callback(map(payload.new));
    });
  }
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}
