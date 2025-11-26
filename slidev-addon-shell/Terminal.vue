<template>
  <div ref="terminalContainer" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useShellStates } from './states';

interface Props {
  isDark?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDark: true,
});

const { focusTerminal } = useShellStates();

// 定义亮色和暗色主题
const darkTheme = {
  background: '#00000000',
  foreground: '#d4d4d4',
  cursor: '#ffffff',
  cursorAccent: '#000000',
  black: '#000000',
  red: '#cd3131',
  green: '#0dbc79',
  yellow: '#e5e510',
  blue: '#2472c8',
  magenta: '#bc3fbc',
  cyan: '#11a8cd',
  white: '#e5e5e5',
  brightBlack: '#666666',
  brightRed: '#f14c4c',
  brightGreen: '#23d18b',
  brightYellow: '#f5f543',
  brightBlue: '#3b8eea',
  brightMagenta: '#d670d6',
  brightCyan: '#29b8db',
  brightWhite: '#e5e5e5',
};

const lightTheme = {
  background: '#dddddd00',
  foreground: '#24292e',
  cursor: '#24292e',
  cursorAccent: '#ffffff',
  black: '#24292e',
  red: '#d73a49',
  green: '#22863a',
  yellow: '#b08800',
  blue: '#005cc5',
  magenta: '#6f42c1',
  cyan: '#0598bc',
  white: '#6a737d',
  brightBlack: '#586069',
  brightRed: '#cb2431',
  brightGreen: '#28a745',
  brightYellow: '#dbab09',
  brightBlue: '#0366d6',
  brightMagenta: '#5a32a3',
  brightCyan: '#0598bc',
  brightWhite: '#959da5',
};

const terminalContainer = ref<HTMLElement | null>(null);
let term: Terminal | null = null;
let socket: WebSocket | null = null;
let fitAddon: FitAddon | null = null;

onMounted(() => {
  if (!terminalContainer.value) return;

  // 1. 初始化 xterm
  term = new Terminal({
    cursorBlink: true,
    fontSize: 12,
    fontFamily: 'Consolas, monospace',
    theme: props.isDark ? darkTheme : lightTheme,
  });
  term.focus();
  focusTerminal.value = () => {
    console.log('Terminal focused');
    setTimeout(() => {
      term?.focus();
      handleResize();
    }, 30);
  };



  fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(terminalContainer.value);
  fitAddon.fit();

  // 2. 连接 WebSocket (连接到我们插件定义的路径)
  // 注意：这里动态获取当前 host，确保局域网访问也能连上
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(`${protocol}//${window.location.host}/__terminal`);

  // 3. 绑定事件：Socket -> Terminal
  socket.onmessage = (event) => {
    term?.write(event.data);
  };

  // 4. 绑定事件：Terminal -> Socket
  term.onData((data) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });

  // 5. 监听窗口大小变化以自适应
  window.addEventListener('resize', handleResize);

  setTimeout(() => {
    handleResize();
  }, 100);
});

const handleResize = () => {
  fitAddon?.fit();
  // 发送 resize 事件给后端 ptyProcess.resize(cols, rows)
  if (term && socket?.readyState === WebSocket.OPEN) {
    const cols = term.cols;
    const rows = term.rows;
    socket.send(JSON.stringify({ type: 'resize', cols, rows }));
  }
};

onBeforeUnmount(() => {
  term?.dispose();
  socket?.close();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.terminal-container {
  overflow: hidden;
  text-align: left;
}

/* 隐藏终端滚动条 */
.terminal-container :deep(.xterm-viewport) {
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.terminal-container :deep(.xterm-viewport::-webkit-scrollbar) {
  display: none;
  /* Chrome, Safari and Opera */
}
</style>
