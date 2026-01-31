import {test} from '@playwright/test';
import MainPage from '../pages/MainPage';

test.describe('Главная страница Яндекс.Афиша. Москва', () => {
    let mainPage: MainPage;
    const itemsHeaderNavigation = [
        'Сертификаты',
        'Концерты',
        'Театр',
        'Детям',
        'Спорт',
        'Стендап',
        'Катки',
        'Выставки',
        'ЕщёКиноПушкинская картаСкидкиЭкскурсииШоуКвестыМюзиклы'
    ];

    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: 1920, height: 1080});
        mainPage = new MainPage(page);
        await mainPage.open('moscow');
    });

    test('Наличие всех основных элементов навигации', async () => {
        for (let i = 0; i < itemsHeaderNavigation.length; i++) {
            await mainPage.assertHeaderNavigation(itemsHeaderNavigation[i], i);
        }
    });

    test('Элементы навигации окрашиваются в серый цвет при наведении', async () => {
        for (let i = 0; i < itemsHeaderNavigation.length; i++) {
            await mainPage.assertNavigationItemHoverEffect(itemsHeaderNavigation[i]);
        }
    });

    test('Календарь скроллится вправо', async () => {
        const daysBefore = await mainPage.getVisibleCalendarDays();
        await mainPage.scrollCalendar('вправо');
        const daysAfter = await mainPage.getVisibleCalendarDays();
        await mainPage.assertCalendarDaysChanged(daysBefore, daysAfter);
    })

    test('Календарь скроллится влево', async () => {
        await mainPage.scrollCalendar('вправо');
        const daysBefore = await mainPage.getVisibleCalendarDays();
        await mainPage.scrollCalendar('влево');
        const daysAfter = await mainPage.getVisibleCalendarDays();
        await mainPage.assertCalendarDaysChanged(daysBefore, daysAfter);
    })

    test('Баннер скроллится вправо', async () => {
        const positionBefore = await mainPage.getBannerSliderPosition();
        await mainPage.scrollBanner('вправо');
        const positionAfter = await mainPage.getBannerSliderPosition();

        await mainPage.assertBannerPositionChanged(positionBefore, positionAfter);
    })

    test('Баннер скроллится влево', async () => {
        const positionBefore = await mainPage.getBannerSliderPosition();
        await mainPage.scrollBanner('влево');
        const positionAfter = await mainPage.getBannerSliderPosition();
        await mainPage.assertBannerPositionChanged(positionBefore, positionAfter);
    })

    test('Заголовок "События в ближайшие дни" окрашивается в красный при наведении', async () => {
        await mainPage.scrollToEventByTitle('События в ближайшие дни');
        await mainPage.assertFeedTitleHoverColor('События в ближайшие дни');
    })

    test('Карточки в "События в ближайшие дни" расположены 3 в ряд', async () => {
        await mainPage.scrollToEventByTitle('События в ближайшие дни');
        await mainPage.assertFeedCardsLayout('События в ближайшие дни', 3);
    });

    test('Карточки из "События в ближайшие дни" содержат все элементы', async () => {
        await mainPage.scrollToEventByTitle('События в ближайшие дни');
        for (let i = 0; i < 3; i++) {
            await mainPage.assertEventCardHasAllElements('События в ближайшие дни', i);
        }
    });

    test('Блок "Топ" содержит 10 карточек', async () => {
        await mainPage.scrollToTopBlock();
        await mainPage.assertTopBlockCardsCount(10);
    });

    test('Подборка "Топ" скроллится вправо', async () => {
        await mainPage.scrollToTopBlock();
        const positionsBefore = await mainPage.getTopCardsPositions();
        await mainPage.scrollTopBlock('вправо');
        const positionsAfter = await mainPage.getTopCardsPositions();
        await mainPage.compareTopCardsPositions(positionsBefore, positionsAfter, 'вправо');
    });

    test('Подборка "Топ" скроллится влево', async () => {
        await mainPage.scrollToTopBlock();
        await mainPage.scrollTopBlock('вправо');
        const positionsBefore = await mainPage.getTopCardsPositions();
        await mainPage.scrollTopBlock('влево');
        const positionsAfter = await mainPage.getTopCardsPositions();
        await mainPage.compareTopCardsPositions(positionsBefore, positionsAfter, 'влево');
    });

    test('Карточки Блока "Топ" содержат элементы', async () => {
        await mainPage.scrollToTopBlock();
        await mainPage.assertAllTopCardsHaveElements();
    });

    test('Карточки в основном фиде расположены 3 в ряд', async () => {
        const allFeedTitles = await mainPage.getAllFeedTitles();
        for (let feedTitle of allFeedTitles) {
            await mainPage.scrollToEventByTitle(feedTitle);
            await mainPage.assertFeedCardsLayout(feedTitle, 3);
        }
    });

    test('Карточки из основного фида содержат все элементы', async () => {
        test.setTimeout(60000);
        const allFeedTitles = await mainPage.getAllFeedTitles();
        for (let feedTitle of allFeedTitles) {
            await mainPage.scrollToEventByTitle(feedTitle);
            for (let i = 0; i < 3; i++) {
                await mainPage.assertEventCardHasAllElements(feedTitle, i);
            }
        }
    });
    test('Контент в табах основного фида соответствуют названию заголовка', async () => {
        test.setTimeout(60000);
        const allFeedTitles = await mainPage.getAllFeedTitles();
        await mainPage.checkAllFeedNavigations(allFeedTitles);
    });

    test('Блок "Вы смотрели" соответствуют просмотренным карточкам', async () => {
        test.setTimeout(60000);
        const countCards = 5;
        const allFeedTitles = await mainPage.getAllFeedTitles();

        const randomFeedTitles = mainPage.getRandomTitles(allFeedTitles, countCards);
        const viewedEventTitles = await mainPage.viewRandomCards(randomFeedTitles);

        await mainPage.open('moscow');
        await mainPage.assertViewedEventsMatch(viewedEventTitles);
    })
});