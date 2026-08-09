declare module 'libreoffice-convert' {
  export function convert(
    document: Buffer,
    format: string,
    filter: string | undefined,
    callback: (err: Error | null, result: Buffer) => void,
  ): void;

  export function convertAsync(
    document: Buffer,
    format: string,
    filter: string | undefined,
  ): Promise<Buffer>;
}
