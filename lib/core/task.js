const path = require('path')
const utils = require('../utils')
const vmr = require('../helpers/vmr')

module.exports = class Task {
  /**
   * Run a task
   *
   * @param {string} task Task name
   * @param {object} ctx Context
   * @returns 
   */
  async run(task, ctx) {
    ctx.logger.debug('About to execute task:', task)

    // Environment
    let type = 'local'
    if (ctx.mode.template) {
      type = 'template'
    } else if (ctx.mode.global) {
      type = 'global'
    }

    const taskInfo = await this.get(task.name, type, ctx)

    ctx.logger.debug(
      `Task info found:${taskInfo ? '\n' : ' '}${JSON.stringify(
        taskInfo,
        null,
        2
      )}`
    )

    if (!taskInfo) {
      return ctx.logger.error(`Error: Task \`${task.name}\` not found.`)
    }

    ctx.logger.info(
      `Running ${taskInfo.type} task ${utils.style.bold(
        taskInfo.name
      )}${taskInfo.tmpl ? ' in `' + taskInfo.tmpl : ''}${taskInfo.tmplVer
        ? '@' + taskInfo.tmplVer + '`'
        : '`'}...`
    )

    let paramsString = ''
    Object.keys(task.params).map(p => {
      paramsString += ` ${p}=${task.params[p]}`
    })

    if (paramsString) {
      ctx.logger.log(`Task Params:${paramsString}`)
    }

    const modulePaths = [utils.path.cwd('node_modules')]
    if (taskInfo.type === 'template' && ctx.options.template) {
      modulePaths.push(
        path.join(ctx.stores[ctx.options.template.name].path, 'node_modules')
      )
    }

    if (taskInfo.type === 'global') {
      modulePaths.push(
        path.join(
          ctx.configs._DATA_ROOT,
          ctx.configs.TASK_PREFIX + taskInfo.name,
          'node_modules'
        )
      )
    }

    try {
      const resultVmr = await vmr(
        taskInfo.path,
        {
          modulePaths,
          ctx,
          fbi: ctx,
          RegExp,
          Error: Error
        },
        JSON.stringify(task.params || {})
      )
      if (typeof resultVmr === 'function') {
        await resultVmr()
      }
      ctx.logger.success(`🎉  Task \`${taskInfo.name}\` done.`)
    } catch (err) {
      ctx.logger.error(`❗  Task \`${taskInfo.name}\` error.`)
      ctx.logger.error(err)
    }
  }

  /**
   * Get task info
   *
   * @param {string} _name Task name
   * @param {string} type Task type
   * @param {object} ctx Context
   * @returns 
   */
  async get(_name, type, ctx) {
    // Fina real name
    const name = this.findName(_name, ctx.options.tasks)

    let found

    // Find in local
    if (type === 'local') {
      const taskfile = path.join(
        utils.path.cwd(ctx.configs.TEMPLATE_TASKS, name + '.js')
      )
      if (taskfile && (await utils.fs.exist(taskfile))) {
        found = {
          name,
          type: 'local',
          path: taskfile
        }
      }
    }

    // Find in templates
    if (!found && ctx.options.template && ctx.options.template.name) {
      const tmplObj = ctx.stores[ctx.options.template.name]
      if (tmplObj) {
        const taskfile = path.join(
          tmplObj.path,
          ctx.configs.TEMPLATE_TASKS,
          name + '.js'
        )
        if (tmplObj && (await utils.fs.exist(taskfile))) {
          found = {
            name,
            type: 'template',
            path: taskfile,
            tmpl: ctx.options.template.name,
            tmplVer: ctx.options.template.version || tmplObj.version.latest
          }
        }
      }
    }

    // Find in global
    if (!found || type === 'global') {
      const taskObj = ctx.stores[ctx.configs.TASK_PREFIX + name]
      if (taskObj) {
        const taskfile = path.join(taskObj.path, taskObj.file)
        if (await utils.fs.exist(taskfile)) {
          found = {
            name,
            type: 'global',
            path: taskfile
          }
        }
      }
    }

    return found
  }

  /**
   * Get all tasks's info
   *
   * @param {object} configs FBI configs
   * @param {object} options User options
   * @param {object} stores Templates store
   * @returns 
   */
  async all(configs, options, stores) {
    const _tasks = {
      local: [],
      global: [],
      template: []
    }

    // Local folder
    _tasks.local = await this.findTasks(
      utils.path.cwd(configs.TEMPLATE_TASKS),
      options
    )

    // Template folder
    if (options.template && options.template.name) {
      const taskObj = stores[options.template.name]
      if (taskObj) {
        const tmplTaskFolder = path.join(taskObj.path, configs.TEMPLATE_TASKS)
        _tasks.template = await this.findTasks(tmplTaskFolder, options)
      }
    }

    // global tasks
    Object.keys(stores).map(item => {
      if (item.startsWith(configs.TASK_PREFIX)) {
        const name = item.replace(configs.TASK_PREFIX, '')
        _tasks.global.push({
          name,
          alias: this.findAliasByName(name, options.tasks),
          desc: stores[item].description || '',
          version: stores[item].version.current || ''
        })
      }
      return false
    })

    return _tasks
  }

  /**
   * Run tasks in parallel mode
   *
   * @param {array} tasks Tasks to run
   * @param {object} ctx Context
   */
  runInParallel(tasks, ctx) {
    tasks.map(t => {
      this.run(t, ctx)
      return false
    })
  }

  /**
   * Run tasks in serial mode
   *
   * @param {array} tasks Tasks to run
   * @param {object} ctx Context
   */
  async runInSerial(tasks, ctx) {
    for (const t of tasks) {
      await this.run(t, ctx)
    }
  }

  /**
   * Find tasks in the specified directory
   * 
   * @param {string} dir Target directory
   * @param {object} options User options
   * @returns 
   */
  async findTasks(dir, options) {
    const tasks = []
    const exist = await utils.fs.exist(dir)
    if (exist) {
      const lists = await utils.fs.list(dir, [], 1)
      lists.map(t => {
        if (utils.type.isTaskFile(t)) {
          const name = path.basename(t, '.js')
          const info =
            options.tasks && options.tasks[name] ? options.tasks[name] : ''
          tasks.push({
            name,
            alias: info ? info.alias : '',
            desc: info ? info.desc : ''
          })
        }
        return false
      })
    }
    return tasks
  }

  /**
   * Find alias by task name
   * 
   * @param {string} name Task name
   * @param {array} tasks Tasks
   * @returns 
   */
  findAliasByName(name, tasks) {
    if (!name || !tasks) {
      return name
    }
    return tasks[name] ? tasks[name].alias : ''
  }

  /**
   * Find the real name of the task
   * 
   * @param {string} str 
   * @param {array} tasks Tasks
   * @returns 
   */
  findName(str, tasks) {
    if (!str || !tasks) {
      return str
    }

    if (tasks[str]) {
      return str
    }

    let taskName
    for (const name of Object.keys(tasks)) {
      if (tasks[name].alias === str) {
        taskName = name
        break
      }
    }

    return taskName
  }
}

async function collect(dir) {
  const tasks = []
  const exist = await utils.fs.exist(dir)
  if (exist) {
    const lists = await utils.fs.list(dir, [], 1)
    lists.map(t => {
      if (utils.type.isTaskFile(t)) {
        tasks.push({
          name: path.basename(t, '.js'),
          alias: '',
          desc: '',
          version: ''
        })
      }
      return false
    })
  }
  return tasks
}
