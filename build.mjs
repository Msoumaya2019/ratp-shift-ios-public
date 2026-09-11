import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('App/Web',{recursive:true});
await build({entryPoints:['web/main.tsx'],bundle:true,outfile:'App/Web/app.js',format:'iife',jsx:'automatic',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
await writeFile('App/Web/index.html','<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="stylesheet" href="app.css"><title>RATP Shift</title></head><body><div id="root"></div><script src="app.js"></script></body></html>');

