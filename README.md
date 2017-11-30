# FBI Docs

# 安装和配置
----------
    $ tnpm i -g fbi@next


    $ fbi set npm=yarn


# 入门使用
----------
    $ fbi init https://github.com/fbi-templates/fbi-project-mod.git my-project


    $ fbi ls


    $ fbi s


# 进阶使用


## 模板管理

**添加**

    $ fbi add <repo>       # 远程模板　　　
    $ fbi add path/to/tmpl # 本地模板
    $ fbi add .            # 本地模板（当前目录）

**更新**

    $ fbi up <tmpl>

**删除**

    $ fbi rm <tmpl>



## 项目管理

**初始化**


    $ fbi init <tmpl>[@<version>] [option]
| **option**          | **说明**                      |
| ------------------- | --------------------------- |
| 空                   | 只有项目源码，和指定模板名称              |
| `-o`  ,   `-option` | 带上项目配置                      |
| `-t`  ,   `-task`   | 带上项目配置和任务                   |
| `-a`  ,   `-all`    | 所有文件(除.git目录外)，基于已有模版生成新的模版 |

在已有项目上执行`fbi init [option]`, 只更新指定的options, 不更新src。


**版本控制**

    $ fbi <task>        # 自动切换
    $ fbi use <version> # 手动切换　　　　　　　　
  
----------


## 查看信息
    $ fbi ls [item] [item]
| **item**               | **说明**         |
| ---------------------- | -------------- |
| 空                      | 查看当前目录可用的任务和模板 |
| `util`  /  `utils`     | 查看可用工具类        |
| `store`  /  `stores`   | 模板仓库信息         |
| `config`  /  `configs` | FBI全局配置        |



## 执行任务
    $ fbi ls
    $ fbi <task> [params]  # task: 任务名称或别名; params: 任务参数;　　　　 　　　　　　　



# 模板开发
----------
## 步骤
1. 创建目录结构
2. 任务开发
  1. 项目模板：将任务文件置于fbi目录内
  2. 任务模版：按照普通的npm模块开发方式进行即可
3. 测试
4. 提交到git仓库


## 推荐命名方式
- 项目模板：`fbi-project-*`
- 任务模板：`fbi-task-*`


## 如何更快地获取任务参数？
    const params = ctx.task.getParams()


    if(params.test) {}
    server.port = params.port


## 如何使用FBI内置的工具类？
    ctx.utils.x
    ctx.logger.x


## 如何让任务可以并行执行？
1. module.export
2. return promise


# 模板列表

https://github.com/fbi-templates



# API Docs

**命令说明**

查看：`fbi` / `fbi -h`

| **项**                                             | **说明**                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `add <repo> [<repo> ...]`                         | 添加模板(项目模板和任务模板)                                                                            |
| `init <template>[@<version>] [project] [options`] | 初始化项目。template: 模板名称; version: 模板版本; project: 项目路径; options: 选项(-o: 带选项; -t: 带任务; -a:带所有;) |
| `use <version>`                                   | 指定项目所使用的模板版本。version: 模板版本号(可通过 `fbi ls store` 查看获得)                                       |
| `install, i`                                      | 安装依赖（会自动安装当前项目的生产依赖和对应模板的开发依赖）                                                             |
| `list, ls, l [item]`                              | 查看信息。空: 当前目录可用的任务和模板; config: 全局配置; store: 仓库信息; util: 工具类列表;                              |
| `remove, rm <template>`                           | 删除模板。template: 模板名称（可简写、可全称）                                                               |
| `update, up [template]`                           | 更新模板。template: 模板名称（可简写、可全称）                                                               |
| `set [key=value]`                                 | 设置全局配置。空: 交互式填写所有配置; 不为空: 设置单项                                                             |
| `reset`                                           | 重置全局配置                                                                                     |
| `--help, -h`                                      | 显示帮助信息                                                                                     |
| `--version, -v`                                   | 显示FBI版本号                                                                                   |



**全局配置说明**

查看： `$ fbi ls config` 

设置： `$ fbi set` 

使用：`ctx.configs`

| **项**                    | **说明**     | **默认值**                                                                                |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------- |
| _DATA_ROOT  (只读)         | 本地仓库目录     | /Users/{yourname}/.fbi                                                                 |
| _STORE_FILE  (只读)        | 仓库信息文件路径   | /Users/{yourname}/.fbi/store.json                                                      |
| _CUSTOM_CONFIG_FILE (只读) | 自定义配置文件路径  | /Users/{yourname}/.fbi/configs.custom.json                                             |
| LOG_LEVEL                | 日志级别       | info                                                                                   |
| LOG_PREFIX               | 日志前缀       | FBI··>                                                                                 |
| NPM                      | npm别名      | npm                                                                                    |
| NPM_OPTIONS              | npm参数      | 空                                                                                      |
| TASK_PREFIX              | 任务模板前缀     | fbi-task-                                                                              |
| TEMPLATE_PREFIX          | 项目模板前缀     | fbi-project-                                                                           |
| TEMPLATE_TASK            | 模板内任务文件目录名 | fbi                                                                                    |
| TEMPLATE_CONFIG          | 模板配置文件路径   | fbi/options.js                                                                         |
| TEMPLATE_INIT_IGNORE     | 初始化项目时的忽略项 | node_modules,.DS_Store,.svn,.git,dst,dist,package.json,fbi,yarn.lock,package-lock.json |
| TEMPLATE_ADD_IGNORE      | 添加模板时的忽略项  | .DS_Store,.svn,.git,dst,dist                                                           |
| VERSION_SEPARATOR        | 版本分隔符      | @                                                                                      |


**仓库信息说明**

查看： `$ fbi ls store` 

使用：`ctx.stores`

| **项**       | **说明** | **示例**                                                                                      |
| ----------- | ------ | ------------------------------------------------------------------------------------------- |
| type        | 模板类型   | project/task                                                                                |
| path        | 模板路径   | /Users/{yourname}/.fbi/fbi-project-simple                                                   |
| version     | 模板版本信息 | false / {"latest":"v3.1.0","current":"v3.1.0","all":["v3.0.0","v3.1.0"]}  （false则说明不支持版本控制） |
| repository  | 模板来源路径 | https://github.com/fbi-templates/fbi-project-mod.git                                        |
| description | 模板描述   | Node service, npm module template.                                                          |
| tasks       | 模板内含任务 | build,serve                                                                                 |


**内置工具类说明** 

查看： `$ fbi ls util` 

使用：`ctx.utils[分类][方法]` / `ctx.utils[方法]`

| **分类** | **方法**                                                                                   | **说明**                                                      |
| ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| fs     | stat,mkdirp,exist,existSync,read,write,copy,remove,list,isEmptyDir,homeDir               | 文件操作类                                                       |
| style  | bold,italic,underline,inverse,white,grey,black,blue,cyan,green,magenta,red,yellow,normal | 文本样式类                                                       |
| type   | isJson,isObject,isArray,isTaskFile,isPath,isGitUrl                                       | 类型判断类                                                       |
| git    | is,clone,pull,tags,currentTag,currentBranch,checkout,getBranchs                          | git操作类                                                      |
| path   | isAbsolute,isRelative,normalize,cwd,join,dir                                             | path操作类                                                     |
| Logger | debug,info,success,warn,error,log                                                        | 日志类， 使用方法 ：const log = new ctx.utils.Logger(); log.info(‘’) |
| 其他     | argvParse                                                                                | 终端参数解析                                                      |
| 其他     | assign                                                                                   | json深合并                                                     |
| 其他     | dateFormat                                                                               | 日期时间格式化                                                     |
| 其他     | exec                                                                                     | spawn的promise版                                              |
| 其他     | flow                                                                                     | 终端交互方法                                                      |
| 其他     | promisify                                                                                | promise化                                                    |
| 其他     | sequence                                                                                 | 顺序执行多个promise                                               |

特殊工具类 logger
使用：`ctx.logger[方法]`

