// Mock Next.js Request/Response
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock Request if not available
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    body: any;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this.url = input;
      } else {
        this.url = input.url;
      }
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      return this.body;
    }

    async text() {
      return this.body?.toString() || '';
    }
  } as any;
}

// Mock Response if not available
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: any;
    status: number;
    statusText: string;
    headers: Headers;

    constructor(body?: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || '';
      this.headers = new Headers(init?.headers);
    }

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body);
      }
      return this.body;
    }

    async text() {
      return this.body?.toString() || '';
    }
  } as any;
}

// Mock Headers if not available
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();

    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this.headers.set(key.toLowerCase(), value);
          });
        } else if (init instanceof Headers) {
          init.forEach((value, key) => {
            this.headers.set(key.toLowerCase(), value);
          });
        } else {
          Object.entries(init).forEach(([key, value]) => {
            this.headers.set(key.toLowerCase(), String(value));
          });
        }
      }
    }

    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }

    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach(callback);
    }
  } as any;
}