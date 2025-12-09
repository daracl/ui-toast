
export interface ToastItem {
  title?: string;
  text?: string;
  enableCloseButton?: boolean;
  textColor?: string;
  enableProgress?: boolean;
  duration?: number;
  style?: "primary" | "secondary" | "info" | "success" | "warning" | "danger"| "" |undefien;
}

export interface ToastOptions {
  duration?: number;
  width?: string;
  position?: {
    vertical: "top" | "middle" | "bottom";
    horizontal: "left" | "center" | "right";
  };
  enableCloseButton?: boolean;
  zIndex?: number;
  style?: ToastStyle;
  textColor?: string;
  enableProgress?: boolean;
  items?: string | ToastItem | Array<string | ToastItem>;
  keepInstance?: boolean;
  hideCallback?: ((el: HTMLElement) => boolean) | false;
}
