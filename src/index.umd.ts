import { Toast } from "./Toast";

declare global {
  interface Window {
    Daracl?: any;
  }
}

if (typeof window !== "undefined") {
  window.Daracl = window.Daracl || {};
  window.Daracl.toast = Toast; 
}