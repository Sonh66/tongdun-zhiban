# 童盾智伴网站部署包

这是童盾智伴的静态网站原型，包含五个安全训练场景、语音/文字回答、100 分制五维能力反馈和独立家长学习报告。可直接部署到 GitHub Pages，无需安装 Node.js、配置数据库或执行构建。

解压后进入 tongdun-site-deploy 文件夹，把里面的全部内容上传到仓库根目录，确保 index.html 位于根目录。

## 文件结构

```text
index.html
report.html
styles.css
script.js
report.js
motion.js
assets/
  vendor/
THIRD_PARTY_NOTICES.md
```

## GitHub Pages 部署

1. 新建一个公开 GitHub 仓库。
2. 上传本文件夹内的全部文件到仓库根目录。
3. 进入仓库 Settings -> Pages。
4. Source 选择 Deploy from a branch。
5. Branch 选择 main，目录选择 /root。
6. 保存后等待 GitHub 生成访问地址。

## 注意

- 不要上传项目申报书 Word/PDF，里面可能包含个人联系方式。
- 录音识别和朗读依赖访问者浏览器支持，并需要用户允许麦克风权限。
- 学习记录保存在访问者自己的浏览器 localStorage 中，不会上传到服务器。
- 当前场景是预设内容，回答通过本地规则评分；没有接入在线大语言模型或语音情绪识别服务。
- 语音输入建议使用 Chrome 或 Edge，并通过 HTTPS 或 localhost 访问。系统语音由访问者的浏览器和操作系统提供，音色与情感表现会有所差异。
- GSAP、ScrollTrigger 和 Lucide 已随 assets/vendor 一起打包，页面不需要运行时从 CDN 下载动画和图标。
- 动画包含场景滑切、报告页面转场、雷达变化、分数与进度条展示；系统开启“减少动态效果”时会自动简化动画。

## 本地预览

可直接打开 index.html 检查页面。需要测试麦克风时，在这个文件夹内启动静态服务器，例如安装 Python 后运行：

```powershell
python -m http.server 8787 --bind 127.0.0.1
```

浏览器访问 http://127.0.0.1:8787/。本地地址只能在运行服务器的电脑上访问；公开访问请使用 GitHub Pages 生成的 HTTPS 地址。

## 修改与维护

- index.html / report.html：训练页和报告页结构。
- styles.css：颜色、布局和手机适配。
- script.js：场景内容、回答评分、录音和朗读。
- report.js：报告计算与学习记录展示。
- motion.js：GSAP 动画、导航转场与减少动态效果支持。
- assets：五张高清场景图、童童老师图标和本地依赖。
