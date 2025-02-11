## 描述

基于 Vue 3 部署 `DeepSeek` 和 `Google Gemini 2.0`  api集成的`Web AI`对话框，抖音风格，支持代码高亮显示，并针对移动端进行了简洁适配。

## 使用方法

1.  **配置 API Key：**

    请务必将 `src/config` 目录下的配置文件 `API_KEY` 替换为你自己申请的 API Key。

    **注意：** Google Gemini 2.0 需要科学上网才能正常使用。

    具体来说，你需要修改 `src/config/deepseek.js` 或者 `src/config/gemini.js` （看你需求具体需要使用那种模型）:

    ```javascript
    // src/config/index.js
    export default {
      API_KEY: 'YOUR_API_KEY', // 替换为你的 API Key
      // ... 其他配置
    };
    ```

    **重要提示：** 请妥善保管你的 API Key，不要将其提交到公共仓库！

2.  **运行项目：**

    完成 API Key 配置后，按照以下步骤运行项目：

    *   安装依赖：

        ```bash
        npm install  # 或者使用 yarn install / pnpm install
        ```

    *   启动项目：

        ```bash
        npm run dev
        ```

    *   构建项目：

        ```bash
        npm run build
        ```

    *   部署构建后的文件到你的服务器。

## 在线预览

访问 [https://euzhi.com/](https://euzhi.com/) 在线查看。

## 环境说明

*   Node.js: v18.20.5
*   npm: 10.8.2

## 其他说明

如果对你有帮助给我点一个star吧，谢谢！

## 贡献

欢迎提交 issue 和 pull request!