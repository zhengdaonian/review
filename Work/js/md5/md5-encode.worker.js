import SparkMD5 from "spark-md5";
import { createMD5 } from "hash-wasm";

let hasher;

const createMd5 = async (type) => {
  try {
    hasher = new Hashser();
    await hasher.create(type);
    self.postMessage({ status: "createSuccess" });
  } catch (e) {
    self.postMessage({ status: "error", error: e });
  }
};

/** 整合'spark-md5'和'hash-wasm' */
class Hashser {
  maker;
  type;
  async create(type) {
    if (!type) {
      // 默认使用hash-wasm，如果浏览器不支持wasm,就用spark-md5
      if (
        typeof WebAssembly === "object" &&
        typeof WebAssembly.instantiate === "function"
      ) {
        console.log("当前浏览器支持WebAssembly");
        this.type = "hash-wasm";
        this.maker = await createMD5();
        this.maker.init();
      } else {
        console.log("当前浏览器不支持WebAssembly");
        this.type = "spark-md5";
        this.maker = new SparkMD5.ArrayBuffer();
      }
    }
    this.type = type;
    if (type === "spark-md5") {
      this.maker = new SparkMD5.ArrayBuffer();
    } else {
      this.maker = await createMD5();
      this.maker.init();
    }
  }
  append(dataBuffer) {
    if (this.type === "spark-md5") {
      this.maker.append(dataBuffer);
    } else {
      this.maker.update(new Uint8Array(dataBuffer));
    }
  }
  end() {
    if (this.type === "spark-md5") {
      const result = this.maker.end();
      this.maker.destroy();
      return result;
    }
    return this.maker.digest();
  }
}
self.addEventListener("message", ({ data }) => {
  const { dataBuffer, status } = data;
  try {
    if (status === "create") {
      createMd5();
    }
    if (status === "ing") {
      hasher.append(dataBuffer);
    } else if (status === "end") {
      self.postMessage({ md5: hasher.end(), status: "success" });
    }
  } catch (e) {
    self.postMessage({ status: "error", error: e });
    console.error(e);
  }
});
