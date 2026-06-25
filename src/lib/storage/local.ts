import type { StorageAdapter } from './interface';

// Adapter de arquivo para dev local. Os módulos Node (fs/path/crypto) são
// importados sob demanda dentro de cada método — assim o módulo pode ser
// importado em qualquer ambiente sem avaliar built-ins do Node no topo.

const UPLOADS_DIR = () =>
  process.env.UPLOADS_DIR ?? `${process.cwd()}/public/uploads`;

export const localAdapter: StorageAdapter = {
  async save(file: Buffer, filename: string): Promise<string> {
    const [fs, path, crypto] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
      import('node:crypto'),
    ]);
    const dir = UPLOADS_DIR();
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(filename).toLowerCase();
    const hash = crypto.createHash('sha256').update(file).digest('hex').slice(0, 16);
    const stored = `${hash}${ext}`;
    await fs.writeFile(path.join(dir, stored), file);
    return stored;
  },

  async delete(storedFilename: string): Promise<void> {
    const [fs, path] = await Promise.all([import('node:fs/promises'), import('node:path')]);
    await fs.unlink(path.join(UPLOADS_DIR(), storedFilename)).catch(() => {});
  },

  getUrl(storedFilename: string): string {
    return `/uploads/${storedFilename}`;
  },
};
