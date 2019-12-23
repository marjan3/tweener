import FixedUpdater from "./FixedUpdater";

/**
 * This is the starting point of using the tweener.
 * This class is responsible for creating tweens by calling the `new()` method,
 * but first the TWEENER must be initialized with an updater to work properly.
 * The idea is to consider this tweener as a component of another component or another entity.
 * @see Updater for more details.
 * Here, below you will find a usage examples of usage:
 * @example
 *
 * const targetPosition = ...;
 * const targetScale = ...;
 * const targetRotation = ...;
 * const t = ...;
 * const Ease = { ... };
 *
 * const tw = new Tweener(app.ticker);
 * tw.new()
 *   .tween(obj1, obj1["position"], targetPosition, t, Ease.none())
 *   .tween(obj1, obj1["scale"], targetScale, t, Ease.backin(0.2))
 *   .tween(obj1, obj1["rotation"], targetRotation, t, Ease.backin(0.2))
 * .start();
 *
 * tw.new()
 *   .tween(obj2, "position", targetPosition, t, Ease.backin(0.6))
 * .start();
 *
 * tw.new()
 *   .tween(obj3, obj3["scale"], targetScale, t, Ease.backout(0.6))
 * .start();
 *
 * tw.new()
 *   .tween(obj4, obj4["rotation"], targetRotation, t, Ease.backin(0.6))
 * .start();
 */
export class Tweener {
  private readonly updater: Updater;

  constructor(updater: Updater = new FixedUpdater()) {
    this.updater = updater;
  }

  public new(): Tweening {
    return new Tweening(this.updater);
  }
}

/**
 * The easing type.
 * You can get these functions at https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
 */
export type EASING = (x: number) => number;

/**
 * The update function takes a delta time as input type and in most cases it doesn't return anything
 */
export type UPDATE_FUNC = (delta: number) => void;

/**
 * The updater is responsible for calling the tweens update functions
 */
export interface Updater {
  add: (updateFunc: UPDATE_FUNC) => any;
  remove: (updateFunc: UPDATE_FUNC) => any;

  readonly minFPS: number;
}

/**
 * The Tween Options are defining the interface of the input parameters needed for creating the tween
 */
export interface TweenOption {
  /**
   * The object that we would like to modify its property
   */
  object: any;
  /**
   * The actual name of the property that will be modified during tweening
   */
  property: string;
  /**
   * Desired value to reach
   */
  finalValue: object | number;
  /**
   * Over how long period should the tweening happen. Its in miliseconds.
   */
  duration: number;
  /**
   * The Easing
   * @see EASING for more details
   */
  easing: EASING;
  /**
   * Initial value from which the tweening will begin. Defaults to: object[property].
   */
  initialValue?: any;
  /**
   * Set function that is being called each time the updated value is being set. Can be used to customize how the value is being changed. Defaults to: (x) => x.
   */
  set: Function;
  /**
   * Used to register an onchange function. Every time the specified object[property] will be changed, this function will be called. Defaults to: null.
   */
  onChange?: Function;
  /**
   * Used to register an oncomplete function. After the tweening finished this function will be called. Defaults to: null.
   */
  onComplete?: Function;
  /**
   * The start time of the tween. It can be in the future. Default: Date.now()
   */
  time?: number;
}

/**
 * Responsible for managing the different tween options
 */
export class Tweening {
  private readonly updater: Updater;
  private readonly tweenOptions: Array<TweenOption>;

  private shouldRun: boolean;

  private handleFinish: Function;

  private handleError: Function;

  private readonly DEFAULT_HANDLER = () => {};

  public constructor(updater: Updater = new FixedUpdater()) {
    this.updater = updater;
    this.tweenOptions = [];
    this.shouldRun = false;
    this.handleFinish = this.DEFAULT_HANDLER;
    this.handleError = this.DEFAULT_HANDLER;
  }

  public tween(
    object: any,
    property: string,
    finalValue: object | number,
    duration: number,
    easing: EASING,
    set = v => v,
    initialValue?: any,
    onChange?: Function,
    onComplete?: Function,
    startTime?: number
  ): Tweening {
    if (object[property] === finalValue) {
      return this;
    }

    this.tweenOptions.push({
      object,
      property,
      finalValue,
      duration,
      easing,
      initialValue,
      set,
      onChange,
      onComplete,
      time: startTime
    } as TweenOption);
    return this;
  }

  public start(finish?: Function, errorOccurred?: Function): Tweening {
    this.shouldRun = true;
    this.handleFinish = finish ? finish : this.DEFAULT_HANDLER;
    this.handleError = errorOccurred ? errorOccurred : this.DEFAULT_HANDLER;
    for (const t of this.tweenOptions) {
      Tweening.resolveOptionalValues(t);
    }
    this.updater.add(this.update);
    return this;
  }

  public startAsPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.start();
      this.handleFinish = () => resolve();
      this.handleError = (err: Error) => reject(err);
    });
  }

  public pause(): void {
    this.updater.remove(this.update);
  }

  public stop(): void {
    this.updater.remove(this.update);
    for (const t of this.tweenOptions) {
      t.object[t.property] = t.set(t.initialValue);
    }
  }

  /**
   * The main update function to calculate changing of values for each tween created.
   * In future it might use delta from the updater
   * */
  public update = (): void => {
    if (this.shouldRun) {
      const remove: Array<TweenOption> = [];

      for (let i = 0; i < this.tweenOptions.length; i++) {
        const t = this.tweenOptions[i];

        if (t.time === null || t.time === undefined || t.time < 0) {
          throw Error(
            "time of tween must not be null, undefined or less than zero"
          );
        }

        t.time += this.updater.minFPS;

        const phase = Math.min(1, t["time"] / t.duration);

        if (
          typeof t.object[t.property] === "number" ||
          typeof t.object[t.property] === "string"
        ) {
          t.object[t.property] = t.set(
            linearInterpolation(t.initialValue, t.finalValue as number, t.easing(phase))
          );
        } else {
          throw Error("Can not interpolate a property that is not a number");
        }

        if (t.onChange) {
          t.onChange(t);
        }

        if (phase == 1) {
          t.object[t.property] = t.finalValue;
          if (t.onComplete) {
            t.onComplete(t);
          }
          remove.push(t);
        }
      }

      for (let i = 0; i < remove.length; i++) {
        this.tweenOptions.splice(this.tweenOptions.indexOf(remove[i]), 1);
      }

      if (this.tweenOptions.length === 0) {
        this.shouldRun = false;
        this.handleFinish();
      }
    }
  };

  private static resolveOptionalValues(tweenOption: TweenOption): void {
    if (!tweenOption.time) {
      tweenOption.time = 0;
    } else {
      if (tweenOption.time < 0) {
        throw Error(
          "Can not start a tween in the past. Time travel not allowed"
        );
      }
    }
    if (!tweenOption.initialValue) {
      tweenOption.initialValue = tweenOption.object[tweenOption.property];
    }
  }
}

/**
 * Basic linearInterpolation function. https://en.wikipedia.org/wiki/Linear_interpolation
 * @param a1 - initial value
 * @param a2 - final value
 * @param t - time
 */
function linearInterpolation(a1: number, a2: number, t: number): number {
  return a1 * (1 - t) + a2 * t;
}
