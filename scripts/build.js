const esbuild = require('esbuild');

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  globalName: 'MLToolbox',
  target: ['es2019'],
  footer: {
    js: "if (typeof module === 'object' && module.exports) module.exports = MLToolbox; if (typeof globalThis !== 'undefined') globalThis.MLToolbox = MLToolbox;",
  },
};

async function run() {
  const watchMode = process.argv.includes('--watch');

  if (watchMode) {
    const context = await esbuild.context({
      ...shared,
      outfile: 'dist/mltb.js',
      sourcemap: true,
    });

    await context.watch();
    console.log('Watching and rebuilding dist/mltb.js...');
    return;
  }

  await esbuild.build({
    ...shared,
    outfile: 'dist/mltb.js',
    sourcemap: true,
  });

  await esbuild.build({
    ...shared,
    outfile: 'dist/mltb.min.js',
    minify: true,
  });

  console.log('Built dist/mltb.js and dist/mltb.min.js');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
