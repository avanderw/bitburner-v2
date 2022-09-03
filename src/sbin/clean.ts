import {NS} from "/lib/NetscriptDefinitions";

export const release = {
    "version": "1.0-beta",
    "description": "Remove all js files.",
    "log": ["1.0 Remove all js files"]
}

export async function main(ns: NS) {
    for (const filename of ns.ls("home", ".js")) {
        ns.rm(filename);
    }
}