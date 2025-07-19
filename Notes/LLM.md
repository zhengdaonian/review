`@microsoft/fetch-event-source` 微软的请求库，挺不错的

## SSE接入的具体落地有几种方案

### EventSource 实现接入
SSE 是一种服务器向客户端推送事件的协议，基于 HTTP 长连接。它适合服务器向客户端单向推送实时数据
<br />
特点：
- 单向通信 适合服务器向客户端推送数据。
- 简单易用：基于 HTTP 协议，无需额外协议支持。
- 自动重连：EventSource 会自动处理连接断开和重连

缺点：
- 单向通信 ：仅支持 get 请求：在 AI 对话场景中，通常需要发送用户输入（如文本、文件等），这需要使用 POST 请求
- 无法自定义请求头：EventSource 不支持自定义请求头（如 Authorization、Content-Type 等），在 AI 对话场景

### XMLHttpRequest 实现接入
XMLHttpRequest 不能直接支持流式返回，但可以通过监听 progress 事件模拟逐块接收数据。
<br />
特点：
- 兼容性好：支持所有浏览器。
- 非真正流式：XMLHttpRequest 仍然需要等待整个响应完成，progress 事件只是提供了部分数据的访问能力。
- 内存占用高：不适合处理大文件。

### Fetch 实现接入
- 原生支持：现代浏览器均支持 fetch 和 ReadableStream。
- 逐块处理：可以实时处理每个数据块，而不需要等待整个响应完成。
- 内存效率高：适合处理大文件或实时数据。