function SrsError(name, message) {
  this.name = name;
  this.message = message;
  this.stack = new Error().stack;
}
SrsError.prototype = Object.create(Error.prototype);
SrsError.prototype.constructor = SrsError;

function SrsRtcPublisherAsync() {
  const self = {};

  // 1. 初始化连接（创建RTCPeerConnection等基础结构）
  // eslint-disable-next-line func-names
  self.initialize = function () {
    if (!self.pc) {
      self.pc = new RTCPeerConnection(null);
      self.stream = new MediaStream(); // 存储媒体流
      // 添加音视频发送器（推流方向）
      self.audioTransceiver = self.pc.addTransceiver('audio', { direction: 'sendonly' });
      self.videoTransceiver = self.pc.addTransceiver('video', { direction: 'sendonly' });
      // 从收发器中获取真正的发送器（sender）
      self.audioSender = self.audioTransceiver.sender; // 关键：获取音频发送器
      self.videoSender = self.videoTransceiver.sender; // 关键：获取视频发送器
    }
  };

  // 2. 单独开启摄像头（获取媒体流）
  // eslint-disable-next-line func-names
  self.startCamera = async function (media, constraints) {
    if (!self.pc) {
      throw new Error('请先调用initialize初始化连接');
    }
    // 检查浏览器权限和环境
    if (!navigator.mediaDevices) {
      throw new Error('浏览器不支持媒体设备');
    }

    let stream = null;
    // 获取摄像头和麦克风流
    if (media === 'userMedia') {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } else {
      stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    }

    // 将流保存到实例，供后续推流使用
    self.localStream = stream;

    // 将音视频轨道添加到RTCPeerConnection（但不立即推流）
    stream.getTracks().forEach(track => {
      const sender = track.kind === 'video' ? self.videoSender : self.audioSender;
      sender.replaceTrack(track);
      self.stream.addTrack(track); // 供本地预览使用
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      self.ontrack && self.ontrack({ track }); // 触发轨道回调（如预览）
    });

    // 设置初始码率
    await self.setBitrate(constraints.bitrate);

    return stream; // 返回媒体流，方便后续处理（如推理）
  };

  // eslint-disable-next-line func-names
  self.publish = async function (url) {
    if (!self.localStream) {
      throw new Error('请先调用startCamera获取媒体流');
    }
    if (!self.pc) {
      throw new Error('请先调用initialize初始化连接');
    }

    // 解析推流地址
    const conf = self.__internal.prepareUrl(url);

    // 创建SDP Offer（推流核心协商逻辑）
    const offer = await self.pc.createOffer();
    await self.pc.setLocalDescription(offer);

    // 向服务器发送Offer并获取Answer
    const session = await new Promise((resolve, reject) => {
      const data = {
        api: conf.apiUrl,
        tid: conf.tid,
        streamurl: conf.streamUrl,
        clientip: null,
        sdp: offer.sdp
      };
      console.log('生成推流Offer:', data);

      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        if (xhr.readyState !== xhr.DONE) return;
        if (xhr.status !== 200 && xhr.status !== 201) return reject(xhr);
        const res = JSON.parse(xhr.responseText);
        console.log('收到服务器Answer:', res);
        return res.code ? reject(res) : resolve(res);
      };
      xhr.open('POST', conf.apiUrl, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(data));
    });

    // 设置服务器返回的Answer，完成推流协商
    await self.pc.setRemoteDescription(
      new RTCSessionDescription({
        type: 'answer',
        sdp: session.sdp
      })
    );
    session.simulator = `${conf.schema}//${conf.urlObject.server}:${conf.port}/rtc/v1/nack/`;

    return session;
  };

  // 3. 核心：设置码率（新增方法）
  /**
   * 设置音视频码率
   *
   * @param {number} bitrate - 视频码率（kbps，如2000）
   */
  // eslint-disable-next-line func-names
  self.setBitrate = async function (bitrate) {
    if (!self.pc) {
      throw new Error('请先初始化连接');
    }
    if (!self.videoSender) return;

    const params = self.videoSender.getParameters();
    params.encodings ||= [{ maxBitrate: bitrate * 1000 }];
    // 码率转 bps（乘以 1000）
    params.encodings[0].maxBitrate = bitrate * 1000;
    // 可按需加 minBitrate/startBitrate，比如：
    params.encodings[0].minBitrate = Math.max(300, bitrate * 500);
    params.encodings[0].startBitrate = bitrate * 800;

    await self.videoSender.setParameters(params);
    console.log(`视频码率已设为 ${bitrate} kbps`);
  };

  // Close the publisher.
  // eslint-disable-next-line func-names
  self.close = function () {
    // 停止摄像头轨道
    if (self.localStream) {
      self.localStream.getTracks().forEach(track => track.stop());
      self.localStream = null;
    }
    // 关闭WebRTC连接
    if (self.pc) {
      self.pc.close();
      self.pc = null;
    }
  };

  // eslint-disable-next-line func-names
  self.ontrack = function (event) {
    // Add track to stream of SDK.
    self.stream.addTrack(event.track);
  };

  // Internal APIs.
  self.__internal = {
    defaultPath: '/rtc/v1/publish/',
    prepareUrl(webrtcUrl) {
      const urlObject = self.__internal.parse(webrtcUrl);

      // If user specifies the schema, use it as API schema.
      // let schema = urlObject.user_query.schema;
      // schema = schema ? `${schema}:` : window.location.protocol;
      const schema = 'https:';
      // console.log('urlObject.user_query.schema', urlObject.user_query.schema);

      let port = urlObject.port || 443;
      if (schema === 'https:') {
        port = urlObject.port || 443;
      }

      // @see https://github.com/rtcdn/rtcdn-draft
      let api = urlObject.user_query.play || self.__internal.defaultPath;
      if (api.lastIndexOf('/') !== api.length - 1) {
        api += '/';
      }

      let apiUrl = `${schema}//${urlObject.server}:${port}${api}`;
      for (const key in urlObject.user_query) {
        if (key !== 'api' && key !== 'play') {
          apiUrl += `&${key}=${urlObject.user_query[key]}`;
        }
      }
      // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
      apiUrl = apiUrl.replace(`${api}&`, `${api}?`);

      const streamUrl = urlObject.url;

      return {
        apiUrl,
        streamUrl,
        schema,
        urlObject,
        port,
        tid: Number(Number.parseInt(new Date().getTime() * Math.random() * 100))
          .toString(16)
          .slice(0, 7)
      };
    },
    parse(url) {
      // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
      const a = document.createElement('a');
      a.href = url.replace('rtmp://', 'http://').replace('webrtc://', 'http://').replace('rtc://', 'http://');

      let vhost = a.hostname;
      let app = a.pathname.substring(1, a.pathname.lastIndexOf('/'));
      const stream = a.pathname.slice(a.pathname.lastIndexOf('/') + 1);

      // parse the vhost in the params of app, that srs supports.
      app = app.replace('...vhost...', '?vhost=');
      if (app.includes('?')) {
        const params = app.slice(app.indexOf('?'));
        app = app.slice(0, app.indexOf('?'));

        if (params.indexOf('vhost=') > 0) {
          vhost = params.slice(params.indexOf('vhost=') + 'vhost='.length);
          if (vhost.indexOf('&') > 0) {
            vhost = vhost.slice(0, vhost.indexOf('&'));
          }
        }
      }

      // when vhost equals to server, and server is ip,
      // the vhost is __defaultVhost__
      if (a.hostname === vhost) {
        const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
        if (re.test(a.hostname)) {
          vhost = '__defaultVhost__';
        }
      }

      // parse the schema
      let schema = 'rtmp';
      if (url.indexOf('://') > 0) {
        schema = url.slice(0, url.indexOf('://'));
      }

      let port = a.port;
      if (!port) {
        // Finger out by webrtc url, if contains http or https port, to overwrite default 1985.
        if (schema === 'webrtc' && url.indexOf(`webrtc://${a.host}:`) === 0) {
          port = url.indexOf(`webrtc://${a.host}:80`) === 0 ? 80 : 443;
        }

        // Guess by schema.
        if (schema === 'http') {
          port = 80;
        } else if (schema === 'https') {
          port = 443;
        } else if (schema === 'rtmp') {
          port = 1935;
        }
      }

      const ret = {
        url,
        schema,
        server: a.hostname,
        port,
        vhost,
        app,
        stream
      };
      self.__internal.fill_query(a.search, ret);

      // For webrtc API, we use 443 if page is https, or schema specified it.
      if (!ret.port) {
        if (schema === 'webrtc' || schema === 'rtc') {
          if (ret.user_query.schema === 'https') {
            ret.port = 443;
          } else if (window.location.href.indexOf('https://') === 0) {
            ret.port = 443;
          } else {
            // For WebRTC, SRS use 1985 as default API port.s
            ret.port = 443;
          }
        }
      }

      return ret;
    },
    fill_query(query_string, obj) {
      // pure user query object.
      obj.user_query = {};

      if (query_string.length === 0) {
        return;
      }

      // split again for angularjs.
      if (query_string.includes('?')) {
        query_string = query_string.split('?')[1];
      }

      const queries = query_string.split('&');
      for (let i = 0; i < queries.length; i++) {
        const elem = queries[i];

        const query = elem.split('=');
        obj[query[0]] = query[1];
        obj.user_query[query[0]] = query[1];
      }

      // alias domain for vhost.
      if (obj.domain) {
        obj.vhost = obj.domain;
      }
    }
  };

  return self;
}

// // Depends on adapter-7.4.0.min.js from https://github.com/webrtc/adapter
// // Async-await-promise based SRS RTC Player.
// function SrsRtcPlayerAsync() {
//   const self = {};

//   // @see https://github.com/rtcdn/rtcdn-draft
//   // @url The WebRTC url to play with, for example:
//   //      webrtc://r.ossrs.net/live/livestream
//   // or specifies the API port:
//   //      webrtc://r.ossrs.net:11985/live/livestream
//   //      webrtc://r.ossrs.net:80/live/livestream
//   // or autostart the play:
//   //      webrtc://r.ossrs.net/live/livestream?autostart=true
//   // or change the app from live to myapp:
//   //      webrtc://r.ossrs.net:11985/myapp/livestream
//   // or change the stream from livestream to mystream:
//   //      webrtc://r.ossrs.net:11985/live/mystream
//   // or set the api server to myapi.domain.com:
//   //      webrtc://myapi.domain.com/live/livestream
//   // or set the candidate(eip) of answer:
//   //      webrtc://r.ossrs.net/live/livestream?candidate=39.107.238.185
//   // or force to access https API:
//   //      webrtc://r.ossrs.net/live/livestream?schema=https
//   // or use plaintext, without SRTP:
//   //      webrtc://r.ossrs.net/live/livestream?encrypt=false
//   // or any other information, will pass-by in the query:
//   //      webrtc://r.ossrs.net/live/livestream?vhost=xxx
//   //      webrtc://r.ossrs.net/live/livestream?token=xxx
//   self.play = async function (url) {
//     const conf = self.__internal.prepareUrl(url);
//     self.pc.addTransceiver('audio', { direction: 'recvonly' });
//     self.pc.addTransceiver('video', { direction: 'recvonly' });

//     const offer = await self.pc.createOffer();
//     await self.pc.setLocalDescription(offer);
//     const session = await new Promise(function (resolve, reject) {
//       // @see https://github.com/rtcdn/rtcdn-draft
//       const data = {
//         api: conf.apiUrl,
//         tid: conf.tid,
//         streamurl: conf.streamUrl,
//         clientip: null,
//         sdp: offer.sdp
//       };
//       console.log('Generated offer: ', data);

//       const xhr = new XMLHttpRequest();
//       xhr.onload = function () {
//         if (xhr.readyState !== xhr.DONE) return;
//         if (xhr.status !== 200 && xhr.status !== 201) return reject(xhr);
//         const data = JSON.parse(xhr.responseText);
//         console.log('Got answer: ', data);
//         return data.code ? reject(xhr) : resolve(data);
//       };
//       xhr.open('POST', conf.apiUrl, true);
//       xhr.setRequestHeader('Content-type', 'application/json');
//       xhr.send(JSON.stringify(data));
//     });
//     await self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: session.sdp }));
//     session.simulator = `${conf.schema}//${conf.urlObject.server}:${conf.port}/rtc/v1/nack/`;

//     return session;
//   };

//   // Close the player.
//   self.close = function () {
//     self.pc && self.pc.close();
//     self.pc = null;
//   };

//   // The callback when got remote track.
//   // Note that the onaddstream is deprecated, @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onaddstream
//   self.ontrack = function (event) {
//     // https://webrtc.org/getting-started/remote-streams
//     self.stream.addTrack(event.track);
//   };

//   // Internal APIs.
//   self.__internal = {
//     defaultPath: '/rtc/v1/play/',
//     prepareUrl(webrtcUrl) {
//       const urlObject = self.__internal.parse(webrtcUrl);
//       console.log(urlObject, 'urlObject', webrtcUrl);
//       // If user specifies the schema, use it as API schema.
//       // let schema = urlObject.user_query.schema;
//       const schema = 'https:';
//       console.log('urlObject.user_query.schema', urlObject.user_query.schema);
//       // schema = schema ? `${schema}:` : window.location.protocol;

//       let port = urlObject.port || 443;
//       if (schema === 'https:') {
//         port = urlObject.port || 443;
//       }

//       // @see https://github.com/rtcdn/rtcdn-draft
//       let api = urlObject.user_query.play || self.__internal.defaultPath;
//       if (api.lastIndexOf('/') !== api.length - 1) {
//         api += '/';
//       }

//       let apiUrl = `${schema}//${urlObject.server}:${port}${api}`;
//       for (const key in urlObject.user_query) {
//         if (key !== 'api' && key !== 'play') {
//           apiUrl += `&${key}=${urlObject.user_query[key]}`;
//         }
//       }
//       // Replace /rtc/v1/play/&k=v to /rtc/v1/play/?k=v
//       apiUrl = apiUrl.replace(`${api}&`, `${api}?`);

//       const streamUrl = urlObject.url;

//       return {
//         apiUrl,
//         streamUrl,
//         schema,
//         urlObject,
//         port,
//         tid: Number(Number.parseInt(new Date().getTime() * Math.random() * 100))
//           .toString(16)
//           .slice(0, 7)
//       };
//     },
//     parse(url) {
//       // @see: http://stackoverflow.com/questions/10469575/how-to-use-location-object-to-parse-url-without-redirecting-the-page-in-javascri
//       const a = document.createElement('a');
//       a.href = url.replace('rtmp://', 'http://').replace('webrtc://', 'http://').replace('rtc://', 'http://');

//       let vhost = a.hostname;
//       let app = a.pathname.substring(1, a.pathname.lastIndexOf('/'));
//       const stream = a.pathname.slice(a.pathname.lastIndexOf('/') + 1);

//       // parse the vhost in the params of app, that srs supports.
//       app = app.replace('...vhost...', '?vhost=');
//       if (app.includes('?')) {
//         const params = app.slice(app.indexOf('?'));
//         app = app.slice(0, app.indexOf('?'));

//         if (params.indexOf('vhost=') > 0) {
//           vhost = params.slice(params.indexOf('vhost=') + 'vhost='.length);
//           if (vhost.indexOf('&') > 0) {
//             vhost = vhost.slice(0, vhost.indexOf('&'));
//           }
//         }
//       }

//       // when vhost equals to server, and server is ip,
//       // the vhost is __defaultVhost__
//       if (a.hostname === vhost) {
//         const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
//         if (re.test(a.hostname)) {
//           vhost = '__defaultVhost__';
//         }
//       }

//       // parse the schema
//       let schema = 'rtmp';
//       if (url.indexOf('://') > 0) {
//         schema = url.slice(0, url.indexOf('://'));
//       }

//       let port = a.port;
//       if (!port) {
//         // Finger out by webrtc url, if contains http or https port, to overwrite default 1985.
//         if (schema === 'webrtc' && url.indexOf(`webrtc://${a.host}:`) === 0) {
//           port = url.indexOf(`webrtc://${a.host}:80`) === 0 ? 80 : 443;
//         }

//         // Guess by schema.
//         if (schema === 'http') {
//           port = 80;
//         } else if (schema === 'https') {
//           port = 443;
//         } else if (schema === 'rtmp') {
//           port = 1935;
//         }
//       }

//       const ret = {
//         url,
//         schema,
//         server: a.hostname,
//         port,
//         vhost,
//         app,
//         stream
//       };
//       self.__internal.fill_query(a.search, ret);

//       // For webrtc API, we use 443 if page is https, or schema specified it.
//       if (!ret.port) {
//         if (schema === 'webrtc' || schema === 'rtc') {
//           if (ret.user_query.schema === 'https') {
//             ret.port = 443;
//           } else if (window.location.href.indexOf('https://') === 0) {
//             ret.port = 443;
//           } else {
//             // For WebRTC, SRS use 1985 as default API port.
//             ret.port = 443;
//           }
//         }
//       }

//       return ret;
//     },
//     fill_query(query_string, obj) {
//       // pure user query object.
//       obj.user_query = {};

//       if (query_string.length === 0) {
//         return;
//       }

//       // split again for angularjs.
//       if (query_string.includes('?')) {
//         query_string = query_string.split('?')[1];
//       }

//       const queries = query_string.split('&');
//       for (let i = 0; i < queries.length; i++) {
//         const elem = queries[i];

//         const query = elem.split('=');
//         obj[query[0]] = query[1];
//         obj.user_query[query[0]] = query[1];
//       }

//       // alias domain for vhost.
//       if (obj.domain) {
//         obj.vhost = obj.domain;
//       }
//     }
//   };

//   self.pc = new RTCPeerConnection(null);

//   // Create a stream to add track to the stream, @see https://webrtc.org/getting-started/remote-streams
//   self.stream = new MediaStream();

//   // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
//   self.pc.ontrack = function (event) {
//     if (self.ontrack) {
//       self.ontrack(event);
//     }
//   };

//   return self;
// }

// // Depends on adapter-7.4.0.min.js from https://github.com/webrtc/adapter
// // Async-awat-prmise based SRS RTC Publisher by WHIP.
// function SrsRtcWhipWhepAsync() {
//   const self = {};

//   // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
//   self.constraints = {
//     audio: true,
//     video: {
//       width: { ideal: 320, max: 576 }
//     }
//   };

//   // See https://datatracker.ietf.org/doc/draft-ietf-wish-whip/
//   // @url The WebRTC url to publish with, for example:
//   //      http://localhost:1985/rtc/v1/whip/?app=live&stream=livestream
//   self.publish = async function (url) {
//     if (!url.includes('/whip/')) throw new Error(`invalid WHIP url ${url}`);

//     self.pc.addTransceiver('audio', { direction: 'sendonly' });
//     self.pc.addTransceiver('video', { direction: 'sendonly' });

//     if (!navigator.mediaDevices && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
//       throw new SrsError(
//         'HttpsRequiredError',
//         `Please use HTTPS or localhost to publish, read https://github.com/ossrs/srs/issues/2762#issuecomment-983147576`
//       );
//     }
//     const stream = await navigator.mediaDevices.getUserMedia(self.constraints);

//     // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
//     stream.getTracks().forEach(function (track) {
//       self.pc.addTrack(track);

//       // Notify about local track when stream is ok.
//       self.ontrack && self.ontrack({ track });
//     });

//     const offer = await self.pc.createOffer();
//     await self.pc.setLocalDescription(offer);
//     const answer = await new Promise(function (resolve, reject) {
//       console.log('Generated offer: ', offer);

//       const xhr = new XMLHttpRequest();
//       xhr.onload = function () {
//         if (xhr.readyState !== xhr.DONE) return;
//         if (xhr.status !== 200 && xhr.status !== 201) return reject(xhr);
//         const data = xhr.responseText;
//         console.log('Got answer: ', data);
//         return data.code ? reject(xhr) : resolve(data);
//       };
//       xhr.open('POST', url, true);
//       xhr.setRequestHeader('Content-type', 'application/sdp');
//       xhr.send(offer.sdp);
//     });
//     await self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));

//     return self.__internal.parseId(url, offer.sdp, answer);
//   };

//   // See https://datatracker.ietf.org/doc/draft-ietf-wish-whip/
//   // @url The WebRTC url to play with, for example:
//   //      http://localhost:1985/rtc/v1/whep/?app=live&stream=livestream
//   self.play = async function (url) {
//     if (!url.includes('/whip-play/') && !url.includes('/whep/')) throw new Error(`invalid WHEP url ${url}`);

//     self.pc.addTransceiver('audio', { direction: 'recvonly' });
//     self.pc.addTransceiver('video', { direction: 'recvonly' });

//     const offer = await self.pc.createOffer();
//     await self.pc.setLocalDescription(offer);
//     const answer = await new Promise(function (resolve, reject) {
//       console.log('Generated offer: ', offer);

//       const xhr = new XMLHttpRequest();
//       xhr.onload = function () {
//         if (xhr.readyState !== xhr.DONE) return;
//         if (xhr.status !== 200 && xhr.status !== 201) return reject(xhr);
//         const data = xhr.responseText;
//         console.log('Got answer: ', data);
//         return data.code ? reject(xhr) : resolve(data);
//       };
//       xhr.open('POST', url, true);
//       xhr.setRequestHeader('Content-type', 'application/sdp');
//       xhr.send(offer.sdp);
//     });
//     await self.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));

//     return self.__internal.parseId(url, offer.sdp, answer);
//   };

//   // Close the publisher.
//   self.close = function () {
//     self.pc && self.pc.close();
//     self.pc = null;
//   };

//   // The callback when got local stream.
//   // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
//   self.ontrack = function (event) {
//     // Add track to stream of SDK.
//     self.stream.addTrack(event.track);
//   };

//   self.pc = new RTCPeerConnection(null);

//   // To keep api consistent between player and publisher.
//   // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream#Migrating_to_addTrack
//   // @see https://webrtc.org/getting-started/media-devices
//   self.stream = new MediaStream();

//   // Internal APIs.
//   self.__internal = {
//     parseId: (url, offer, answer) => {
//       let sessionid = offer.substr(offer.indexOf('a=ice-ufrag:') + 'a=ice-ufrag:'.length);
//       sessionid = `${sessionid.substr(0, sessionid.indexOf('\n') - 1)}:`;
//       sessionid += answer.substr(answer.indexOf('a=ice-ufrag:') + 'a=ice-ufrag:'.length);
//       sessionid = sessionid.substr(0, sessionid.indexOf('\n'));

//       const a = document.createElement('a');
//       a.href = url;
//       return {
//         sessionid, // Should be ice-ufrag of answer:offer.
//         simulator: `${a.protocol}//${a.host}/rtc/v1/nack/`
//       };
//     }
//   };

//   // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
//   self.pc.ontrack = function (event) {
//     if (self.ontrack) {
//       self.ontrack(event);
//     }
//   };

//   return self;
// }

// // Format the codec of RTCRtpSender, kind(audio/video) is optional filter.
// // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs#getting_the_supported_codecs
// function SrsRtcFormatSenders(senders, kind) {
//   const codecs = [];
//   senders.forEach(function (sender) {
//     const params = sender.getParameters();
//     params &&
//       params.codecs &&
//       params.codecs.forEach(function (c) {
//         if (kind && sender.track.kind !== kind) {
//           return;
//         }

//         if (c.mimeType.indexOf('/red') > 0 || c.mimeType.indexOf('/rtx') > 0 || c.mimeType.indexOf('/fec') > 0) {
//           return;
//         }

//         let s = '';

//         s += c.mimeType.replace('audio/', '').replace('video/', '');
//         s += `, ${c.clockRate}HZ`;
//         if (sender.track.kind === 'audio') {
//           s += `, channels: ${c.channels}`;
//         }
//         s += `, pt: ${c.payloadType}`;

//         codecs.push(s);
//       });
//   });
//   return codecs.join(', ');
// }

export default {
  SrsRtcPublisherAsync,
  // SrsRtcPlayerAsync,
  // SrsRtcWhipWhepAsync,
  // SrsRtcFormatSenders,
  SrsError
};
