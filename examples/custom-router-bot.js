const Telegraf = require('../')
const { Router, Extra, memorySession } = require('../')

const markup = Extra
  .HTML()
  .markup((m) => m.inlineKeyboard([
    m.callbackButton('Add 1', 'add:1'),
    m.callbackButton('Add 10', 'add:10'),
    m.callbackButton('Add 100', 'add:100'),
    m.callbackButton('Subtract 1', 'sub:1'),
    m.callbackButton('Subtract 10', 'sub:10'),
    m.callbackButton('Subtract 100', 'sub:100'),
    m.callbackButton('Clear', 'clear')
  ], {columns: 3}))

const calculator = new Router((ctx) => {
  if (!ctx.callbackQuery.data) {
    return Promise.resolve()
  }
  const parts = ctx.callbackQuery.data.split(':')
  return Promise.resolve({
    route: parts[0],
    state: {
      amount: parseInt(parts[1], 10) || 0
    }
  })
})

calculator.on('add', (ctx) => {
  ctx.session.value = (ctx.session.value || 0) + ctx.state.amount
  return editText(ctx)
})

calculator.on('sub', (ctx) => {
  ctx.session.value = (ctx.session.value || 0) - ctx.state.amount
  return editText(ctx)
})

calculator.on('clear', (ctx) => {
  ctx.session.value = 0
  return editText(ctx)
})

function editText (ctx) {
  return ctx.session.value !== 42
    ? ctx.editMessageText(`Value: <b>${ctx.session.value}</b>`, markup).catch(() => undefined)
    : ctx.answerCallbackQuery('🎉', undefined, true).then(() => ctx.editMessageText(`🎉 ${ctx.session.value} 🎉`))
}

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(memorySession({ttl: 10}))
bot.start((ctx) => {
  ctx.session.value = 0
  return ctx.reply(`Value: <b>${ctx.session.value}</b>`, markup)
})
bot.on('callback_query', calculator)
bot.startPolling()
