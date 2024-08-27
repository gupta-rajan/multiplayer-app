declare module 'm3u8-parser' {
    export class Parser {
      push(data: string): void;
      end(): void;
      manifest: {
        // Define the shape of the manifest if known
        // This is an example; you should replace it with actual types if available
        segments?: Array<any>;
        // Add other properties as needed
      };
    }
  }
  