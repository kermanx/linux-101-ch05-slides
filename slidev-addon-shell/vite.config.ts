

// vite-plugins/terminal.ts
import { type Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import * as pty from 'node-pty-prebuilt-multiarch';
import os from 'os';

export function TerminalPlugin(): Plugin {
  return {
    name: 'vite-plugin-local-terminal',
    // Vite 独有的钩子，用于配置开发服务器
    configureServer(server) {
      // 确保 http server 已创建
      if (!server.httpServer) return;

      // 在 Vite 的 HTTP 服务器上挂载 WebSocket Server
      const wss = new WebSocketServer({
        noServer: true
      });

      // 监听 HTTP 升级协议请求 (ws://)
      server.httpServer.on('upgrade', (request, socket, head) => {
        if (request.url === '/__terminal') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws) => {
        // 1. 确定 Shell 类型 (Windows 用 cmd/powershell, Linux/Mac 用 bash/zsh)
        const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

        // 2. 创建伪终端进程
        const ptyProcess = pty.spawn(shell, [], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.cwd(), // 默认在项目根目录
          env: process.env as any
        });

        // 3. 管道连接：PTY -> WebSocket (输出到前端)
        ptyProcess.onData((data) => {
          if (ws.readyState === ws.OPEN) {
            ws.send(data);
          }
        });

        // 4. 管道连接：WebSocket -> PTY (前端输入写入 Shell)
        ws.on('message', (msg) => {
          const msgStr = msg.toString();
          
          // 5. 处理窗口大小调整
          // 检查是否为 resize 消息
          try {
            const data = JSON.parse(msgStr);
            if (data.type === 'resize' && data.cols && data.rows) {
              ptyProcess.resize(data.cols, data.rows);
              return;
            }
          } catch (e) {
            // 不是 JSON，按普通输入处理
          }
          
          // 普通输入写入 Shell
          ptyProcess.write(msgStr);
        });

        // 6. 清理资源
        ws.on('close', () => {
          ptyProcess.kill();
        });

        ptyProcess.onExit(() => {
          ws.close();
        });
      });
    },
  };
}

export default {
  plugins: [
    TerminalPlugin()
  ]
}