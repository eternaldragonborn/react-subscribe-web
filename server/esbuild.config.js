import esbuild from "esbuild";

const args = process.argv;
// console.log(args);
const watch = Number(args[2] ?? 1);
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
    watch: watch
      ? {
          onRebuild(error) {
            error
              ? console.error("build failed, " + error.message)
              : console.log("watching...");
          },
        }
      : false,
    bundle: true,
    format: "esm",
    minify: true,
    external: ["./node_modules/*", "./build/*"],
    tsconfig: "./tsconfig.json",
  })
  .then(() => console.log("building..."));
// }
