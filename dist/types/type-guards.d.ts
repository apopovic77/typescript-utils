import { Lerpable } from "./Lerpable";
import { Equatable } from "./Lerpable";
import { Slerpable } from "./Slerpable";
export declare function isLerpable(obj: any): obj is Lerpable<any>;
export declare function isSlerpable(obj: any): obj is Slerpable<any>;
export declare function isEquatable(obj: any): obj is Equatable<any>;
