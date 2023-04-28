import { createFilter, FilterPattern } from '@rollup/pluginutils'
import { transform } from '@svgr/core'
import type { Config } from '@svgr/core'
import fs from 'fs'
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
  svgrOptions?: Config
  esbuildOptions?: EsbuildTransformOptions
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

export default function viteSvgr({
  exportAsDefault = false,
  sourceMap = false,
  svgrOptions,
  esbuildOptions,
  include = '**/*.svg',
  exclude,
  isTypescript = false
}: ViteSvgrOptions): Plugin {
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
          }
        })
        const res = await transformWithEsbuild(`export default ${componentCode}`, id, {
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
