'use strict';

const {StringPrompt} = require('enquirer');
const {readdirSync, realpathSync, Dirent} = require('node:fs')
const {cwd} = require('node:process')
const ansiColors = require('ansi-colors')
const path = require("node:path");

class PathPrompt extends StringPrompt {
    selected = "";
    /**
     * @type {Dirent[]}
     */
    matchedDirs;

    constructor(options) {
        super(options);
        this.matchedDirs = PathPrompt.readDirectories()
        this.cwd = cwd();
    }

    delete() {
        let { cursor } = this.state;
        if (cursor <= 1) this.matchedDirs = PathPrompt.readDirectories()
        super.delete()
    }
    dispatch(ch, key) {
        if (!ch || key.ctrl || key.code) return this.alert();

        let resolvedPath = this.resolvePathFromInput((this.input+ch)||'.');
        const parentDir = path.dirname(resolvedPath)
        this.matchedDirs = readdirSync(this.input?.length > 0 ? path.dirname(resolvedPath) : cwd(), {
            withFileTypes: true
        }).filter(dirEntry => dirEntry.isDirectory())
          .filter(dir => path.join(dir.path, dir.name).startsWith(resolvedPath));

        this.append(ch);
    }

    /**
     * @return {Dirent[]}
     */
    static readDirectories(path = cwd()) {
        try {
            return readdirSync(path, {
                withFileTypes: true,
                recursive: false
            }).filter(dirEntry => dirEntry.isDirectory());
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async hint() {
        const hintMessage = this.options?.hint?.message || 'Absolute path: ';
        return `\n${ansiColors.dim(hintMessage + this.resolvePathFromInput(this.input))}`
    }

    submit() {
        this.value = this.resolvePathFromInput(this.input||"")
        super.submit()
    }

    resolvePathFromInput(input) {
        let fullPath;
        try {
            fullPath = realpathSync(input)
        } catch (error) {
            fullPath = `${realpathSync(this.cwd)}/${input}`
        }
        return path.normalize(fullPath)
    }

    async footer() {

        const stripDirNavPrefix = this.input.replaceAll(/^[.\/]*/g, '');
        const mapped = this.matchedDirs
            .map(dir => dir.name)
            .map(path => ansiColors.cyanBright(path.substring(0,stripDirNavPrefix.length)+ansiColors.cyan(path.substring(stripDirNavPrefix.length))));

        return mapped.length > 0 ? mapped.join('\n') : ansiColors.cyanBright(this.resolvePathFromInput(this.input||""));
    }
}

module.exports = PathPrompt;