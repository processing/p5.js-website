import puppeteer from "puppeteer";
import { checkFileExists } from "../../pages/_utils-node";
import { writeFile } from "fs/promises";

export interface CodeTab {
  code: string; // "// let foo = 0;\n\nfunction preload() {\n *content* \n}\n\n\nfunction setup() {\n *content* \n}\n"
  codeID: string; // "23340383"
  createdOn: string; // "2024-02-18 19:48:48"
  orderID: string; // "0"
  title: string; // "mySketch.js"
  updatedOn: string; //"2024-02-18 19:48:48"
}

export type CodeInfo = CodeTab[];

export class Semaphore {
  private _max: number;
  public counter: number = 0;
  private waiting: (() => void)[] = [];

  constructor(max: number) {
    this._max = max;
  }

  get max() {
    return this._max;
  }

  get numWaiting() {
    return this.waiting.length;
  }

  canAcquire(): boolean {
    return this.counter < this.max;
  }

  acquire(): Promise<void> {
    if (this.counter < this.max) {
      this.counter++;
      return Promise.resolve();
    } else {
      return new Promise((resolve) => {
        this.waiting.push(resolve);
      });
    }
  }

  release(): void {
    this.counter--;
    const task = this.waiting.shift();
    if (task) {
      this.counter++;
      task();
    }
  }

  async runLocked(cb: () => Promise<void> | void) {
    await this.acquire();
    await cb();
    this.release();
  }

  reset() {
    this.waiting = [];
    this.counter = 0;
  }
}

// Only let 3 OP renderers go at once to not break my computer lol
const opSem = new Semaphore(3);

export async function generateOPThumb(sketchID: string) {
  await opSem.acquire();
  const fileName = `src/content/sketches/images/${sketchID}.png`;
  if (await checkFileExists(fileName)) return fileName; // Already exists

  const codeInfo = (await fetch(
    `https://beta.openprocessing.org/api/sketch/${sketchID}/code`,
  ).then((res) => res.json())) as CodeInfo;
  const isDynamicSized = codeInfo.some((tab) =>
    /createCanvas\(\s*(\d+),\s*(\d+)\s*(?:,\s*(?:P2D|WEBGL)\s*)?\)/m.exec(
      tab.code,
    ),
  );
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.setViewport(
    isDynamicSized
      ? { width: 750, height: 500, deviceScaleFactor: 2 }
      : { width: 375, height: 250, deviceScaleFactor: 4 },
  );
  page.on("console", (consoleObj) => console.log(consoleObj.text()));
  page.on("error", (e) => console.log("ERROR: " + e + "\n" + e?.stack));
  page.on("pageerror", (e) =>
    console.log("PAGE ERROR: " + e + "\n" + e?.stack),
  );
  await page.goto(`https://openprocessing.org/sketch/${sketchID}`);
  const iframe = await page.waitForSelector("iframe");
  if (!iframe) {
    opSem.release();
    throw new Error("Could not load frame");
  }
  console.log(`Loaded iframe for sketch ${sketchID}`);
  const frame = await iframe.contentFrame();
  await frame.waitForSelector("canvas");
  await new Promise((res) => setTimeout(res, 1500));
  const data = await frame.evaluate(() => {
    const canvas = (document.querySelector("#defaultCanvas0") ||
      document.querySelector("canvas")) as HTMLCanvasElement;
    const w = canvas.width;
    const h = canvas.height;
    const scale = Math.max(1500 / w, 1000 / h);
    const thumbCanvas = document.createElement("canvas") as HTMLCanvasElement;
    thumbCanvas.width = 1500;
    thumbCanvas.height = 1000;
    const ctx = thumbCanvas.getContext("2d")!;
    ctx.translate(1500 / 2, 1000 / 2);
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, -w / 2, -h / 2);
    const data = thumbCanvas.toDataURL("png");
    return data;
  });
  await browser.close();
  const base64Data = data.replace(/^data:image\/png;base64,/, "");
  await writeFile(fileName, base64Data, "base64");
  opSem.release();
  return fileName;
}
