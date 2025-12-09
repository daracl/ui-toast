import { isArray, isBlank } from "@daracl/core";
import { ToastItem, ToastOptions } from "./types/toast";

/* ------------------------------
 * 내부 기본값
 * ------------------------------ */
let TOAST_IDX = 0;
declare const APP_VERSION: string

const styleClassMap: Record<string, string> = {
  primary: "dt-primary",
  secondary: "dt-secondary",
  info: "dt-info",
  success: "dt-success",
  warning: "dt-warning",
  danger: "dt-danger",
};


const horizontalPositionStyleClassMap: Record<string, string> = {
  left: "dt-left",
  right: "dt-right",
  center: "dt-center",
};

const verticalPositionStyleClassMap: Record<string, string> = {
  top: "dt-top",
  middle: "dt-middle",
  bottom: "dt-bottom",
};

const defaultToastItem: Required<Omit<ToastItem, "title" | "text">> & { title: string; text: string } = {
  title: "",
  text: "",
  enableCloseButton: true,
  textColor: "#000000",
  enableProgress: true,
  duration: 3,
  style: "",
};

let defaultOptions: Required<ToastOptions> = {
  duration: 3,
  width: "",
  position: {
    vertical: "middle",
    horizontal: "center",
  },
  enableCloseButton: true,
  zIndex: 10000,
  style: "success",
  textColor: "#000000",
  enableProgress: false,
  items: "",
  keepInstance: false,
  hideCallback: false,
};

/* ------------------------------
 * 헬퍼 함수
 * ------------------------------ */
function toastHiddenElement(): HTMLElement {
  let hiddenElement = document.getElementById("daraclToastHidden");

  if (!hiddenElement) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div id="daraclToastHidden" class="daracl-toast-hidden" 
      style="visibility: visible; width: 0;height: 0;z-index: 1000;"></div>`
    );

    hiddenElement = document.getElementById("daraclToastHidden") as HTMLElement;
  }

  return hiddenElement;
}

/* ------------------------------
 * Toast 클래스
 * ------------------------------ */
export class Toast {
  public static VERSION = `${APP_VERSION}`
  private options: Required<ToastOptions>;
  private toastWrapperElement: HTMLElement;
  private viewItemCount = 0;

  constructor(options: ToastOptions | string) {

    if(isBlank(options)){
      return ; 
    }

    if (typeof options === "string") {
      options = { items: options };
    }

    this.options = Object.assign({}, defaultOptions, options);
    TOAST_IDX++;

    const wrapper = document.createElement("div");

    const horizontalClass =
      horizontalPositionStyleClassMap[this.options.position.horizontal] ||
      horizontalPositionStyleClassMap.right;
    const verticalClass =
      verticalPositionStyleClassMap[this.options.position.vertical] ||
      verticalPositionStyleClassMap.top;

    wrapper.className = `daracl-toast-wrapper ${horizontalClass} ${verticalClass} dt-${TOAST_IDX}`;

    wrapper.style.width = this.options.width;
    wrapper.style.zIndex = String(this.options.zIndex);

    toastHiddenElement().appendChild(wrapper);
    this.toastWrapperElement = wrapper;

    this.show(this.options.items);
  }

  static create(options: ToastOptions | string) {
    return new Toast(options);
  }

  static setOptions(options: ToastOptions) {
    defaultOptions = Object.assign({}, defaultOptions, options);
  }

  /* ------------------------------ */

  addItem(item: ToastItem) {
    const enableHeader = !!item.title;
    const toastElement = document.createElement("div");
    const style = item.style || this.options.style;

    const styleClass = styleClassMap[style] ?? styleClassMap.success;

    toastElement.className = `daracl-toast ${styleClass} ${enableHeader ? "dt-header" : ""}`;
    this.viewItemCount++;

    const html = `
      ${enableHeader ? `<div class="dt-header" style="color:${item.textColor};">${item.title}</div>` : ""}
      <div class="dt-body">
          <div class="dt-content" style="color:${item.textColor};">${item.text}</div>
      </div>
      ${item.enableCloseButton ? '<span class="dt-close">×</span>' : ""}
      ${
        item.enableProgress
          ? `<div class="dt-progress-bar" style="animation: progressAnimation ${item.duration}s;"></div>`
          : ""
      }
    `;

    toastElement.innerHTML = html;

    if (this.options.position.vertical === "top") {
      this.toastWrapperElement.insertAdjacentElement("afterbegin", toastElement);
    } else {
      this.toastWrapperElement.appendChild(toastElement);
    }

    const timeout = window.setTimeout(() => this.hide(toastElement), (item.duration||3) * 1000);
    (toastElement as any).timer = timeout;

    const closeBtn = toastElement.querySelector(".dt-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if ((toastElement as any).timer) clearTimeout((toastElement as any).timer);
        this.hide(toastElement, true);
      });
    }
  }

  /* ------------------------------ */

  show = (viewItems: ToastOptions["items"]) => {
    if (!viewItems) return this;

    let items: Array<string | ToastItem> = [];

    if (typeof viewItems === "string") items = [viewItems];
    else if (isArray(viewItems)) items = viewItems;
    else items = [viewItems];

    items.forEach((item) => {
      let viewItem: ToastItem = typeof item === "string" ? { text: item } : item;

      viewItem = Object.assign(
        {},
        defaultToastItem,
        {
          enableCloseButton: viewItem.enableCloseButton ?? this.options.enableCloseButton,
          enableProgress: viewItem.enableProgress ?? this.options.enableProgress,
          duration: viewItem.duration ?? this.options.duration,
          textColor: viewItem.textColor ?? this.options.textColor,
        },
        viewItem
      );

      this.addItem(viewItem);
    });

    return this;
  };

  /* ------------------------------ */

  hide(toastElement: HTMLElement, forceClose = false) {
    let hideFlag = true;

    if (!forceClose && this.options.hideCallback) {
      if (this.options.hideCallback.call(this, toastElement) === false) {
        hideFlag = false;
      }
    }

    if (!hideFlag) return;

    this.viewItemCount--;
    toastElement.classList.add("hide");

    const timer = (toastElement as any).timer;
    if (timer) clearTimeout(timer);

    setTimeout(() => {
      this.toastWrapperElement.removeChild(toastElement);
    }, 500);

    if (!this.options.keepInstance && this.viewItemCount < 1) {
      this.destroy();
    }
  }

  /* ------------------------------ */

  destroy = () => {
    toastHiddenElement().removeChild(this.toastWrapperElement);
  };
}