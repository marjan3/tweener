import { Updater, UPDATE_FUNC } from "./Tweener";

export default class FixedUpdater implements Updater {
  private functions: Function[];
  private lastRender: number;
  private _minFPS = 1000 / 60;

  private readonly loop: FrameRequestCallback;

  get minFPS(): number {
    return this._minFPS;
  }
  set minFPS(value: number) {
    this._minFPS = value;
  }

  constructor() {
    this.functions = [];
    this.lastRender = 0;
    this.loop = timestamp => {
      const progress = timestamp - this.lastRender;

      this.functions.forEach(f => {
        f(progress);
      });

      this.lastRender = timestamp;
      setTimeout(this.loop, this.minFPS);
    };
    setTimeout(this.loop, this.minFPS);
  }

  public add(updateFunc: UPDATE_FUNC) {
    this.functions.push(updateFunc);
  }

  public remove(updateFunc: UPDATE_FUNC) {
    const index = this.functions.indexOf(updateFunc, 0);
    if (index > -1) {
      this.functions.splice(index, 1);
    }
  }
}
