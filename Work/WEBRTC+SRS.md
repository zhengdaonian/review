``` 
 const webrtcUrl = ref(
      "webrtc://live.abc.com/live"
    );

    let rtcPublisher = null; // 用于存储RtcPublisher实例
    let rtcPlayer = null; // 用于存储RtcPlayer实例

    const startPublisher = async () => {
      try {
        rtcPublisher = new Srs.SrsRtcPublisherAsync(); // 创建RtcPublisher实例
        const session = await rtcPublisher.publish(webrtcUrl.value); // 开始推流
        console.log("推流成功", session);
        await nextTick(); // 等待DOM更新，确保pusher是可用的
        // 如果需要，这里可以添加播放器的初始化代码（如果RtcPublisher也提供了流）
      } catch (error) {
        console.error("推流失败", error);
        // 如果RtcPublisher有close方法，调用它以关闭推流
        if (rtcPublisher && rtcPublisher.close) {
          rtcPublisher.close();
        }
      }
    };

    const startPlayer = async () => {
      try {
        rtcPlayer = new Srs.SrsRtcPlayerAsync(); // 创建RtcPlayer实例
        await rtcPlayer.play(webrtcUrl.value); // 开始播放
        await nextTick(); // 等待DOM更新，确保pusher是可用的
        // 设置视频源的srcObject
        if (rtcPlayer.stream && pusher.value) {
          pusher.value.srcObject = rtcPlayer.stream;
        }
      } catch (error) {
        console.error("播放失败", error);
        // 如果RtcPlayer有close或stop方法，调用它以停止播放
        if (rtcPlayer && (rtcPlayer.close || rtcPlayer.stop)) {
          // 假设有一个close或stop方法可用
          rtcPlayer.close?.() || rtcPlayer.stop?.();
        }
      }
    };
    const startPublisherBtn = async () => {
      await startPublisher();
      await startPlayer();
    };
    const stopPublisherBtn = async () => {
      if (rtcPublisher && rtcPublisher.close) {
        rtcPublisher.close();
      }
      if (rtcPlayer && (rtcPlayer.close || rtcPlayer.stop)) {
        rtcPlayer.close?.() || rtcPlayer.stop?.();
      }
    };
    
    onUnmounted(() => {
      // 组件卸载时关闭推流和播放
      if (rtcPublisher && rtcPublisher.close) {
        rtcPublisher.close();
      }
      if (rtcPlayer && (rtcPlayer.close || rtcPlayer.stop)) {
        rtcPlayer.close?.() || rtcPlayer.stop?.();
      }
    });
```