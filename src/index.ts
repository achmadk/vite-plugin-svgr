import { createFilter, FilterPattern } from '@rollup/pluginutils'
import { transform } from '@svgr/core'
import type { Config } from '@svgr/core'
import jsx from '@svgr/plugin-jsx'
import fs, { unwatchFile } from 'fs'
import type { EsbuildTransformOptions, Plugin } from 'vite'
import { transformWithEsbuild } from 'vite'

export interface ViteSvgrOptions {
  /**
   * Export React component as default. Notice that it will overrides
   * the default behavior of Vite, which exports the URL as default
   *
   * @default false
   */
  exportAsDefault?: boolean

  /**
   * @default false
   */
  sourceMap?: boolean

  /**
   * @default undefined
   */
  svgrOptions?: Config

  /**
   * @default undefined
   */
  esbuildOptions?: EsbuildTransformOptions

  /**
   * @default undefined
   */
  exclude?: FilterPattern

  /**
   * @default all files with .svg extension
   */
  include?: FilterPattern

  /**
   * @default false
   */
  isTypescript?: boolean
}

export default function viteSvgr(options?: ViteSvgrOptions): Plugin {
  const exportAsDefault = options?.exportAsDefault ?? false
  const sourceMap = options?.sourceMap ?? false
  const include = options?.include ?? '**/*.svg'
  const isTypescript = options?.isTypescript ?? false
  const exclude = options?.exclude ?? undefined
  const svgrOptions = options?.svgrOptions ?? undefined
  const esbuildOptions = options?.esbuildOptions ?? undefined

  const filter = createFilter(include, exclude)
  return {
    name: 'vite-plugin-svgr',
    async transform(code, id) {
      if (filter(id)) {
        const svgCode = await fs.promises.readFile(
          id.replace(/\?.*$/, ''),
          'utf8'
        )
        const componentCode = transform.sync(svgCode, svgrOptions, {
          filePath: id,
          caller: {
            previousExport: exportAsDefault ? null : code,
            defaultPlugins: [jsx]
          }
        })
        const res = await transformWithEsbuild(componentCode, id, {
          loader: isTypescript ? 'tsx' : 'jsx',
          ...(esbuildOptions ?? {}),
        })
        return {
          code: res.code,
          map: sourceMap ? res.map : null,
        }
      }
    },
  }
}
