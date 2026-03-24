import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler

TOKEN = os.environ.get('BOT_TOKEN', '')

GREETINGS = {
    'ru': """Привет! 👋

Я — твой гид по Бали и островам 🌴

Что внутри:
🏠 Подбор района — найди где жить по своим интересам
📍 922+ проверенных мест с Maps
🗺 146 готовых маршрутов на каждый день
📋 Бали База — всё от визы до аптечки

12 районов: Чангу · Убуд · Семиньяк · Улувату · Санур · Амед · Север · Ловина · Нуса Пенида · Гили · Ломбок · Ява

⚠️ Если вы из России — для открытия нужен VPN

Нажми кнопку меню ниже чтобы открыть гайд 👇""",

    'en': """Hey there! 👋

I'm your Bali & Islands guide 🌴

What's inside:
🏠 Find your area — match your vibe to the perfect district
📍 922+ verified spots with Maps
🗺 146 ready-made daily itineraries
📋 Bali Base — visas, safety, money, culture

12 areas: Canggu · Ubud · Seminyak · Uluwatu · Sanur · Amed · North · Lovina · Nusa Penida · Gili · Lombok · Java

Tap the menu button below to open the guide 👇""",

    'ua': """Привіт! 👋

Я — твій гід по Балі та островах 🌴

Що всередині:
🏠 Підбір району — знайди де жити за своїми інтересами
📍 922+ перевірених місць з Maps
🗺 146 готових маршрутів на кожен день
📋 Балі База — все від візи до аптечки

12 районів: Чангу · Убуд · Семіньяк · Улувату · Санур · Амед · Північ · Ловіна · Нуса Пеніда · Гілі · Ломбок · Ява

Натисни кнопку меню нижче щоб відкрити гід 👇""",

    'kz': """Сәлем! 👋

Мен — сенің Бали мен аралдар бойынша гидің 🌴

Ішінде не бар:
🏠 Аудан таңдау — қызығушылықтарыңа сай аудан тап
📍 922+ тексерілген орын Maps-пен
🗺 146 дайын күнделікті маршрут
📋 Бали базасы — визадан дәріханаға дейін барлығы

12 аудан: Чангу · Убуд · Семіньяк · Улувату · Санур · Амед · Солтүстік · Ловина · Нуса Пенида · Гили · Ломбок · Ява

Гидті ашу үшін төмендегі мәзір батырмасын бас 👇"""
}

async def start(update: Update, context):
    keyboard = [
        [InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")],
        [InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")],
        [InlineKeyboardButton("🇺🇦 Українська", callback_data="lang_ua")],
        [InlineKeyboardButton("🇰🇿 Қазақша", callback_data="lang_kz")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Hi! Choose your language:\nОберіть мову · Тілді таңдаңыз",
        reply_markup=reply_markup
    )

async def lang_callback(update: Update, context):
    query = update.callback_query
    await query.answer()
    lang = query.data.replace("lang_", "")
    greeting = GREETINGS.get(lang, GREETINGS["en"])
    # Edit the original message to remove buttons
    await query.message.edit_text(
        "✅ " + {"ru":"Русский","en":"English","ua":"Українська","kz":"Қазақша"}.get(lang, lang)
    )
    # Send greeting as new message
    await query.message.reply_text(greeting)

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(lang_callback, pattern="^lang_"))
    print("Bot started!")
    app.run_polling()

if __name__ == "__main__":
    main()
