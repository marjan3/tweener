import { Ease } from "./ease";
import { Tweener, Tweening } from "../src";



export class Counter {
  private readonly tweener = new Tweener();

  private _tweening: Tweening;
  public readonly container;

  constructor() {
    this.container = document.createElement("h1");
    this.container.innerText = "0";
    this._tweening = this.tweener
      .new()
      .tween(this.container, "innerText", 100, 10000.0, Ease.backout(0.6), x => {
        return x > 100 ? 100 : Math.floor(x);
      });
  }

  public async orchestrate() {
    this._tweening.startAsPromise().then(() => {
      alert("Counting finished");
    });
    setTimeout(() => {
      this._tweening.pause();
      alert("Tween Paused. Click 'ok' to continue");
      this._tweening.start();
    }, 2000);
  }

}
