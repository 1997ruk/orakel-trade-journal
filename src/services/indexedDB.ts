const DB_NAME = 'orakel-trading';
const DB_VERSION = 2;
const TRADES_STORE = 'trades';
const PENDING_OPS_STORE = 'pending_ops';
const GOALS_STORE = 'weekly_goals';

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface LocalTrade {
  id: string;
  user_id: string;
  date: string;
  actif: string;
  setup: string;
  direction: string;
  prix_entree: number;
  stop_loss: number;
  take_profit: number;
  risque_pourcentage: number;
  taille_position: number;
  resultat: string;
  r_multiple: number;
  trade_respecte: boolean;
  emotion: string;
  note_avant: string;
  note_apres: string;
  image_url: string | null;
  tags: string[];
  sync_status: SyncStatus;
}

export interface PendingOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  trade_id: string;
  data?: Partial<LocalTrade>;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TRADES_STORE)) {
        const store = db.createObjectStore(TRADES_STORE, { keyPath: 'id' });
        store.createIndex('user_id', 'user_id', { unique: false });
        store.createIndex('sync_status', 'sync_status', { unique: false });
      }
      if (!db.objectStoreNames.contains(PENDING_OPS_STORE)) {
        const ops = db.createObjectStore(PENDING_OPS_STORE, { keyPath: 'id' });
        ops.createIndex('trade_id', 'trade_id', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(db: IDBDatabase, store: string, mode: IDBTransactionMode) {
  return db.transaction(store, mode).objectStore(store);
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

// --- Trades ---

export async function getAllLocalTrades(userId: string): Promise<LocalTrade[]> {
  const db = await openDB();
  const store = tx(db, TRADES_STORE, 'readonly');
  const index = store.index('user_id');
  const trades = await req<LocalTrade[]>(index.getAll(userId));
  db.close();
  return trades;
}

export async function putLocalTrade(trade: LocalTrade): Promise<void> {
  const db = await openDB();
  const store = tx(db, TRADES_STORE, 'readwrite');
  await req(store.put(trade));
  db.close();
}

export async function putLocalTrades(trades: LocalTrade[]): Promise<void> {
  const db = await openDB();
  const t = db.transaction(TRADES_STORE, 'readwrite');
  const store = t.objectStore(TRADES_STORE);
  trades.forEach(tr => store.put(tr));
  return new Promise((resolve, reject) => {
    t.oncomplete = () => { db.close(); resolve(); };
    t.onerror = () => { db.close(); reject(t.error); };
  });
}

export async function deleteLocalTrade(id: string): Promise<void> {
  const db = await openDB();
  const store = tx(db, TRADES_STORE, 'readwrite');
  await req(store.delete(id));
  db.close();
}

// --- Pending Operations ---

export async function addPendingOp(op: PendingOperation): Promise<void> {
  const db = await openDB();
  const store = tx(db, PENDING_OPS_STORE, 'readwrite');
  await req(store.put(op));
  db.close();
}

export async function getAllPendingOps(): Promise<PendingOperation[]> {
  const db = await openDB();
  const store = tx(db, PENDING_OPS_STORE, 'readonly');
  const ops = await req<PendingOperation[]>(store.getAll());
  db.close();
  return ops.sort((a, b) => a.timestamp - b.timestamp);
}

export async function deletePendingOp(id: string): Promise<void> {
  const db = await openDB();
  const store = tx(db, PENDING_OPS_STORE, 'readwrite');
  await req(store.delete(id));
  db.close();
}

export async function clearPendingOpsForTrade(tradeId: string): Promise<void> {
  const db = await openDB();
  const store = tx(db, PENDING_OPS_STORE, 'readwrite');
  const index = store.index('trade_id');
  const keys = await req(index.getAllKeys(tradeId));
  keys.forEach(k => store.delete(k));
  return new Promise((resolve, reject) => {
    store.transaction.oncomplete = () => { db.close(); resolve(); };
    store.transaction.onerror = () => { db.close(); reject(store.transaction.error); };
  });
}
