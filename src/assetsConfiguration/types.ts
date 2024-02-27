import {Texture} from "pixi.js";

export interface PlayerAssets {
    dead: Texture;
    dead_outline: Texture;
    duck_1: Texture;
    duck_2: Texture;
    idle_1: Texture;
    idle_2: Texture;
    run_1: Texture;
    run_2: Texture;
    start: Texture;
}

export interface CommonAssets {
    land: Texture;
    button: Texture;
}

export interface ObstaclesAssets {
    ground_big_1: Texture;
    ground_big_2: Texture;
    ground_big_3: Texture;
    ground_small_1: Texture;
    ground_small_2: Texture;
    ground_small_3: Texture;
    fly_1: Texture;
    fly_2: Texture;
}
