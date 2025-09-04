export class JsonLogger {
  static info(message: string, context: Record<string, unknown> = {}) {
    console.log(JSON.stringify({ level: 'info', message, ...context }));
  }

  static error(message: string, context: Record<string, unknown> = {}) {
    console.error(JSON.stringify({ level: 'error', message, ...context }));
  }
}
