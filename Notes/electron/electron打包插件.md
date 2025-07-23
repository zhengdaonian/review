```vite.electron.dev.ts
// 开发环境的electron插件
import type { AddressInfo } from 'node:net';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import type { Plugin } from 'vite';
import esbuild from 'esbuild';
import electron from 'electron';

const buildBackground = () => {
  esbuild.buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.cjs',
    platform: 'node',
    target: 'node16',
    external: ['electron', 'better-sqlite3']
  });
};

const buildPreload = () => {
  esbuild.buildSync({
    entryPoints: ['src/preload.ts'],
    bundle: true,
    outfile: 'dist/preload.cjs',
    platform: 'node',
    target: 'node16',
    external: ['electron', 'better-sqlite3']
  });
};

export const ElectronDevPlugin = (): Plugin => {
  return {
    name: 'electron-dev',
    configureServer(server) {
      buildBackground();
      buildPreload();
      server?.httpServer?.on('listening', () => {
        // 读取vite服务信息
        const addressInfo = server?.httpServer?.address() as AddressInfo;
        // 拼接IP地址，用于打开electron
        const IP = `http://localhost:${addressInfo.port}`;

        // 找到electron的路径
        // electron 不认识ts文件

        let ElectronProcess = spawn(electron as unknown as string, ['dist/background.cjs', IP]);
        fs.watchFile('src/background.ts', () => {
          ElectronProcess.kill();
          buildBackground();

          ElectronProcess = spawn(electron as unknown as string, ['dist/background.cjs', IP]);
        });

        fs.watchFile('src/preload.ts', () => {
          buildPreload();
        });

        ElectronProcess.stderr.on('data', err => {
          console.log('日志', err.toString());
        });
      });
    }
  };
};
```

```vite.electron.build.ts
// 生产环境的electron插件
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import type { Plugin } from 'vite';
import * as electronBuilder from 'electron-builder';
import esbuild from 'esbuild';
import { exec } from 'node:child_process';

const buildBackground = () => {
  esbuild.buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.cjs',
    platform: 'node',
    target: 'node16',
    external: ['electron', 'better-sqlite3']
  });
};

const buildPreload = () => {
  esbuild.buildSync({
    entryPoints: ['src/preload.ts'],
    bundle: true,
    outfile: 'dist/preload.cjs',
    platform: 'node',
    target: 'node16',
    external: ['electron', 'better-sqlite3']
  });
};

const buildRemoveLocales = () => {
  esbuild.buildSync({
    entryPoints: ['src/removeLocales.ts'],
    bundle: true,
    outfile: 'dist/removeLocales.cjs',
    platform: 'node',
    target: 'node16',
    external: ['electron']
  });
};

export const ElectronBuildPlugin = (): Plugin => {
  return {
    name: 'electron-build',
    closeBundle() {
      buildBackground();
      buildPreload();
      buildRemoveLocales();
      const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      json.main = 'background.cjs';
      fs.writeFileSync('dist/package.json', JSON.stringify(json, null, 2));
      fs.mkdirSync('dist/node_modules');

      electronBuilder.build({
        config: {
          afterPack: 'dist/removeLocales.cjs',
          directories: {
            output: path.relative(process.cwd(), 'release'),
            app: path.relative(process.cwd(), 'dist')
          },
          files: ['**/*', '!bin/**/*', '!build/**/*', '!vlc-3.0.9.2/**/*', '!path_to_some_media_file.mp4'],
          asar: true,
          appId: 'com.rqAdmin.id',
          productName: '管理平台',
          copyright: 'Copyright © 2024 有限公司',
          nsis: {
            oneClick: false,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: true,
            installerHeaderIcon: './dist/favicon.ico',
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            shortcutName: '管理平台'
          },
          extraResources: [
            {
              from: 'dist/conf',
              to: 'conf'
            },
            {
              from: './vlc-3.0.9.2',
              to: 'vlc-3.0.9.2',
              filter: [
                '**/*',
                '!locale/**',
                '!skins/**',
                '!lua/**',
                '!msi/**',
                '!**/*.txt',
                '!**/*.TXT',
                '!**/*.html',
                '!**/*.md',
                '!*.exe',
                '!**/*.ico',
                '!languages/**'
              ]
            },
            {
              from: './bin',
              to: 'bin'
            }
          ],
          win: {
            icon: './dist/icon.ico',
            target: [
              {
                target: 'nsis',
                arch: ['x64']
              }
            ],
            publish: [
              {
                provider: 'generic',
                url: 'http://192.168.3.249/updater/ADMIN/'
              }
            ]
          }
        }
      }).then(() => {
        // 执行完成执行执行打包脚本
        exec('build.bat', (error, stdout, stderr) => {
            if (error) {
                console.error(`执行 build.bat 出错: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`build.bat 输出错误: ${stderr}`);
            }
            console.log(`build.bat 输出: ${stdout}`);
        });
      });
    }
  };
};
```