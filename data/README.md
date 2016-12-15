# fbi-data

## 简介
该项目存储我们组内公用的fbi任务和项目模板。

fbi通过简单的命令即可下载和更新本仓库到本地。

## 使用

**注：以下命令请在支持 `git`、 `rm -rf`、 `mkdir` 的终端执行，windows稳定性未测，有问题请及时反馈.**

- `fbi` 升级到最新版本：`npm i -g fbi`
  - `fbi ls` 可见`clone`任务

- 下载该仓库：`fbi clone http://git.code.oa.com/sng-fe-team/fbi-data.git`
  - 会将fbi-data.git 克隆到fbi的数据文件夹（位于fbi全局）
  - `fbi ls` 查看所有任务和模板

- 更新本地数据：`fbi pull`
  - 会更新远程仓库到本地
  - 适用于本地版本落后于远程版本时

## 新增/修改 公用任务和模板
注: 为保障公用数据的通用性和稳定性，新增或修改公用任务和模板的唯一途径是 **操作本仓库**。
本地通过fbi仅能做`clone`和`pull`，不能`commit`或`push`

欢迎 ` pull request `
