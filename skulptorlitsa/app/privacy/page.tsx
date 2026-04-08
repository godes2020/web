import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | Скульптор Лица',
};

export default function PrivacyPage() {
  return (
    <main className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Политика конфиденциальности</h1>

        <div className="bg-white rounded-[20px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] space-y-6 text-[#0b140c] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Общие положения</h2>
            <p>
              Настоящая политика конфиденциальности (далее — «Политика») определяет порядок обработки
              и защиты персональных данных пользователей сайта skulptorlitsa.ru (далее — «Сайт»),
              принадлежащего Анне Артемьевой (далее — «Оператор»).
            </p>
            <p className="mt-3">
              Обработка персональных данных осуществляется в соответствии с Федеральным законом
              от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Какие данные мы собираем</h2>
            <ul className="list-disc list-inside space-y-2 text-[#0b140c]">
              <li>Имя и фамилия</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Данные профиля ВКонтакте (при авторизации через ВК)</li>
              <li>Технические данные (IP-адрес, тип браузера, cookies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Цели обработки данных</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Предоставление доступа к курсам и материалам</li>
              <li>Отправка информационных и рекламных рассылок (с согласия пользователя)</li>
              <li>Техническая поддержка</li>
              <li>Улучшение качества сервиса</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Хранение и защита данных</h2>
            <p>
              Персональные данные хранятся на серверах, расположенных на территории Российской Федерации.
              Мы применяем технические и организационные меры для защиты данных от несанкционированного доступа.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Права пользователей</h2>
            <p>Вы вправе:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Получить информацию о хранящихся данных</li>
              <li>Запросить изменение или удаление данных</li>
              <li>Отозвать согласие на обработку данных</li>
              <li>Отписаться от рассылок в любой момент</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Cookies</h2>
            <p>
              Сайт использует cookies для обеспечения корректной работы сервиса и анализа посещаемости.
              Вы можете отключить cookies в настройках браузера, однако это может повлиять на работу сайта.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Контакты</h2>
            <p>
              По вопросам обработки персональных данных обращайтесь по адресу:{' '}
              <a href="mailto:privacy@skulptorlitsa.ru" className="text-[#33783e] underline">
                privacy@skulptorlitsa.ru
              </a>
            </p>
          </section>

          <p className="text-[#666] text-sm border-t border-[#ead4a1] pt-4">
            Последнее обновление: апрель 2026 г.
          </p>
        </div>
      </div>
    </main>
  );
}
