declare module 'stompit' {
    export interface Client {
      send(options: any): {
        write(message: string): void;
        end(): void;
      };
      disconnect(): void;
    }
    
    export function connect(
      options: any, 
      callback: (error: any, client: Client) => void
    ): void;
  }
  