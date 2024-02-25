import {AssetsManifest} from "pixi.js";

export const playerResourcesManifest: AssetsManifest = {
    bundles: [
        {
            name: "dead",
            assets: [
                {
                    alias: "dead",
                    src: "public/assets/player/dead/dino-dead.png",
                },
                {
                    alias: "dead_outline",
                    src: "public/assets/player/dead/dino-dead-outline.png",
                }
            ]
        },
        {
            name: "duck",
            assets: [
                {
                    alias: "duck_1",
                    src: "public/assets/player/duck/dino-duck-1.png",
                },
                {
                    alias: "duck_2",
                    src: "public/assets/player/duck/dino-duck-2.png",
                }
            ]
        },
        {
            name: "idle",
            assets: [
                {
                    alias: "idle_1",
                    src: "public/assets/player/idle/dino-idle-1.png",
                },
                {
                    alias: "idle_2",
                    src: "public/assets/player/idle/dino-idle-2.png",
                }
            ]
        },
        {
            name: "run",
            assets: [
                {
                    alias: "run_1",
                    src: "public/assets/player/run/dino-run-1.png",
                },
                {
                    alias: "run_2",
                    src: "public/assets/player/run/dino-run-2.png",
                }
            ]
        },
        {
            name: "common",
            assets: [
                {
                    alias: "start",
                    src: "public/assets/player/dino-start.png",
                },
            ]
        },
    ]
}