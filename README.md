# Tab Out

**让你一眼看清自己打开了哪些标签页。**

Tab Out 会把你的新标签页替换成一个简洁的仪表盘，显示你当前打开的所有页面，并按域名分组。主页类页面（Gmail、X、LinkedIn 等）会被单独归到一组。关闭标签页时还有令人满足的 swoosh 音效和 confetti。

无需服务器、无需账号、无需外部 API 调用。它就是一个 Chrome 扩展。

---

## 使用 coding agent 安装

把这个仓库发给你的 coding agent（Claude Code、Codex 等），然后说 **“install this”**：

```
https://github.com/zarazhangrui/tab-out
```

它会带你完成安装。大约 1 分钟。

---

## 功能

- **一眼看清所有标签页**：以域名为单位，整齐地排成网格
- **主页分组**：把 Gmail 收件箱、X 首页、YouTube、LinkedIn、GitHub 首页等归到一个卡片里
- **有风格地关闭标签页**：swoosh 音效 + confetti 爆散
- **重复标签页检测**：当你把同一个页面开了两次时会标出来，并支持一键清理
- **点击任意标签页即可跳转**：跨窗口也可以，且不会新开标签页
- **稍后再看**：把标签页先加入清单，再关闭
- **本地开发分组**：会显示端口号，方便区分不同的 vibe coding 项目
- **可展开分组**：先显示前 8 个标签页，剩余部分可以点 “+N more”
- **100% 本地**：你的数据不会离开你的电脑
- **纯 Chrome 扩展**：没有服务器、没有 Node.js、没有 npm，除了加载扩展之外不需要额外设置

---

## 手动安装

**1. 克隆仓库**

```bash
git clone https://github.com/zarazhangrui/tab-out.git
```

**2. 加载 Chrome 扩展**

1. 打开 Chrome，进入 `chrome://extensions`
2. 打开右上角的 **Developer mode**
3. 点击 **Load unpacked**
4. 找到克隆仓库中的 `extension/` 文件夹并选中它

**3. 打开一个新标签页**

你就会看到 Tab Out。

---

## 工作方式

```
你打开一个新标签页
  -> Tab Out 显示你当前打开的标签页，并按域名分组
  -> Homepages（Gmail、X 等）会在顶部单独成组
  -> 点击任意标签页标题即可跳转到它
  -> 关闭你已经处理完的分组（swoosh + confetti）
  -> 在关闭前把标签页保存到稍后清单
```

所有内容都在 Chrome 扩展内部运行。没有外部服务器、没有 API 调用、没有任何数据发送到外部。已保存的标签页会存储在 `chrome.storage.local` 中。

---

## 技术栈

| 内容 | 实现 |
|------|------|
| 扩展 | Chrome Manifest V3 |
| 存储 | `chrome.storage.local` |
| 音效 | Web Audio API（合成音效，没有音频文件） |
| 动画 | CSS transitions + JS confetti particles |

---

## 许可证

MIT

---

由 [Zara](https://x.com/zarazhangrui) 制作
