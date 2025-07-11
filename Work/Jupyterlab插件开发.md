借鉴
<br />
[jupyterLab 插件开发](https://juejin.cn/post/6844903989473984526#heading-0)
<br />
[JupyterLab 插件开发教程](https://blog.csdn.net/qq_29334605/article/details/129500252)
<br />
[jupyterlab extension](https://jupyterlab.readthedocs.io/en/stable/extension/extension_tutorial.html)

### 一、 创建 conda 虚拟环境

`    conda create -n jupyterlab-extension  --override-channels --strict-channel-priority -c conda-forge -c nodefaults jupyterlab nodejs git cookiecutter jinja2-time`

### 二、进入到虚拟环境里面

conda activate jupyterlab-extension

### 三、进入到工作目录

cd workDir

### 四、下载

`旧：cookiecutter https://github.com/jupyterlab/extension-cookiecutter-ts.git`

`2024/4/1 cookiecutter https://github.com/jupyterlab/extension-template.git`

### 五、进入到开发目录，下载依赖

### 六、pnpm 打包

### 八、后续每一次更新都需要执行打包和安装插件
