import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, MenuButtonWebApp
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

Нажми кнопку меню ниже чтобы открыть гайд\n\n👇""",

    'en': """Hey there! 👋

I'm your Bali & Islands guide 🌴

What's inside:
🏠 Find your area — match your vibe to the perfect district
📍 922+ verified spots with Maps
🗺 146 ready-made daily itineraries
📋 Bali Base — visas, safety, money, culture

12 areas: Canggu · Ubud · Seminyak · Uluwatu · Sanur · Amed · North · Lovina · Nusa Penida · Gili · Lombok · Java

Tap the menu button below to open the guide\n\n👇""",

    'ua': """Привіт! 👋

Я — твій гід по Балі та островах 🌴

Що всередині:
🏠 Підбір району — знайди де жити за своїми інтересами
📍 922+ перевірених місць з Maps
🗺 146 готових маршрутів на кожен день
📋 Балі База — все від візи до аптечки

12 районів: Чангу · Убуд · Семіньяк · Улувату · Санур · Амед · Північ · Ловіна · Нуса Пеніда · Гілі · Ломбок · Ява

Натисни кнопку меню нижче щоб відкрити гід\n\n👇""",

    'ar': """مرحباً! 👋

أنا دليلك في بالي والجزر 🌴

قريباً... النسخة العربية قيد الإعداد
Coming soon — Arabic version is under development

🇦🇪""",

    'kz': """Сәлем! 👋

Мен — сенің Бали мен аралдар бойынша гидің 🌴

Ішінде не бар:
🏠 Аудан таңдау — қызығушылықтарыңа сай аудан тап
📍 922+ тексерілген орын Maps-пен
🗺 146 дайын күнделікті маршрут
📋 Бали базасы — визадан дәріханаға дейін барлығы

12 аудан: Чангу · Убуд · Семіньяк · Улувату · Санур · Амед · Солтүстік · Ловина · Нуса Пенида · Гили · Ломбок · Ява

Гидті ашу үшін төмендегі мәзір батырмасын бас\n\n👇"""
}

async def start(update: Update, context):
    keyboard = [
        [InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru")],
        [InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")],
        [InlineKeyboardButton("🇺🇦 Українська", callback_data="lang_ua")],
        [InlineKeyboardButton("🇰🇿 Қазақша", callback_data="lang_kz")],
        [InlineKeyboardButton("🇦🇪 العربية", callback_data="lang_ar")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Choose your language:",
        reply_markup=reply_markup
    )

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, MenuButtonWebApp

async def lang_callback(update: Update, context):
    query = update.callback_query
    await query.answer()
    lang = query.data.replace("lang_", "")
    greeting = GREETINGS.get(lang, GREETINGS["en"])
    
    # Update the greeting language
    await query.message.edit_text(
        "✅ " + {"ru":"Русский","en":"English","ua":"Українська","kz":"Қазақша","ar":"العربية"}.get(lang, lang)
    )
    
    # Build the personalized WebApp URL
    base_url = "https://kotland.github.io/Balidreamphoto-"
    app_url = f"{base_url}/{lang}/guides.html" if lang != 'ru' else f"{base_url}/guides.html"
    
    # Also change the Menu Button for this specific user so the bottom left button works perfectly in their language!
    try:
        btn_text = {"ru":"Открыть Гайд", "en":"Open Guide", "ua":"Відкрити Гід", "kz":"Гидті ашу", "ar":"افتح الدليل"}.get(lang, "Open Guide")
        await context.bot.set_chat_menu_button(
            chat_id=query.message.chat_id,
            menu_button=MenuButtonWebApp(type="web_app", text=btn_text, web_app=WebAppInfo(url=app_url))
        )
    except Exception as e:
        print("Failed to set menu button:", e)

    # Send greeting with a giant "Open App" button directly in the chat as well!
    btn_text_inline = {"ru":"🚀 Открыть Гайд", "en":"🚀 Open Guide", "ua":"🚀 Відкрити Гід", "kz":"🚀 Гидті ашу", "ar":"🚀 افتح الدليل"}.get(lang, "🚀 Open Guide")
    markup = InlineKeyboardMarkup([[InlineKeyboardButton(btn_text_inline, web_app=WebAppInfo(url=app_url))]])
    
    await context.bot.send_message(
        chat_id=query.message.chat_id,
        text=greeting,
        reply_markup=markup
    )

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(lang_callback, pattern="^lang_"))
    print("Bot started!")
    app.run_polling()

if __name__ == "__main__":
    main()
