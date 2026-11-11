# 论文速记站

中文 Markdown 论文卡片，使用 Node.js + marked 静态生成，无客户端框架。适合 GitHub Pages。

## 写笔记
复制 content/pi05.md，使用英文文件名。填写 title、summary、tags、example 和 related（其他卡片文件名，不含 .md）。真实笔记将 example 改为 false。正文使用 Markdown；请只提交可信内容，Markdown 支持原始 HTML。

每张卡片推荐保留一句话总结、核心方法、架构、关键点、局限与个人思考。关联条目必须存在，否则构建失败。删除 content 文件后重新构建即可删除对应页面。

## 本地
npm ci
npm run build

通过任意静态 HTTP 服务预览仓库根目录。主页支持正文搜索、标签筛选、移动端和记忆深浅色选择。无账户、数据库或付费服务。

## 部署
GitHub Settings → Pages → Source 选择 GitHub Actions。推送 main 自动构建并部署。

## 恢复旧站
旧站完整保存在 backup/pre-paper-site 分支；Git 历史未重写。恢复时可从该分支建立新分支或恢复文件后提交。仓库外另有完整 Git bundle 备份。

当前首篇为用户已有的 π0.5 中文精读笔记，保留原笔记的来源范围与核对日期。

## 三层阅读
首页仅以搜索框和简洁卡片开始。summary 是封面的一句话总结；abstract 是点击卡片展开的摘要；Markdown 正文是点击“详情”进入的完整笔记。搜索也包含标签与摘要。卡片支持键盘打开摘要浮层，Esc、关闭按钮或点击背景关闭。
