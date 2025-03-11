import {AssetsManifest} from "pixi.js";

export const gameResourcesManifest = (character: string) => {
    const manifest: AssetsManifest = {
        bundles: [
            {
                name: "player",
                assets: [
                    {
                        alias: "dead",
                        src: `public/assets/${character}/player/dead/dead.png`,
                    },
                    {
                        alias: "dead_outline",
                        src: `public/assets/${character}/player/dead/dead-outline.png`,
                    },
                    {
                        alias: "duck_1",
                        src: `public/assets/${character}/player/duck/duck-1.png`,
                    },
                    {
                        alias: "duck_2",
                        src: `public/assets/${character}/player/duck/duck-2.png`,
                    },
                    {
                        alias: "idle_1",
                        src: `public/assets/${character}/player/idle/idle-1.png`,
                    },
                    {
                        alias: "idle_2",
                        src: `public/assets/${character}/player/idle/idle-2.png`,
                    },
                    {
                        alias: "run_1",
                        src: `public/assets/${character}/player/run/run-1.png`,
                    },
                    {
                        alias: "run_2",
                        src: `public/assets/${character}/player/run/run-2.png`,
                    },
                    {
                        alias: "start",
                        src: `public/assets/${character}/player/start.png`,
                    }
                ]
            },
            {
                name: "common",
                assets: [
                    {
                        alias: "land",
                        src: `public/assets/${character}/ground.png`
                    },
                    {
                        alias: "button",
                        src: `public/assets/${character}/button.png`
                    }
                ]
            },
            {
                name: "obstacles",
                assets: [
                    {
                        alias: "ground_big_1",
                        src: `public/assets/${character}/obstacles/ground-big-1.png`,
                    },
                    {
                        alias: "ground_big_2",
                        src: `public/assets/${character}/obstacles/ground-big-2.png`,
                    },
                    {
                        alias: "ground_big_3",
                        src: `public/assets/${character}/obstacles/ground-big-3.png`,
                    },
                    {
                        alias: "ground_small_1",
                        src: `public/assets/${character}/obstacles/ground-small-1.png`,
                    },
                    {
                        alias: "ground_small_2",
                        src: `public/assets/${character}/obstacles/ground-small-2.png`,
                    },
                    {
                        alias: "ground_small_3",
                        src: `public/assets/${character}/obstacles/ground-small-3.png`,
                    },
                    {
                        alias: "fly_1",
                        src: `public/assets/${character}/obstacles/bird/bird-1.png`,
                    },
                    {
                        alias: "fly_2",
                        src: `public/assets/${character}/obstacles/bird/bird-2.png`,
                    },
                ]
            }
        ]
    };

    return manifest;
};
