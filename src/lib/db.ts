export type ThemeMode = 'system' | 'dark' | 'light';

export interface SnippetItem {
  id: string;
  title: string;
  content: string;
  toolId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export type SnippetRecord = SnippetItem;

export interface RecentToolItem {
  id: string;
  name: string;
  category: string;
  visitedAt: number;
}

export interface FavoriteToolItem {
  id: string;
  addedAt: number;
}

export interface ExportedDataPayload {
  version: number;
  exportedAt: string;
  appName: string;
  settings: Record<string, unknown>;
  favorites: string[];
  recentTools: RecentToolItem[];
  snippets: SnippetItem[];
}

const DB_NAME = 'zelvior_devkit_db';
const DB_VERSION = 2;

export const STORES = {
  SETTINGS: 'settings',
  FAVORITES: 'favorites',
  RECENT_TOOLS: 'recentTools',
  SNIPPETS: 'snippets',
  CUSTOM_PRESETS: 'customPresets',
  SEARCH_HISTORY: 'searchHistory',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

let dbInstancePromise: Promise<IDBDatabase> | null = null;

function setupStores(db: IDBDatabase) {
  // 1. Settings store (key-value)
  if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
    db.createObjectStore(STORES.SETTINGS);
  }

  // 2. Favorites store
  if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
    db.createObjectStore(STORES.FAVORITES, { keyPath: 'id' });
  }

  // 3. Recent Tools store
  if (!db.objectStoreNames.contains(STORES.RECENT_TOOLS)) {
    const recentStore = db.createObjectStore(STORES.RECENT_TOOLS, { keyPath: 'id' });
    recentStore.createIndex('visitedAt', 'visitedAt', { unique: false });
  }

  // 4. Snippets store
  if (!db.objectStoreNames.contains(STORES.SNIPPETS)) {
    const snippetStore = db.createObjectStore(STORES.SNIPPETS, { keyPath: 'id' });
    snippetStore.createIndex('toolId', 'toolId', { unique: false });
    snippetStore.createIndex('createdAt', 'createdAt', { unique: false });
  }

  // 5. Custom Presets store
  if (!db.objectStoreNames.contains(STORES.CUSTOM_PRESETS)) {
    db.createObjectStore(STORES.CUSTOM_PRESETS, { keyPath: 'id' });
  }

  // 6. Search History store
  if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
    db.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'query' });
  }
}

export function getDB(forceVersion?: number): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only accessible in browser environments'));
  }

  if (dbInstancePromise && !forceVersion) {
    return dbInstancePromise;
  }

  dbInstancePromise = new Promise((resolve, reject) => {
    try {
      // Opening without a version parameter connects at current version (or version 1 on new DB)
      const request = forceVersion ? indexedDB.open(DB_NAME, forceVersion) : indexedDB.open(DB_NAME);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        setupStores(db);
      };

      request.onsuccess = () => {
        const db = request.result;

        // Verify if all required stores actually exist in the opened database
        const missingStores = Object.values(STORES).filter((store) => !db.objectStoreNames.contains(store));
        if (missingStores.length > 0) {
          console.warn('Detected missing IndexedDB stores:', missingStores, 'Upgrading schema version from', db.version, 'to', db.version + 1);
          db.close();
          dbInstancePromise = null;
          // Re-open with bumped version
          getDB(db.version + 1).then(resolve).catch(reject);
          return;
        }

        db.onversionchange = () => {
          db.close();
          dbInstancePromise = null;
        };

        resolve(db);
      };

      request.onerror = () => {
        dbInstancePromise = null;
        reject(request.error || new Error('Failed to open IndexedDB database'));
      };

      request.onblocked = () => {
        console.warn('IndexedDB database upgrade blocked. Close other tabs running Zelvior DevKit.');
      };
    } catch (err) {
      dbInstancePromise = null;
      reject(err);
    }
  });

  return dbInstancePromise;
}

// In-memory fallback if IndexedDB is completely inaccessible
const memoryFallback = new Map<string, unknown>();

// Transaction Helpers
async function withTransaction<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  try {
    const db = await getDB();

    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`Object store "${storeName}" missing in active database, forcing migration...`);
      db.close();
      dbInstancePromise = null;
      const upgradedDb = await getDB(db.version + 1);
      if (!upgradedDb.objectStoreNames.contains(storeName)) {
        throw new Error(`Store ${storeName} could not be created`);
      }
      return withTransaction(storeName, mode, callback);
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);

        let result: T;
        Promise.resolve(callback(store))
          .then((res) => {
            result = res;
          })
          .catch(reject);

        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.warn(`IndexedDB transaction failed for ${storeName}:`, err);
    throw err;
  }
}

// 1. Settings (Theme, preferences)
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    return await withTransaction(STORES.SETTINGS, 'readonly', (store) => {
      return new Promise<T>((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => {
          resolve(req.result !== undefined ? req.result : defaultValue);
        };
        req.onerror = () => resolve(defaultValue);
      });
    });
  } catch (e) {
    return defaultValue;
  }
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    await withTransaction(STORES.SETTINGS, 'readwrite', (store) => {
      store.put(value, key);
    });
  } catch (e) {
    console.warn(`Failed to save setting ${key} in IndexedDB:`, e);
  }
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  try {
    return await withTransaction(STORES.SETTINGS, 'readonly', (store) => {
      return new Promise<Record<string, unknown>>((resolve) => {
        const req = store.openCursor();
        const settings: Record<string, unknown> = {};

        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            settings[String(cursor.key)] = cursor.value;
            cursor.continue();
          } else {
            resolve(settings);
          }
        };
        req.onerror = () => resolve({});
      });
    });
  } catch {
    return {};
  }
}

// Theme convenience functions
export async function getStoredThemeMode(): Promise<ThemeMode> {
  return getSetting<ThemeMode>('themeMode', 'system');
}

export async function setStoredThemeMode(mode: ThemeMode): Promise<void> {
  return setSetting<ThemeMode>('themeMode', mode);
}

// 2. Favorites
export async function getFavorites(): Promise<string[]> {
  try {
    return await withTransaction(STORES.FAVORITES, 'readonly', (store) => {
      return new Promise<string[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items: FavoriteToolItem[] = req.result || [];
          resolve(items.map((i) => i.id));
        };
        req.onerror = () => resolve([]);
      });
    });
  } catch (e) {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  try {
    await withTransaction(STORES.FAVORITES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          if (getReq.result) {
            const delReq = store.delete(id);
            delReq.onsuccess = () => resolve();
            delReq.onerror = () => reject(delReq.error);
          } else {
            const putReq = store.put({ id, addedAt: Date.now() });
            putReq.onsuccess = () => resolve();
            putReq.onerror = () => reject(putReq.error);
          }
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
    return getFavorites();
  } catch (e) {
    console.warn('Failed to toggle favorite:', e);
    return [];
  }
}

// 3. Recent Tools
export async function getRecentTools(): Promise<string[]> {
  try {
    return await withTransaction(STORES.RECENT_TOOLS, 'readonly', (store) => {
      return new Promise<string[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items: RecentToolItem[] = req.result || [];
          // Sort by visitedAt descending
          items.sort((a, b) => b.visitedAt - a.visitedAt);
          resolve(items.slice(0, 10).map((i) => i.id));
        };
        req.onerror = () => resolve([]);
      });
    });
  } catch (e) {
    return [];
  }
}

export async function addRecentTool(id: string, name?: string, category?: string): Promise<string[]> {
  try {
    await withTransaction(STORES.RECENT_TOOLS, 'readwrite', (store) => {
      store.put({
        id,
        name: name || id,
        category: category || 'utility',
        visitedAt: Date.now(),
      });
    });
  } catch (e) {
    console.warn('Failed to record recent tool in IndexedDB:', e);
  }
  return getRecentTools();
}

// 4. Saved Snippets
export async function getSnippets(): Promise<SnippetItem[]> {
  try {
    return await withTransaction(STORES.SNIPPETS, 'readonly', (store) => {
      return new Promise<SnippetItem[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const items: SnippetItem[] = req.result || [];
          items.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(items);
        };
        req.onerror = () => resolve([]);
      });
    });
  } catch (e) {
    return [];
  }
}

export async function saveSnippet(
  item: Omit<SnippetItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<SnippetItem> {
  const now = Date.now();
  const snippet: SnippetItem = {
    id: item.id || `snippet-${now}-${Math.random().toString(36).substring(2, 6)}`,
    title: item.title.trim() || 'Untitled Snippet',
    content: item.content,
    toolId: item.toolId,
    tags: item.tags || [],
    createdAt: now,
    updatedAt: now,
  };

  await withTransaction(STORES.SNIPPETS, 'readwrite', (store) => {
    store.put(snippet);
  });

  return snippet;
}

export async function deleteSnippet(id: string): Promise<void> {
  await withTransaction(STORES.SNIPPETS, 'readwrite', (store) => {
    store.delete(id);
  });
}

// 5. Data Management (Export, Import, Clear, Purge)
export async function exportAllData(): Promise<string> {
  const [favorites, recentTools, snippets, allSettings] = await Promise.all([
    getFavorites(),
    new Promise<RecentToolItem[]>(async (res) => {
      try {
        const r = await withTransaction(STORES.RECENT_TOOLS, 'readonly', (s) => {
          return new Promise<RecentToolItem[]>((resolve) => {
            const req = s.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
          });
        });
        res(r);
      } catch {
        res([]);
      }
    }),
    getSnippets(),
    getAllSettings(),
  ]);

  const payload: ExportedDataPayload = {
    version: DB_VERSION,
    appName: 'Zelvior DevKit',
    exportedAt: new Date().toISOString(),
    settings: allSettings,
    favorites,
    recentTools,
    snippets,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importAllData(data: string | ExportedDataPayload): Promise<boolean> {
  let payload: ExportedDataPayload;
  if (typeof data === 'string') {
    try {
      payload = JSON.parse(data);
    } catch {
      throw new Error('Invalid JSON format in backup file.');
    }
  } else {
    payload = data;
  }

  if (!payload || payload.appName !== 'Zelvior DevKit' || !Array.isArray(payload.snippets)) {
    throw new Error('Invalid Zelvior DevKit backup payload. Verification failed.');
  }

  // Import settings
  if (payload.settings && typeof payload.settings === 'object') {
    for (const [k, v] of Object.entries(payload.settings)) {
      await setSetting(k, v);
    }
  }

  // Import favorites
  if (Array.isArray(payload.favorites)) {
    await withTransaction(STORES.FAVORITES, 'readwrite', (store) => {
      for (const favId of payload.favorites) {
        if (typeof favId === 'string') {
          store.put({ id: favId, addedAt: Date.now() });
        }
      }
    });
  }

  // Import snippets
  if (Array.isArray(payload.snippets)) {
    await withTransaction(STORES.SNIPPETS, 'readwrite', (store) => {
      for (const snippet of payload.snippets) {
        if (snippet.id && snippet.content) {
          store.put(snippet);
        }
      }
    });
  }

  return true;
}

export async function clearStore(storeName: StoreName): Promise<void> {
  await withTransaction(storeName, 'readwrite', (store) => {
    store.clear();
  });
}

export async function purgeAllData(): Promise<void> {
  const db = await getDB();
  const storeNames: StoreName[] = [
    STORES.SETTINGS,
    STORES.FAVORITES,
    STORES.RECENT_TOOLS,
    STORES.SNIPPETS,
    STORES.CUSTOM_PRESETS,
    STORES.SEARCH_HISTORY,
  ];

  const tx = db.transaction(storeNames, 'readwrite');
  for (const name of storeNames) {
    tx.objectStore(name).clear();
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
