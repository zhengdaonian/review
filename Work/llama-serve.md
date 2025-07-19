

# LLaMA.cpp HTTP 服务器

基于 `httplib`、`nlohmann::json` 和 `llama.cpp` 的快速、轻量级纯 C/C++ HTTP 服务器。  
一套 LLM REST API 以及一个简单的网页前端，用于与 `llama.cpp` 交互。

---

## 功能

- 支持 F16 和量化模型的 LLM 推理（GPU 和 CPU）
- OpenAI API 兼容的聊天完成和嵌入路由
- 重排序端点（https://github.com/ggml-org/llama.cpp/pull/9510）
- 支持多用户并行解码
- 连续批处理
- 多模态（文档）/ OpenAI 兼容 API 支持
- 监控端点
- Schema 约束的 JSON 响应格式
- 类似 Claude API 的助手消息预填充
- 函数调用 / 工具使用（适用于任何模型）
- 推测解码
- 易于使用的网页 UI

---

## 用法

### 常规参数

| 参数                                                         | 说明                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `-h, --help, --usage`                                        | 打印用法并退出                                               |
| `--version`                                                  | 显示版本和构建信息                                           |
| `--completion-bash`                                          | 打印可源码的 bash 完成脚本                                   |
| `--verbose-prompt`                                           | 在生成前打印详细提示（默认: false）                          |
| `-t, --threads N`                                            | 生成时使用的线程数（默认: -1）                               |
| `-tb, --threads-batch N`                                     | 批处理和提示处理时使用的线程数（默认: 与 `--threads` 相同）  |
| `-C, --cpu-mask M`                                           | CPU 亲和性掩码（任意长度的十六进制）                         |
| `-Cr, --cpu-range lo-hi`                                     | CPU 亲和性范围                                               |
| `--cpu-strict <0|1>`                                         | 使用严格 CPU 放置（默认: 0）                                 |
| `--prio N`                                                   | 设置进程/线程优先级：0-正常，1-中等，2-高，3-实时（默认: 0） |
| `--poll <0...100>`                                           | 使用轮询级别等待工作（默认: 50）                             |
| `-Cb, --cpu-mask-batch M`                                    | 批处理的 CPU 亲和性掩码                                      |
| `-Crb, --cpu-range-batch lo-hi`                              | 批处理的 CPU 范围                                            |
| `--cpu-strict-batch <0|1>`                                   | 批处理的严格 CPU 放置（默认: 与 `--cpu-strict` 相同）        |
| `--prio-batch N`                                             | 批处理的优先级（默认: 0）                                    |
| `--poll-batch <0|1>`                                         | 批处理的轮询（默认: 与 `--poll` 相同）                       |
| `-c, --ctx-size N`                                           | 提示上下文大小（默认: 4096，0 = 从模型加载）                 |
| `-n, --predict, --n-predict N`                               | 预测的 token 数（默认: -1，-1 = 无限）                       |
| `-b, --batch-size N`                                         | 逻辑最大批处理大小（默认: 2048）                             |
| `-ub, --ubatch-size N`                                       | 物理最大批处理大小（默认: 512）                              |
| `--keep N`                                                   | 保留初始提示中的 token 数（默认: 0，-1 = 全部）              |
| `-fa, --flash-attn`                                          | 启用 Flash Attention（默认: 关闭）                           |
| `--no-perf`                                                  | 禁用内部 libllama 性能计时（默认: false）                    |
| `-e, --escape`                                               | 处理转义序列（`\n`, `\r`, `\t`, `'`, `"`, `\`）（默认: true） |
| `--no-escape`                                                | 不处理转义序列                                               |
| `--rope-scaling {none,linear,yarn}`                          | RoPE 频率缩放方法（默认: linear）                            |
| `--rope-scale N`                                             | RoPE 上下文缩放因子（默认: 从模型加载）                      |
| `--rope-freq-base N`                                         | RoPE 基础频率（默认: 从模型加载）                            |
| `--rope-freq-scale N`                                        | RoPE 频率缩放因子（默认: 从模型加载）                        |
| `--yarn-orig-ctx N`                                          | YaRN 原始上下文大小（默认: 0）                               |
| `--yarn-ext-factor N`                                        | YaRN 外推混合因子（默认: -1.0）                              |
| `--yarn-attn-factor N`                                       | YaRN 注意力幅度缩放因子（默认: 1.0）                         |
| `--yarn-beta-slow N`                                         | YaRN 高修正维度（默认: 1.0）                                 |
| `--yarn-beta-fast N`                                         | YaRN 低修正维度（默认: 32.0）                                |
| `-dkvc, --dump-kv-cache`                                     | 详细打印 KV 缓存                                             |
| `-nkvo, --no-kv-offload`                                     | 禁用 KV 卸载                                                 |
| `-ctk, --cache-type-k TYPE`                                  | KV 缓存 K 的数据类型（默认: f16）                            |
| `-ctv, --cache-type-v TYPE`                                  | KV 缓存 V 的数据类型（默认: f16）                            |
| `-dt, --defrag-thold N`                                      | KV 缓存碎片化阈值（默认: 0.1）                               |
| `-np, --parallel N`                                          | 解码的并行序列数（默认: 1）                                  |
| `--mlock`                                                    | 强制系统将模型保留在 RAM 中                                  |
| `--no-mmap`                                                  | 不内存映射模型                                               |
| `--numa TYPE`                                                | NUMA 优化（`distribute`/`isolate`/`numactl`）                |
| `-dev, --device <dev1,dev2,..>`                              | 使用的设备列表                                               |
| `--list-devices`                                             | 打印可用设备列表并退出                                       |
| `--override-tensor, -ot <tensor name pattern>=<buffer type>,...` | 覆盖张量缓冲区类型                                           |
| `-ngl, --gpu-layers, --n-gpu-layers N`                       | VRAM 中的层数                                                |
| `-sm, --split-mode {none,layer,row}`                         | 模型分割模式（默认: layer）                                  |
| `-ts, --tensor-split N0,N1,N2,...`                           | 每个 GPU 的模型卸载比例                                      |
| `-mg, --main-gpu INDEX`                                      | 主 GPU 索引（默认: 0）                                       |
| `--check-tensors`                                            | 检查模型张量数据                                             |
| `--override-kv KEY=TYPE:VALUE`                               | 覆盖模型元数据                                               |
| `--lora FNAME`                                               | LoRA 适配器路径                                              |
| `--lora-scaled FNAME SCALE`                                  | 用户定义缩放的 LoRA 适配器                                   |
| `--control-vector FNAME`                                     | 添加控制向量                                                 |
| `--control-vector-scaled FNAME SCALE`                        | 用户定义缩放的控制向量                                       |
| `--control-vector-layer-range START END`                     | 应用控制向量的层范围                                         |
| `-m, --model FNAME`                                          | 模型路径（默认: `models/$filename`）                         |
| `-mu, --model-url MODEL_URL`                                 | 模型下载 URL                                                 |
| `-hf, -hfr, --hf-repo <user>/<model>[:quant]`                | Hugging Face 模型仓库                                        |
| `-hfd, -hfrd, --hf-repo-draft <user>/<model>[:quant]`        | 草稿模型仓库                                                 |
| `-hff, --hf-file FILE`                                       | Hugging Face 模型文件                                        |
| `-hfv, -hfrv, --hf-repo-v <user>/<model>[:quant]`            | vocoder 模型仓库                                             |
| `-hffv, --hf-file-v FILE`                                    | vocoder 模型文件                                             |
| `-hft, --hf-token TOKEN`                                     | Hugging Face 访问令牌                                        |
| `--log-disable`                                              | 禁用日志                                                     |
| `--log-file FNAME`                                           | 日志文件路径                                                 |
| `--log-colors`                                               | 启用彩色日志                                                 |
| `-v, --verbose, --log-verbose`                               | 设置详细日志级别                                             |
| `-lv, --verbosity, --log-verbosity N`                        | 设置日志详细度阈值                                           |
| `--log-prefix`                                               | 启用日志前缀                                                 |
| `--log-timestamps`                                           | 启用日志时间戳                                               |

---

### 采样参数

| 参数                                     | 说明                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| `--samplers SAMPLERS`                    | 采样器顺序（默认: penalties;dry;top_n_sigma;top_k;typ_p;top_p;min_p;xtc;temperature） |
| `-s, --seed SEED`                        | RNG 种子（默认: -1）                                         |
| `--sampling-seq, --sampler-seq SEQUENCE` | 采样器简化序列（默认: edskypmxt）                            |
| `--ignore-eos`                           | 忽略结束符并继续生成                                         |
| `--temp N`                               | 温度（默认: 0.8）                                            |
| `--top-k N`                              | top-k 采样（默认: 40）                                       |
| `--top-p N`                              | top-p 采样（默认: 0.9）                                      |
| `--min-p N`                              | min-p 采样（默认: 0.1）                                      |
| `--xtc-probability N`                    | xtc 概率（默认: 0.0）                                        |
| `--xtc-threshold N`                      | xtc 阈值（默认: 0.1）                                        |
| `--typical N`                            | 局部典型采样（默认: 1.0）                                    |
| `--repeat-last-n N`                      | 重复惩罚的最后 n 个 token（默认: 64）                        |
| `--repeat-penalty N`                     | 重复惩罚（默认: 1.0）                                        |
| `--presence-penalty N`                   | 存在惩罚（默认: 0.0）                                        |
| `--frequency-penalty N`                  | 频率惩罚（默认: 0.0）                                        |
| `--dry-multiplier N`                     | DRY 乘数（默认: 0.0）                                        |
| `--dry-base N`                           | DRY 基值（默认: 1.75）                                       |
| `--dry-allowed-length N`                 | DRY 允许长度（默认: 2）                                      |
| `--dry-penalty-last-n N`                 | DRY 最后 n 个 token 惩罚（默认: -1）                         |
| `--dry-sequence-breaker STRING`          | DRY 序列断点（默认: `\n`, `:`, `"`, `*`）                    |
| `--dynatemp-range N`                     | 动态温度范围（默认: 0.0）                                    |
| `--dynatemp-exp N`                       | 动态温度指数（默认: 1.0）                                    |
| `--mirostat N`                           | Mirostat 采样（默认: 0）                                     |
| `--mirostat-lr N`                        | Mirostat 学习率（默认: 0.1）                                 |
| `--mirostat-ent N`                       | Mirostat 目标熵（默认: 5.0）                                 |
| `-l, --logit-bias TOKEN_ID(+/-)BIAS`     | 调整 token 出现概率                                          |
| `--grammar GRAMMAR`                      | BNF 语法约束                                                 |
| `--grammar-file FNAME`                   | 语法文件路径                                                 |
| `-j, --json-schema SCHEMA`               | JSON 语法约束                                                |
| `-jf, --json-schema-file FILE`           | JSON 语法文件路径                                            |

---

### 示例特定参数

| 参数                                                | 说明                                                 |
| --------------------------------------------------- | ---------------------------------------------------- |
| `--no-context-shift`                                | 禁用无限文本生成的上下文切换（默认: 关闭）           |
| `-sp, --special`                                    | 启用特殊 token 输出（默认: false）                   |
| `--no-warmup`                                       | 跳过模型预热                                         |
| `--spm-infill`                                      | 使用 Suffix/Prefix/Middle 模式进行填充（默认: 关闭） |
| `--pooling {none,mean,cls,last,rank}`               | 嵌入池化类型（默认: 模型默认）                       |
| `-cb, --cont-batching`                              | 启用连续批处理（默认: 启用）                         |
| `-nocb, --no-cont-batching`                         | 禁用连续批处理                                       |
| `--mmproj FILE`                                     | 多模态投影文件路径                                   |
| `--mmproj-url URL`                                  | 多模态投影文件 URL                                   |
| `--no-mmproj`                                       | 显式禁用多模态投影                                   |
| `--no-mmproj-offload`                               | 不将多模态投影卸载到 GPU                             |
| `-a, --alias STRING`                                | 模型名称别名（用于 REST API）                        |
| `--host HOST`                                       | 监听 IP 地址（默认: `127.0.0.1`）                    |
| `--port PORT`                                       | 监听端口（默认: 8080）                               |
| `--path PATH`                                       | 静态文件路径（默认: 空）                             |
| `--no-webui`                                        | 禁用 Web UI（默认: 启用）                            |
| `--embedding, --embeddings`                         | 限制仅支持嵌入用例（默认: 关闭）                     |
| `--reranking, --rerank`                             | 启用重排序端点（默认: 关闭）                         |
| `--api-key KEY`                                     | API 密钥（默认: 无）                                 |
| `--api-key-file FNAME`                              | API 密钥文件路径                                     |
| `--ssl-key-file FNAME`                              | SSL 私钥文件路径                                     |
| `--ssl-cert-file FNAME`                             | SSL 证书文件路径                                     |
| `-to, --timeout N`                                  | 服务器读写超时（默认: 600 秒）                       |
| `--threads-http N`                                  | HTTP 线程数（默认: -1）                              |
| `--cache-reuse N`                                   | 缓存重用最小 chunk 大小（默认: 0）                   |
| `--metrics`                                         | 启用 Prometheus 兼容指标（默认: 关闭）               |
| `--slots`                                           | 启用 slots 监控（默认: 关闭）                        |
| `--props`                                           | 启用全局属性修改（默认: 关闭）                       |
| `--no-slots`                                        | 禁用 slots 监控                                      |
| `--slot-save-path PATH`                             | 保存 slot KV 缓存路径（默认: 关闭）                  |
| `--jinja`                                           | 使用 Jinja 模板（默认: 关闭）                        |
| `--reasoning-format FORMAT`                         | 控制思维标签格式（默认: `deepseek`）                 |
| `--reasoning-budget N`                              | 控制思维预算（默认: -1）                             |
| `--chat-template JINJA_TEMPLATE`                    | 自定义 Jinja 聊天模板（默认: 模型元数据）            |
| `--chat-template-file JINJA_TEMPLATE_FILE`          | 自定义 Jinja 聊天模板文件                            |
| `--no-prefill-assistant`                            | 不预填充助手响应（默认: 预填充启用）                 |
| `-sps, --slot-prompt-similarity SIMILARITY`         | 请求提示与 slot 提示匹配相似度（默认: 0.50）         |
| `--lora-init-without-apply`                         | 加载 LoRA 适配器但不应用（默认: 关闭）               |
| `--draft-max, --draft, --draft-n N`                 | 投机解码的 token 数（默认: 16）                      |
| `--draft-min, --draft-n-min N`                      | 投机解码最小 token 数（默认: 0）                     |
| `--draft-p-min P`                                   | 投机解码最小概率（默认: 0.8）                        |
| `-cd, --ctx-size-draft N`                           | 草稿模型上下文大小（默认: 0）                        |
| `-devd, --device-draft <dev1,dev2,..>`              | 草稿模型卸载设备                                     |
| `-ngld, --gpu-layers-draft, --n-gpu-layers-draft N` | 草稿模型 GPU 层数                                    |
| `-md, --model-draft FNAME`                          | 投机解码草稿模型（默认: 无）                         |
| `-mv, --model-vocoder FNAME`                        | 语音生成 vocoder 模型（默认: 无）                    |
| `--tts-use-guide-tokens`                            | 使用引导 token 提高 TTS 词召回                       |
| `--embd-bge-small-en-default`                       | 使用默认 `bge-small-en-v1.5` 模型                    |
| `--embd-e5-small-en-default`                        | 使用默认 `e5-small-v2` 模型                          |
| `--embd-gte-small-default`                          | 使用默认 `gte-small` 模型                            |
| `--fim-qwen-1.5b-default`                           | 使用默认 Qwen 2.5 Coder 1.5B                         |
| `--fim-qwen-3b-default`                             | 使用默认 Qwen 2.5 Coder 3B                           |
| `--fim-qwen-7b-default`                             | 使用默认 Qwen 2.5 Coder 7B                           |
| `--fim-qwen-7b-spec`                                | 使用 Qwen 2.5 Coder 7B + 0.5B 草稿                   |
| `--fim-qwen-14b-spec`                               | 使用 Qwen 2.5 Coder 14B + 0.5B 草稿                  |

---

### 注意事项

- 如果命令行参数和环境变量同时设置，**参数优先级高于环境变量**。

---

### Docker Compose 示例

```yaml
services:
  llamacpp-server:
    image: ghcr.io/ggml-org/llama.cpp:server
    ports:
      - 8080:8080
    volumes:
      - ./models:/models
    environment:
      LLAMA_ARG_MODEL: /models/my_model.gguf
      LLAMA_ARG_CTX_SIZE: 4096
      LLAMA_ARG_N_PARALLEL: 2
      LLAMA_ARG_ENDPOINT_METRICS: 1
      LLAMA_ARG_PORT: 8080
```



#### 多模态支持  

多模态支持在 #12898 中添加，目前为实验性功能。  
更多细节请参阅多模态文档。  

#### 构建  
使用 CMake 构建：  
```bash
cmake -B build
cmake --build build --config Release -t llama-server
```
二进制文件位于 `./build/bin/llama-server`。  

#### 带 SSL 的构建  
```bash
cmake -B build -DLLAMA_SERVER_SSL=ON
cmake --build build --config Release -t llama-server
```

#### Web UI  
项目包含一个基于网页的用户界面，通过 `/chat/completions` 端点与模型交互。  
Web UI 使用：  
- React 框架  
- TailwindCSS 和 DaisyUI 样式  
- Vite 构建工具  

预构建版本位于 `/public` 目录下的单个 HTML 文件。  

构建或运行开发服务器：  
```bash
cd tools/server/webui
npm i
npm run dev
npm run build
```
生成 `public/index.html.gz` 后，需要生成 C++ 头文件（如 `build/tools/server/index.html.gz.hpp`），通过构建 `llama-server` 实现。  

**注意**：如果使用 Vite 开发服务器，可以在浏览器控制台运行以下代码修改 API 基地址：  
```javascript
localStorage.setItem('base', 'http://localhost:8080')
```

#### 快速开始  
Unix 系统（Linux/macOS 等）：  
```bash
./llama-server -m models/7B/ggml-model.gguf -c 2048
```
Windows：  
```bash
llama-server.exe -m models\7B\ggml-model.gguf -c 2048
```
上述命令将在默认监听 `127.0.0.1:8080`。  

Docker：  
```bash
docker run -p 8080:8080 -v /path/to/models:/models ghcr.io/ggml-org/llama.cpp:server -m models/7B/ggml-model.gguf -c 512 --host 0.0.0.0 --port 8080
```
或使用 CUDA：  
```bash
docker run -p 8080:8080 -v /path/to/models:/models --gpus all ghcr.io/ggml-org/llama.cpp:server-cuda -m models/7B/ggml-model.gguf -c 512 --host 0.0.0.0 --port 8080 --n-gpu-layers 99
```

#### 使用 CURL 测试  
```bash
curl --request POST \
    --url http://localhost:8080/completion \
    --header "Content-Type: application/json" \
    --data '{"prompt": "Building a website can be done in 10 simple steps:","n_predict": 128}'
```

#### 高级测试  
我们实现了基于人类可读场景的服务器测试框架。提交问题前请尝试复现。  

**Node.js 测试**  
创建 `index.js` 文件：  
```javascript
const prompt = "Building a website can be done in 10 simple steps:"

async function test() {
    let response = await fetch("http://127.0.0.1:8080/completion", {
        method: "POST",
        body: JSON.stringify({
            prompt,
            n_predict: 64,
        })
    })
    console.log((await response.json()).content)
}

test()
```
运行：  
```bash
node index.js
```

#### API 端点  
- **GET /health**: 返回健康检查结果  
  - 503 状态码：模型仍在加载  
  - 200 状态码：模型已加载，服务器就绪  

- **POST /completion**: 根据提示返回预测完成  
  - **重要**：此端点不兼容 OAI。使用 `/v1/completions` 代替。  
  - **选项**：`prompt`, `temperature`, `n_predict`, `stream`, `stop` 等（详见文档）  

- **POST /tokenize**: 将文本分词  
  - **选项**：`content`, `add_special`, `with_pieces`  

- **POST /detokenize**: 将 token 转换为文本  
  - **选项**：`tokens`  

- **POST /apply-template**: 应用聊天模板  
  - **选项**：`messages`  

- **POST /embedding**: 生成嵌入  
  - **重要**：此端点不兼容 OAI。使用 `/v1/embeddings` 代替。  

- **POST /reranking**: 根据查询重新排序文档  
  - **选项**：`query`, `documents`  

- **POST /infill**: 代码填充  
  - **选项**：`input_prefix`, `input_suffix`, `prompt`  

- **GET /props**: 获取服务器全局属性  
  - **响应格式**：包含模型路径、默认生成设置等  

- **POST /props**: 修改服务器全局属性  
  - **需要启动时使用 `--props`**  

- **GET /slots**: 返回当前 slots 处理状态  
  - **警告**：此端点用于调试，未来可能修改。  

- **GET /metrics**: Prometheus 兼容指标导出器  

- **POST /slots/{id_slot}?action=save/restore/erase**: 保存/恢复/擦除指定 slot 的缓存  

- **GET /lora-adapters**: 获取所有 LoRA 适配器列表  
- **POST /lora-adapters**: 设置 LoRA 适配器  

#### OpenAI 兼容 API 端点  
- **GET /v1/models**: OpenAI 兼容模型信息  
- **POST /v1/completions**: OpenAI 兼容补全 API  
- **POST /v1/chat/completions**: OpenAI 兼容聊天补全 API  
- **POST /v1/embeddings**: OpenAI 兼容嵌入 API  

#### 工具调用支持  
通过 `--jinja` 标志支持 OpenAI 风格函数调用（可能需要覆盖 `--chat-template-file`）。  

#### 错误处理  
- **401 未授权**：无效 API 密钥  
- **501 不支持**：服务器不支持该端点  
- **400 无效请求**：语法解析失败  

#### 旧版完成 Web UI  
新聊天 UI 已替代旧版。使用 `--path ./tools/server/public_legacy` 启动旧版。  

#### 扩展或构建替代 Web 前端  
通过 `--path` 指定目录并导入 `/completion.js` 使用 `llamaComplete()` 方法。 
