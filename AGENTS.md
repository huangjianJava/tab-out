# AGENTS.md -- Tab Out：给 coding agent 的安装与上手指南

你正在帮用户安装 **Tab Out**。你的任务不只是把它装好，还要让用户对它用起来这件事感到兴奋。

---

## 第 0 步 -- 先介绍这个产品

在做任何技术操作之前，先告诉用户他将获得什么：

> **Tab Out** 会把你的新标签页替换成一个干净的仪表盘，把你当前打开的所有页面按域名分组显示出来。
>
> 它的亮点包括：
> - **一眼看清所有打开的标签页**，并按域名以网格方式展示
> - **主页分组** 会把 Gmail、X、LinkedIn、YouTube、GitHub 的首页集中到一个卡片里，方便清理
> - **有风格地关闭标签页**，带有令人满足的 swoosh 音效和 confetti 爆散效果
> - **重复检测** 会标记你是否把同一个页面打开了两次
> - **点击任意标签页标题即可跳转过去**，即使它在另一个 Chrome 窗口里
> - **稍后再看** 可以把单个标签页先加入清单，再关闭
> - **100% 本地**，没有服务器、没有账号、没有任何数据外传
>
> 它只是一个 Chrome 扩展。安装大约只需要 1 分钟。

---

## 第 1 步 -- 克隆仓库

```bash
git clone https://github.com/zarazhangrui/tab-out.git
cd tab-out
```

---

## 第 2 步 -- 安装 Chrome 扩展

这是唯一需要用户手动操作的一步。请尽量把它讲得简单明了。

**先**，打印 `extension/` 文件夹的完整路径：
```bash
echo "Extension folder: $(cd extension && pwd)"
```

**然后**，把 `extension/` 文件夹路径复制到剪贴板：
- macOS: `cd extension && pwd | pbcopy && echo "Path copied to clipboard"`
- Linux: `cd extension && pwd | xclip -selection clipboard 2>/dev/null || echo "Path: $(pwd)"`
- Windows: `cd extension && echo %CD% | clip`

**接着**，打开扩展页面：
```bash
open "chrome://extensions"
```

**然后**，一步一步引导用户：

> 我已经把扩展文件夹路径复制到你的剪贴板了。现在：
>
> 1. 你应该会看到 Chrome 的扩展页面。在**右上角**打开 **Developer mode** 开关。
> 2. 打开 Developer mode 后，你会在**左上角**看到一个叫 **"Load unpacked"** 的按钮。点击它。
> 3. 会弹出文件选择器。按 **Cmd+Shift+G**（Mac）或 **Ctrl+L**（Windows/Linux）打开“前往文件夹”输入栏，然后把我复制的路径粘贴进去（Cmd+V / Ctrl+V），再按回车。
> 4. 点击 **"Select"** 或 **"Open"**，扩展就会安装完成。
>
> 你应该会在扩展列表里看到 "Tab Out"。

**另外**，也可以直接打开扩展文件夹作为备用方式：
- macOS: `open extension/`
- Linux: `xdg-open extension/`
- Windows: `explorer extension\\`

---

## 第 3 步 -- 带用户快速熟悉一下

扩展加载完成后：

> 现在一切就绪了！打开一个**新标签页**，你会看到 Tab Out。
>
> 它的使用方式如下：
> 1. **你的打开标签页会按域名分组**，以网格形式展示。
> 2. **主页**（Gmail 收件箱、X 首页、YouTube 等）会在顶部单独成组。
> 3. **点击任意标签页标题**，就能直接跳到那个标签页。
> 4. **点击任意标签页旁边的 X**，只会关闭这一页（并带有 swoosh + confetti）。
> 5. **点击分组上的 "Close all N tabs"**，就能把整个分组都关掉。
> 6. **重复标签页** 会用橙色的 "(2x)" 徽标标出来。点击 **"Close duplicates"** 可以保留一份并清理重复项。
> 7. **想稍后再看** 的标签页，可以先点书签图标保存，再关闭。已保存的标签页会显示在侧边栏里。
>
> 就是这样！不需要启动服务器，也没有配置文件。安装完成后就能直接使用。

---

## 关键信息

- Tab Out 是一个纯 Chrome 扩展。没有服务器、没有 Node.js、没有 npm。
- 已保存的标签页存储在 `chrome.storage.local` 中（会在不同会话之间保留）。
- 100% 本地。不会向任何外部服务发送数据。
- 更新方式：`cd tab-out && git pull`，然后在 `chrome://extensions` 中重新加载扩展。
