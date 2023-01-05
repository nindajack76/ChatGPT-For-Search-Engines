import archiver from 'archiver'
import autoprefixer from 'autoprefixer'
import esbuild from 'esbuild'
import postcssPlugin from 'esbuild-style-plugin'
import fs, { promises as fsPromises } from 'fs'
import tailwindcss from 'tailwindcss'

const outdir = 'build'

async function deleteOldDir() {
  await fsPromises.rm(outdir, { recursive: true, force: true })
}

async function runEsbuild() {
  await esbuild.build({
    entryPoints: [
      'src/content-script/index.tsx',
      'src/background/index.ts',
      'src/options/index.tsx',
      'src/popup/popup-chat.jsx',
    ],
    bundle: true,
    outdir: outdir,
    treeShaking: true,
    minify: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsx: 'automatic',
    loader: {
      '.png': 'dataurl',
    },
    plugins: [
      postcssPlugin({
        postcss: {
          plugins: [tailwindcss, autoprefixer],
        },
      }),
    ],
  })
}

async function zipFolder(dir) {
  const output = fs.createWriteStream(`${dir}.zip`)
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.pipe(output)
  archive.directory(dir, false)
  await archive.finalize()
}

async function copyFiles(entryPoints, targetDir) {
  await fsPromises.mkdir(targetDir)
  await Promise.all(
    entryPoints.map(async (entryPoint) => {
      await fsPromises.copyFile(entryPoint.src, `${targetDir}/${entryPoint.dst}`)
    }),
  )
}

async function build() {
  await deleteOldDir()
  await runEsbuild()

  const commonFiles = [
    { src: 'build/content-script/index.js', dst: 'content-script.js' },
    { src: 'build/content-script/index.css', dst: 'content-script.css' },
    { src: 'build/background/index.js', dst: 'background.js' },
    { src: 'build/options/index.js', dst: 'options.js' },
    { src: 'build/options/index.css', dst: 'options.css' },
    { src: 'src/options/index.html', dst: 'options.html' },
    { src: 'src/popup/popup-chat.html', dst: 'popup.html' },
    { src: 'build/popup/popup-chat.js', dst: 'popup-chat.js' },
    { src: 'src/logo.png', dst: 'logo.png' },
  ]

  // chromium
  await copyFiles(
    [...commonFiles, { src: 'src/manifest.json', dst: 'manifest.json' }],
    `./${outdir}/chromium`,
  )

  await zipFolder(`./${outdir}/chromium`)

  // firefox
  await copyFiles(
    [...commonFiles, { src: 'src/manifest.v2.json', dst: 'manifest.json' }],
    `./${outdir}/firefox`,
  )

  await zipFolder(`./${outdir}/firefox`)

  console.log('Build success.')
}

build()
