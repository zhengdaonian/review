/*
 * @description 创建文件的MD5值,根据文件大小动态选择分片大小和快速循环的方式
 * @param {Object} file el文件对象或文件对象
 * @return {String} MD5 值
 * */
const defaultChuckSize = 50 * 1024 * 1024; // 每次处理数据块的最大值，1MB
const chunksPerCycle = 100; // 每个计算周期中处理的数据块数
export const createMD5 = (file: any, chunkSize = defaultChuckSize) => {
  file = file.raw || file;
  const stamp = Date.now();
  console.time(`md计算耗时${stamp}`);

  const chunkList: any = [];
  const worker = new Worker(
    /* webpackChunkName: "md5-encode.worker" */ new URL('../worker/md5-encode.worker.js', import.meta.url),
    { type: 'module' }
  );
  return new Promise((resolve, reject) => {
    // 分片放worker处理
    const fileReader = new FileReader();
    try {
      let currentChunk = 0;
      const totalChunks = Math.ceil(file.size / chunkSize);
      // 处理数据块
      const processChunk = (start: number) => {
        try {
          const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = blobSlice.call(file, start, end);
          chunkList.push(chunk);
          fileReader.readAsArrayBuffer(chunk);
        } catch (e) {
          console.error(e);
        }
      };
      // 文件读取成功
      fileReader.onload = () => {
        /* spark.append(fileReader.result) // 将当前数据块内容追加到 MD5 计算器 */
        worker.postMessage({ dataBuffer: fileReader.result, status: 'ing' }, [fileReader.result]);

        currentChunk += 1;
        if (currentChunk >= totalChunks) {
          worker.postMessage({ status: 'end' });
        } else if (currentChunk % chunksPerCycle === 0) {
          // 在处理指定数量的数据块后，设置一个任务延迟以使 UI 线程有空间处理
          setTimeout(() => {
            processChunk(currentChunk * chunkSize);
          }, 0);
        } else {
          // 继续处理下一个数据块
          processChunk(currentChunk * chunkSize);
        }
      };

      fileReader.onerror = e => {
        console.error(e);
        return reject(e);
      };
      worker.onerror = e => {
        fileReader.abort();
        reject(e);
      };
      worker.onmessage = ({ data }) => {
        const { md5, status, error } = data;
        if (status === 'createSuccess') {
          // 开始处理第一个数据块
          processChunk(0);
          return;
        }
        if (status === 'success') {
          resolve({ md5, chunkList });
        } else {
          reject(error);
        }
        fileReader.abort();
        console.timeEnd(`md计算耗时${stamp}`);
        worker.terminate();
      };
      worker.postMessage({ status: 'create' });
    } catch (e) {
      console.error(e);
      fileReader.abort();
      reject(e);
    } finally {
    }
  });
};
