# Изображения услуг и hero (AI-генерация)

Сюда кладём фото для карточек услуг. Карточка сама подхватит файл, если он есть;
пока файла нет — показывается запасной вид (крупная иконка на фирменном градиенте),
сайт не ломается.

## Куда класть и как называть

| Файл                              | Где используется         | Размер (px)   |
|-----------------------------------|--------------------------|---------------|
| `public/services/standard.jpg`    | Стандартная мойка        | 1280 × 800    |
| `public/services/three-phase.jpg` | Трёхфазная мойка         | 1280 × 800    |
| `public/services/premium.jpg`     | Премиум мойка            | 1280 × 800    |
| `public/services/dryclean.jpg`    | Химчистка                | 1280 × 800    |
| `public/services/ceramic.jpg`     | Полировка + керамика     | 1280 × 800    |
| `public/services/underbody.jpg`   | Мойка днища              | 1280 × 800    |
| `public/services/anticor.jpg`     | Антикор днища            | 1280 × 800    |
| `public/hero.jpg`                 | Фон hero (главный экран) | 1920 × 1200   |

- Карточки используют соотношение **16:10** (кадрируй по центру).
- Hero — тёмный/затемнённый кадр (на него ложится тёмный градиент, текст по центру).
- Формат `.jpg`, вес желательно < 300 КБ на карточку, < 500 КБ hero (сожми, напр. squoosh.app).

## Готовые промпты (англ. — лучше работают в генераторах)

Общий стиль (добавляй к каждому):
> dark moody automotive photography, premium car detailing studio, dramatic
> low-key lighting, deep blacks, subtle red accent lighting, shallow depth of
> field, ultra-realistic, 8k, cinematic, no text, no watermark

- **standard.jpg** — `Pressure washing a clean modern car exterior, water spray and foam, glossy paint reflections, side angle, {общий стиль}`
- **three-phase.jpg** — `Car covered in thick white snow-foam during a three-stage wash, foam dripping off glossy paint, {общий стиль}`
- **premium.jpg** — `Detailer polishing a luxury black car body with a microfiber cloth, mirror-like reflection, premium garage, {общий стиль}`
- **dryclean.jpg** — `Interior car detailing, deep cleaning leather seats with a steam/extraction tool, close-up, immaculate cabin, {общий стиль}`
- **ceramic.jpg** — `Applying ceramic coating to a car panel with an applicator, water beading on the hydrophobic surface, glossy finish, {общий стиль}`
- **underbody.jpg** — `High-pressure underbody wash of a car on a lift, water jets removing dirt and salt, {общий стиль}`
- **anticor.jpg** — `Anti-corrosion coating being sprayed onto a car underbody, protective black coating, workshop lift, {общий стиль}`
- **hero.jpg** — `Wide cinematic shot of a pristine premium car in a dark detailing studio, dramatic rim lighting with a subtle red glow, lots of dark negative space at the top for a headline, {общий стиль}`

> После генерации сожми и положи файлы с указанными именами — на сайте обновится сразу.
