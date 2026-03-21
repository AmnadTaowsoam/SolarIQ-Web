// Offline IndexedDB stub — full implementation in WK-033
export async function openDB(name: string) {
  return {
    get: async (_store: string, _key: string) => null,
    put: async (_store: string, _value: unknown) => null,
    delete: async (_store: string, _key: string) => null,
  }
}
