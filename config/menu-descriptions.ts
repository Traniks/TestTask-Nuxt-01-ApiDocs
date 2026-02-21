/**
 * Краткие описания для меню документации (рус.).
 * Ключи — точные url_name из API. Приоритет: сначала здесь, если нет — summary из API (англ.).
 */

export const sectionDescriptions: Record<string, string> = {
  address_hints: 'Подсказки по адресам и геолокации',
  auth: 'Авторизация и OTP',
  misc: 'Разное: рассылки, капча, контакты',
  products: 'Товары и каталог',
  products_view_feedbacks: 'Отзывы и рейтинги товаров',
  manufactures: 'Производители',
  stores: 'Магазины',
  catalog: 'Каталог категорий',
  cart_guest: 'Корзина (гость)',
  sellers_get: 'Продавцы',
}

export const endpointDescriptions: Record<string, string> = {
  auth_new_otp_request: 'Запрос нового OTP-кода для регистрации или входа',
  auth_signin_signup: 'Вход и регистрация в магазине',
  address_hints_region_search: 'Поиск подсказок по региону',
  address_hints_suggest: 'Подсказка по введённому адресу',
  address_hints_suggest_city: 'Подсказка по городу',
  address_hints_suggest_location: 'Поиск по местоположению пользователя',
  misc_unsubscribe: 'Массовая отписка по токену',
  misc_captcha: 'Получение капчи для формы',
  misc_contact: 'Форма обратной связи',
  products_search: 'Поиск товаров по запросу',
  products_preview: 'Превью товара по ID',
  products_request_secondary_variants: 'Вторичные варианты по основному',
  products_request_variants_filters: 'Фильтры вариантов товара',
  products_view_feedbacks_feedback_get: 'Получение отзывов',
  products_view_feedbacks_stats_get: 'Статистика по отзыву',
  products_view_feedbacks_images_get: 'Изображения отзывов по товару',
  manufactures_manufactures_list_get: 'Список производителей',
  manufactures_manufactures_get: 'Данные производителя',
  stores_get: 'Основная информация о магазине',
  catalog_load: 'Публичный каталог категорий',
  cart_guest_modal_get: 'Корзина для модального окна',
  cart_guest_get: 'Получение корзины',
  cart_guest_first_set: 'Добавление товара в корзину',
  cart_guest_clean: 'Очистка корзины',
  cart_guest_remove_by_cart_item: 'Удаление позиции из корзины',
  sellers_get: 'Список продавцов',
}
