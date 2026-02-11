'use client';

export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
  };
  
  export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;
  
    constructor(context: SecurityRuleContext) {
      const message = `Firestore Permission Denied: Cannot ${context.operation} on ${context.path}.`;
      super(message);
      this.name = 'FirestorePermissionError';
      this.context = context;
  
      // This is for V8 only (Chrome, Node, etc.)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, FirestorePermissionError);
      }
    }
  
    toString() {
      return `${this.name}: ${this.message}`;
    }
  }
