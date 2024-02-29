import {AssetsManifest} from "pixi.js";

export const playerResourcesManifest: AssetsManifest = {
    bundles: [
        {
            name: "player",
            assets: [
                {
                    alias: "dead",
                    src: "public/assets/dino/player/dead/dino-dead.png",
                },
                {
                    alias: "dead_outline",
                    src: "public/assets/dino/player/dead/dino-dead-outline.png",
                },
                {
                    alias: "duck_1",
                    src: "public/assets/dino/player/duck/dino-duck-1.png",
                },
                {
                    alias: "duck_2",
                    src: "public/assets/dino/player/duck/dino-duck-2.png",
                },
                {
                    alias: "idle_1",
                    src: "public/assets/dino/player/idle/dino-idle-1.png",
                },
                {
                    alias: "idle_2",
                    src: "public/assets/dino/player/idle/dino-idle-2.png",
                },
                {
                    alias: "run_1",
                    src: "public/assets/dino/player/run/dino-run-1.png",
                },
                {
                    alias: "run_2",
                    src: "public/assets/dino/player/run/dino-run-2.png",
                },
                {
                    alias: "start",
                    src: "public/assets/dino/player/dino-start.png",
                }
            ]
        },
        {
            name: "common",
            assets: [
                {
                    alias: "land",
                    src: "public/assets/dino/ground.png"
                },
                {
                    alias: "button",
                    src: "public/assets/dino/button.png"
                }
            ]
        },
        {
            name: "obstacles",
            assets: [
                {
                    alias: "ground_big_1",
                    src: "public/assets/dino/obstacles/cactus-big-1.png",
                },
                {
                    alias: "ground_big_2",
                    src: "public/assets/dino/obstacles/cactus-big-2.png",
                },
                {
                    alias: "ground_big_3",
                    src: "public/assets/dino/obstacles/cactus-big-3.png",
                },
                {
                    alias: "ground_small_1",
                    src: "public/assets/dino/obstacles/cactus-small-1.png",
                },
                {
                    alias: "ground_small_2",
                    src: "public/assets/dino/obstacles/cactus-small-2.png",
                },
                {
                    alias: "ground_small_3",
                    src: "public/assets/dino/obstacles/cactus-small-3.png",
                },
                {
                    alias: "fly_1",
                    src: "public/assets/dino/obstacles/bird/bird-1.png",
                },
                {
                    alias: "fly_2",
                    src: "public/assets/dino/obstacles/bird/bird-2.png",
                },
            ]
        }
    ]
};
