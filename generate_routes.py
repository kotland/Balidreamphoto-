import json
import urllib.request
import urllib.parse
import os
import random

SUPABASE_URL = "https://hukabkvchfaueonkiocw.supabase.co/rest/v1"
SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2Fia3ZjaGZhdWVvbmtpb2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTQ0MDksImV4cCI6MjA5MDE3MDQwOX0.PR14C60SvJ_7xvjgG5Uyq-B2aarlmIrzRXV9RzYjF8c"

districts = ["canggu", "ubud", "seminyak", "uluwatu", "bukit_nusadua", "sanur", "north", "lovina", "amed", "gili"]
styles = ["chill", "easy", "hard"]
days_options = [2, 3]

routes_to_insert = []

# Mock data pools for kinfolk vibe
district_places = {
    "canggu": [
        {"name": "WOODS Bali", "desc": "Идеальное утро в интерьере из натурального тика. 📎 Мой совет: берите матчу и садитесь у окна.", "price": "150K", "maps": "#"},
        {"name": "Balay Villa", "desc": "Эстетика минимализма. Скрытый оазис для отдыха и медитации. 📎 Мой совет: идеальное место для утренней практики.", "price": "500K", "maps": "#"},
        {"name": "La Brisa", "desc": "Аутентичный бичклаб из переработанных рыбацких лодок.", "price": "300K", "maps": "#"},
        {"name": "Baked", "desc": "Лучшая выпечка в районе. Хруст круассанов и запах свежего кофе.", "price": "100K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Скрыться от полуденного солнца у приватного бассейна под звуки цикад.", "price": "-", "maps": "#"},
        {"name": "Crate Cafe", "desc": "Индустриальный вайб и огромные порции здоровой еды.", "price": "120K", "maps": "#"},
        {"name": "Echo Beach", "desc": "Закат с видом на серферов и океан.", "price": "Free", "maps": "#"},
        {"name": "ZIN Cafe", "desc": "Коворкинг и спешелти кофе в бамбуковом павильоне.", "price": "150K", "maps": "#"}
    ],
    "ubud": [
        {"name": "Kamandalu Resort", "desc": "Плавающий завтрак с видом на джунгли. 📎 Мой совет: бронируйте лодку на рассвете.", "price": "800K", "maps": "#"},
        {"name": "Uchusen", "desc": "Уникальная архитектура и футуристичный дизайн среди рисовых террас. 📎 Мой совет: приходите на закате.", "price": "300K", "maps": "#"},
        {"name": "Alchemy", "desc": "Сыроедческое кафе и клиника холистической медицины. Место силы.", "price": "150K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Время остановиться. Только вы, книга и звуки тропического леса.", "price": "-", "maps": "#"},
        {"name": "Zest", "desc": "Растительная кухня в храмовом интерьере.", "price": "200K", "maps": "#"},
        {"name": "Tegallalang", "desc": "Утренний туман над рисовыми террасами.", "price": "50K", "maps": "#"},
        {"name": "Campuhan Ridge Walk", "desc": "Прогулка по холмам художников на рассвете.", "price": "Free", "maps": "#"}
    ],
    "seminyak": [
        {"name": "Ku De Ta", "desc": "Классика закатов. Красный горизонт и авторские коктейли. 📎 Мой совет: столик на первой линии обязателен.", "price": "500K", "maps": "#"},
        {"name": "Revolver Espresso", "desc": "Секретная дверь, за которой варят лучший кофе в городе.", "price": "100K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Спасительная прохлада кондиционера после шоппинга в бутиках.", "price": "-", "maps": "#"},
        {"name": "Potato Head", "desc": "Архитектурный шедевр из старых оконных рам и лучший амфитеатр для заката.", "price": "400K", "maps": "#"},
        {"name": "Sisterfields", "desc": "Мельбурнская культура завтраков в сердце Бали.", "price": "150K", "maps": "#"},
        {"name": "Kim Soo", "desc": "Эстетика дома и вкусный кофе у бассейна. 📎 Мой совет: идеальное место для покупки декора.", "price": "100K", "maps": "#"}
    ],
    "uluwatu": [
        {"name": "Ulu Cliffhouse", "desc": "Бар на краю скалы. Шум волн и дип-хаус. 📎 Мой совет: спускайтесь к океанскому бассейну.", "price": "400K", "maps": "#"},
        {"name": "Gooseberry", "desc": "Французское бистро с бассейном среди зелени. 📎 Мой совет: берите круассаны с миндалем.", "price": "200K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Дневной сон под шум вентилятора, пока на улице зной.", "price": "-", "maps": "#"},
        {"name": "Thomas Beach", "desc": "Белый песок и бирюзовая вода. Секретный спот.", "price": "Free", "maps": "#"},
        {"name": "Istana", "desc": "Премиальный биохакинг и сауна на обрыве. Тотальное очищение.", "price": "300K", "maps": "#"},
        {"name": "Single Fin", "desc": "Легендарные воскресные вечеринки с видом на серф-спот.", "price": "200K", "maps": "#"}
    ],
    "bukit_nusadua": [
        {"name": "The Apurva Kempinski", "desc": "Монументальная архитектура и королевский размах.", "price": "1000K", "maps": "#"},
        {"name": "St. Regis Bar", "desc": "Вечерний джаз и ритуал шампанского.", "price": "500K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Отдых в тени франжипани с ледяным кокосом.", "price": "-", "maps": "#"},
        {"name": "Geger Beach", "desc": "Спокойный океан без волн. Идеально для утреннего плавания.", "price": "Free", "maps": "#"},
        {"name": "Nusa Dua Promenade", "desc": "Велосипедная прогулка вдоль океана на рассвете.", "price": "Free", "maps": "#"}
    ],
    "sanur": [
        {"name": "Massimo", "desc": "Лучшее итальянское джелато на острове.", "price": "50K", "maps": "#"},
        {"name": "Byrdhouse", "desc": "Стильный пляжный клуб с видом на соседние острова. 📎 Мой совет: бронируйте кабану.", "price": "300K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Ленивый полдень с книгой на веранде.", "price": "-", "maps": "#"},
        {"name": "Sanur Boardwalk", "desc": "Пробежка или прогулка на велосипеде по 5-километровой дорожке вдоль океана.", "price": "Free", "maps": "#"},
        {"name": "Genius Cafe", "desc": "Коворкинг прямо на песке с отличной здоровой едой.", "price": "150K", "maps": "#"}
    ],
    "north": [
        {"name": "Munduk Moding Plantation", "desc": "Бассейн в облаках и кофейные плантации. 📎 Мой совет: оставайтесь на закат.", "price": "600K", "maps": "#"},
        {"name": "Banyumala Waterfall", "desc": "Мощные струи воды в сердце джунглей. Настоящий душ природы.", "price": "50K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Прохлада гор и туман, застилающий террасы. Идеальное время для чая.", "price": "-", "maps": "#"},
        {"name": "Buyan Lake", "desc": "Мистическое озеро и кемпинг среди сосен.", "price": "Free", "maps": "#"},
        {"name": "Golden Valley Club", "desc": "Эко-кафе у водопада с видом на джунгли.", "price": "100K", "maps": "#"}
    ],
    "lovina": [
        {"name": "Lovina Dolphin Watching", "desc": "Встреча рассвета в океане в компании диких дельфинов.", "price": "150K", "maps": "#"},
        {"name": "Banjar Hot Springs", "desc": "Священные горячие источники среди тропического леса.", "price": "30K", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Спокойный сон под звуки северного Бали.", "price": "-", "maps": "#"},
        {"name": "Brahma Vihara Arama", "desc": "Буддийский монастырь, мини-копия Боробудура. Тихое место для медитации.", "price": "Free", "maps": "#"},
        {"name": "The Damai", "desc": "Органический ресторан с видом на северное побережье.", "price": "400K", "maps": "#"}
    ],
    "amed": [
        {"name": "Camaya", "desc": "Бамбуковые дома и магия восточного Бали. 📎 Мой совет: выспитесь и наслаждайтесь видами.", "price": "500K", "maps": "#"},
        {"name": "Japanese Shipwreck", "desc": "Снорклинг над затонувшим кораблем. Кораллы и сотни рыб.", "price": "Free", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Отдых после дайвинга, пока солнце в зените.", "price": "-", "maps": "#"},
        {"name": "Blue Earth Village", "desc": "Фантастический вид на Агунг и закат из бамбукового комплекса.", "price": "150K", "maps": "#"},
        {"name": "Warung Bobo", "desc": "Свежая рыба на гриле прямо на пляже с черным песком.", "price": "100K", "maps": "#"}
    ],
    "gili": [
        {"name": "Gili Trawangan Swing", "desc": "Качели в океане на закате. Классика, которую нельзя пропустить.", "price": "Free", "maps": "#"},
        {"name": "Turtle Point", "desc": "Плавание с гигантскими черепахами в кристальной воде. 📎 Мой совет: плывите рано утром.", "price": "Free", "maps": "#"},
        {"name": "🏨 Сиеста на вилле", "desc": "Жара спадает, самое время для короткого сна в гамаке.", "price": "-", "maps": "#"},
        {"name": "Casa Vintage Beach", "desc": "Пикник на пляже в стиле бохо. Ковры, подушки и тапас.", "price": "200K", "maps": "#"},
        {"name": "Night Market", "desc": "Свежайшие морепродукты на гриле под открытым небом.", "price": "100K", "maps": "#"}
    ]
}

# Fallback pool if a district is missing places
fallback_places = [
    {"name": "Secret Beach", "desc": "Уединенный пляж без толп туристов.", "price": "Free", "maps": "#"},
    {"name": "Local Warung", "desc": "Аутентичная еда, как готовят балийские бабушки.", "price": "50K", "maps": "#"},
    {"name": "Sunset Point", "desc": "Скрытый спот для проводов солнца с кокосом в руке.", "price": "30K", "maps": "#"}
]

names = {
    "chill": ["Идеальный релакс в {}", "Медленные дни: {}", "Перезагрузка в {}"],
    "easy": ["Легкое знакомство с {}", "Комфортные выходные: {}", "Баланс впечатлений в {}"],
    "hard": ["Максимум эмоций: {}", "Активное погружение в {}", "Насыщенный уикенд в {}"]
}

descs = {
    "chill": "Тотальное расслабление. Без спешки, только наслаждение моментом, долгие завтраки и обязательная сиеста.",
    "easy": "Идеальный баланс между отдыхом у бассейна и исследованием знаковых мест. Комфортный темп.",
    "hard": "Для тех, кто хочет увидеть всё. Ранние подъемы, много локаций, максимум контента и впечатлений."
}

def generate_route(district_slug, style, days):
    pool = district_places.get(district_slug, fallback_places)
    
    # Shuffle pool but keep siesta for chill/easy
    available_places = [p for p in pool if "Сиеста" not in p["name"]]
    random.shuffle(available_places)
    
    siesta = next((p for p in pool if "Сиеста" in p["name"]), {"name": "🏨 Сиеста на вилле", "desc": "Отдых от жары.", "price": "-", "maps": "#"})
    
    places = []
    
    places_per_day = 4 if style == "hard" else 3
    
    for day in range(1, days + 1):
        if style in ["chill", "easy"]:
            # Morning
            if available_places:
                p = available_places.pop(0)
                places.append({"time": f"День {day} — 10:00", **p})
            # Siesta
            places.append({"time": f"День {day} — 14:00", **siesta})
            # Evening
            if available_places:
                p = available_places.pop(0)
                places.append({"time": f"День {day} — 17:00", **p})
        else:
            # Hard mode - no siesta, 4 places
            times = ["08:00", "12:00", "15:00", "19:00"]
            for t in times:
                if available_places:
                    p = available_places.pop(0)
                    places.append({"time": f"День {day} — {t}", **p})
                else:
                    # Refill available if empty just to have enough
                    available_places = [p for p in pool if "Сиеста" not in p["name"]]
                    random.shuffle(available_places)
                    p = available_places.pop(0)
                    places.append({"time": f"День {day} — {t}", **p})
            
    district_name = district_slug.capitalize()
    
    return {
        "district_slug": district_slug,
        "style": style,
        "days": days,
        "name": random.choice(names[style]).format(district_name),
        "desc": descs[style],
        "places": places,
        "priority": 10
    }

for d in districts:
    for style in styles:
        for days in days_options:
            # Generate exactly 3 routes per style per days per district is 3x2=6?
            # Wait, 3x 2-day routes (Chill, Easy, Hard), 3x 3-day routes (Chill, Easy, Hard)
            # So 1 of each style per days is 3 routes.
            routes_to_insert.append(generate_route(d, style, days))

print(f"Generated {len(routes_to_insert)} routes.")

# Save locally
with open("/workspace/Balidreamphoto-/data/multiday_routes.json", "w", encoding="utf-8") as f:
    json.dump(routes_to_insert, f, ensure_ascii=False, indent=2)

# Insert into Supabase
req = urllib.request.Request(
    f"{SUPABASE_URL}/routes",
    data=json.dumps(routes_to_insert).encode("utf-8"),
    headers={
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON,
        "Authorization": f"Bearer {SUPABASE_ANON}",
        "Prefer": "return=minimal"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Supabase status: {response.status}")
        print("Successfully injected into Supabase!")
except urllib.error.HTTPError as e:
    print(f"Supabase HTTP Error: {e.code} {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")

