import esbuild from "esbuild";
import { esbuildDecorators } from "@anatine/esbuild-decorators";

const args = process.argv;
// console.log(args);
const watch = Number(args[2] ?? 1);
const test = args[3];
// export default function build(watch = true) {
esbuild
  .build({
    entryPoints: [
      "index.ts",
      // "test.ts",
    ],
    define: {
      DEV: "true",
    },
    outdir: "./build",
    platform: "node",
    bundle: true,
    format: "esm",
    plugins: [esbuildDecorators()],
    // minify: true,
    external: ["./node_modules/*", "./build/*"],
    tsconfig: "./tsconfig.json",
  })
  .then(() => console.log("building..."));
// }
