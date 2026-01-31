import {expect, Page} from '@playwright/test';

export default class MainPage {

    private readonly page: Page;

    locators = {
        headerNavigation: 'data-test-id=pageHeaderNavigationDesktop.navigationWrapper',
        navigationTabs: 'data-test-id=pageHeaderNavigation.item',
        colorElement: 'data-test-id=pageHeaderNavigation.colorElement',
        calendarDays: 'data-test-id=horizontalCalendar.day',
        calendarControlRight: 'data-test-id=repertoryActors.controlRight',
        calendarControlLeft: 'data-test-id=repertoryActors.controlLeft',
        featuredSlickTrack: '[data-test-id="featured.sliderContainer"] .slick-track',
        bannerControlLeft: 'data-test-id=featured.sliderPrevButton',
        bannerControlRight: 'data-test-id=featured.sliderNextButton',
        eventsFeedTitle: 'data-test-id=eventsFeed.title',
        eventsFeedArrow: 'data-test-id=eventsFeed.arrow',
        eventCardRoot: 'data-test-id=eventCard.root',
        eventCardTitle: 'data-test-id=eventCard.eventInfoTitle',
        eventCardDetails: 'data-test-id=eventCard.eventInfoDetails',
        eventCardFavorite: 'data-test-id=event-card-favourite-button',
        plusCashbackBadge: 'data-test-id=plusCashbackBadge.item',
        eventCardRating: '[data-test-id*="rating"]',
        eventCardLink: 'data-test-id=eventCard.link',
        topEventsWrapper: '[data-test-id="topEvents.wrapper"]',
        topEventsContainer: '[data-test-id="topEvents.eventContainer"]',
        topEventCard: '[class*="p8csoW"]',
        topCardNumberImage: '[data-test-id="topCard.numberImage"]',
        topCardPoster: '[data-test-id="topCard.eventImage"]',
        topCardTitle: '[data-test-id="topCard.title"]',
        topCardRubricTag: '[data-test-id="topCard.rubricTag"]',
        topCardDate: '[data-test-id="topCard.date"]',
        viewedBlock: '.IMCiK8',
        viewedCard: '.z2H_NI',
        viewedCardTitle: 'h3.zLWwiG',
        selectionPageTitle: 'data-test-id=selectionPage.selectionPageHeader.title',
    }

    constructor(page: Page) {
        this.page = page;
    }

    public async open(city: string = 'moscow'): Promise<void> {
        await this.page.goto(`/${city}`, {waitUntil: 'load'});
    }

    public async scrollToEventByTitle(titleText: string): Promise<void> {
        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: titleText});
        await titleLocator.waitFor({state: 'attached'});
        await titleLocator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
    }

    public async scrollToTopBlock(): Promise<void> {
        const topBlock = this.page.locator(this.locators.topEventsWrapper);
        await topBlock.waitFor({state: 'attached'});
        await topBlock.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
    }

    public async assertHeaderNavigation(value: string, expectedIndex: number): Promise<void> {
        const navigationList = this.page.locator(this.locators.headerNavigation);
        await navigationList.waitFor({state: 'visible'});

        const navigationItems = navigationList.locator(this.locators.navigationTabs);

        const actualText = await navigationItems.nth(expectedIndex).textContent();
        const trimmedText = actualText?.trim() || '';

        expect(trimmedText.toLowerCase()).toBe(value.toLowerCase());
    }

    public async assertNavigationItemHoverEffect(value: string): Promise<void> {
        const navigationList = this.page.locator(this.locators.headerNavigation);
        const navigationItem = navigationList.locator(this.locators.navigationTabs)
            .filter({hasText: value});

        const item = navigationItem.first();
        await item.waitFor({state: 'visible'});

        const colorElement = item.locator(this.locators.colorElement);

        const initialBgColor = await colorElement.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );

        await colorElement.hover();
        await this.page.waitForTimeout(300);

        const hoverBgColor = await colorElement.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(hoverBgColor).not.toBe(initialBgColor);
        expect(hoverBgColor).not.toBe('rgba(0, 0, 0, 0)');
    }

    public async getVisibleCalendarDays(): Promise<string[]> {
        const days = this.page.locator(this.locators.calendarDays);
        const count = await days.count();
        const visibleDays: string[] = [];
        for (let i = 0; i < count; i++) {
            const dayElement = days.nth(i);
            const isInViewport = await dayElement.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= window.innerHeight &&
                    rect.right <= window.innerWidth &&
                    rect.width > 0 &&
                    rect.height > 0
                );
            });

            if (isInViewport) {
                const day = await dayElement.getAttribute('data-test-day');
                const month = await dayElement.getAttribute('data-test-month');
                if (day && month) {
                    visibleDays.push(`${day}.${month}`);
                }
            }
        }
        return visibleDays;
    }


    public async scrollCalendar(direction: 'влево' | 'вправо'): Promise<void> {
        const buttonLocator = direction === 'вправо'
            ? this.locators.calendarControlRight
            : this.locators.calendarControlLeft;

        const button = this.page.locator(buttonLocator);
        await button.waitFor({state: 'visible'});
        await button.click();
        await this.page.waitForTimeout(500);
    }

    public async assertCalendarDaysChanged(daysBefore: string[], daysAfter: string[]): Promise<void> {
        const firstDayChanged = daysBefore[0] !== daysAfter[0];
        expect(firstDayChanged).toBeTruthy();
    }

    public async getBannerSliderPosition(): Promise<string> {
        const slickTrack = this.page.locator(this.locators.featuredSlickTrack);
        await slickTrack.waitFor({state: 'visible'});

        const transform = await slickTrack.evaluate((el) => {
            return window.getComputedStyle(el).transform;
        });
        return transform;
    }

    public async scrollBanner(direction: 'влево' | 'вправо'): Promise<void> {
        const buttonLocator = direction === 'вправо'
            ? this.locators.bannerControlRight
            : this.locators.bannerControlLeft;

        const button = this.page.locator(buttonLocator);
        await button.waitFor({state: 'visible'});
        await button.click({force: false});
        await this.page.waitForTimeout(1000);
    }

    public async assertBannerPositionChanged(positionBefore: string, positionAfter: string): Promise<void> {
        expect(positionAfter).not.toBe(positionBefore);
        expect(positionAfter).not.toBe('none');
    }

    public async assertFeedTitleHoverColor(titleText: string): Promise<void> {
        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: titleText});
        await titleLocator.waitFor({state: 'visible'});
        const titleLink = titleLocator.locator('..');
        const arrow = titleLink.locator(this.locators.eventsFeedArrow);
        const initialStroke = await arrow.evaluate(el =>
            window.getComputedStyle(el).stroke || window.getComputedStyle(el).color
        );
        await titleLink.hover();
        await this.page.waitForTimeout(300);
        const hoverStroke = await arrow.evaluate(el =>
            window.getComputedStyle(el).stroke || window.getComputedStyle(el).color
        );
        expect(hoverStroke).not.toBe(initialStroke);
    }

    public async assertFeedCardsLayout(titleText: string, columnsCount: number): Promise<void> {
        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: titleText});
        await titleLocator.waitFor({state: 'visible'});
        const cardsContainer = titleLocator.locator('xpath=following::div[@data-test-id="eventsFeed.eventsFeedList"]').first();
        await cardsContainer.waitFor({state: 'visible'});
        const style = await cardsContainer.getAttribute('style');
        expect(style).toContain(`--events-count: ${columnsCount}`);
    }

    public async assertEventCardHasAllElements(
        titleText: string,
        cardIndex: number = 0
    ): Promise<void> {
        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: titleText});
        await titleLocator.waitFor({state: 'visible', timeout: 5000});
        const feedContainer = titleLocator.locator('xpath=ancestor::div[contains(@class, "iHSQLP")]');
        const cardsContainer = feedContainer.locator('[data-test-id="eventsFeed.eventsFeedList"]');
        const card = cardsContainer.locator('[data-test-id="eventCard.root"]').nth(cardIndex);
        await card.waitFor({state: 'visible', timeout: 5000});
        const poster = card.locator('img.jYbobS');
        await expect(poster).toBeVisible();
        const title = card.locator(this.locators.eventCardTitle);
        await expect(title).toBeVisible();
        const favorite = card.locator(this.locators.eventCardFavorite);
        await expect(favorite).toBeVisible();
        const details = card.locator(this.locators.eventCardDetails);
        await expect(details).toBeVisible();
        const priceLocator = card.locator('[data-test-id="eventCard.price"], [data-test-id="eventCover.scheduleLink"]');
        const hasPriceElement = await priceLocator.count() > 0;
        if (hasPriceElement) {
            await expect(priceLocator.first()).toBeVisible();
        }
        const cashback = card.locator(this.locators.plusCashbackBadge);
        const hasCashback = await cashback.count() > 0;
        if (hasCashback) {
            await expect(cashback).toBeVisible();
        }
        const rating = card.locator(this.locators.eventCardRating);
        const hasRating = await rating.count() > 0;
        if (hasRating) {
            await expect(rating).toBeVisible();
        }
    }

    public async assertTopBlockCardsCount(expectedCount: number): Promise<void> {
        const container = this.page.locator(this.locators.topEventsContainer);
        await container.waitFor({state: 'visible'});

        const cards = container.locator(this.locators.topEventCard);
        const actualCount = await cards.count();

        expect(actualCount).toBe(expectedCount);
    }

    public async scrollTopBlock(direction: 'влево' | 'вправо'): Promise<void> {
        const container = this.page.locator(this.locators.topEventsContainer);
        await container.waitFor({state: 'visible'});
        await container.hover();

        const buttonClass = direction === 'вправо' ? '.qb30XR' : '.BDd2ZV';
        const button = this.page.locator(`button${buttonClass}`);

        try {
            await button.waitFor({state: 'attached'});
            await button.evaluate((btn: HTMLElement) => {
                btn.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
            });
        } catch (error) {
            if (direction === 'вправо') {
                await this.page.keyboard.press('ArrowRight');
            } else {
                await this.page.keyboard.press('ArrowLeft');
            }
        }
        await this.page.waitForTimeout(800);
    }

    public async getTopCardsPositions(): Promise<number[]> {
        const container = this.page.locator(this.locators.topEventsContainer);
        const cards = container.locator(this.locators.topEventCard);

        const count = await cards.count();
        const positions: number[] = [];

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const box = await card.boundingBox();
            if (box) {
                positions.push(box.x);
            }
        }
        return positions;
    }

    public async compareTopCardsPositions(
        positionsBefore: number[],
        positionsAfter: number[],
        direction: 'вправо' | 'влево'
    ): Promise<void> {
        expect(positionsBefore.length).toBeGreaterThan(0);
        expect(positionsAfter.length).toBeGreaterThan(0);

        if (direction === 'вправо') {
            const shifted = positionsAfter.some((pos, idx) =>
                idx < positionsBefore.length && pos < positionsBefore[idx]
            );
            expect(shifted).toBeTruthy();
        } else {
            const shifted = positionsAfter.some((pos, idx) =>
                idx < positionsBefore.length && pos > positionsBefore[idx]
            );
            expect(shifted).toBeTruthy();
        }
    }

    public async assertTopCardHasAllElements(cardIndex: number = 0): Promise<void> {
        const container = this.page.locator(this.locators.topEventsContainer);
        const card = container.locator(this.locators.topEventCard).nth(cardIndex);
        await card.waitFor({state: 'visible'});

        const numberImage = card.locator(this.locators.topCardNumberImage);
        await expect(numberImage).toBeVisible();

        const poster = card.locator(this.locators.topCardPoster);
        await expect(poster).toBeVisible();

        const cashback = card.locator(this.locators.plusCashbackBadge);
        await expect(cashback).toBeVisible();

        const title = card.locator(this.locators.topCardTitle);
        await expect(title).toBeVisible();

        const rubric = card.locator(this.locators.topCardRubricTag);
        await expect(rubric).toBeVisible();

        const date = card.locator(this.locators.topCardDate);
        await expect(date).toBeVisible();
    }

    public async assertAllTopCardsHaveElements(): Promise<void> {
        const container = this.page.locator(this.locators.topEventsContainer);
        const cards = container.locator(this.locators.topEventCard);
        const count = await cards.count();

        for (let i = 0; i < count; i++) {
            await this.assertTopCardHasAllElements(i);
        }
    }

    public async getAllFeedTitles(): Promise<string[]> {
        const mainFeed = this.page.locator('.vM97Px.tj15kA').first();
        await mainFeed.waitFor({state: 'visible', timeout: 10000});
        const titleLocators = mainFeed.locator(this.locators.eventsFeedTitle);
        try {
            await titleLocators.first().waitFor({state: 'visible'});
        } catch (error) {
            return [];
        }
        await this.page.waitForTimeout(1000);

        const count = await titleLocators.count();

        const titles: string[] = [];

        for (let i = 0; i < count; i++) {
            const titleElement = titleLocators.nth(i);
            const titleText = await titleElement.textContent();
            if (titleText) {
                const cleanTitle = titleText
                    .trim()
                    .replace(/\u00A0/g, ' ')
                    .replace(/\s+/g, ' ');
                if (cleanTitle.length > 0) {
                    titles.push(cleanTitle);
                }
            }
        }
        return titles;
    }


    public async clickOnFeedTitle(titleText: string): Promise<void> {
        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: titleText});
        await titleLocator.waitFor({state: 'visible'});

        const link = titleLocator.locator('xpath=ancestor::a');
        await link.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    public async assertUrlChanged(initialUrl: string): Promise<void> {
        const currentUrl = this.page.url();
        expect(currentUrl).not.toBe(initialUrl);
    }

    public async assertSelectionPageTitle(feedTitle: string): Promise<void> {
        const pageTitle = this.page.locator(this.locators.selectionPageTitle);
        await pageTitle.waitFor({state: 'visible'});

        const actualTitle = await pageTitle.textContent();

        if (!actualTitle) {
            throw new Error('Заголовок страницы не найден');
        }

        const cleanActualTitle = actualTitle.trim();

        const match = cleanActualTitle.includes(feedTitle) || feedTitle.includes(cleanActualTitle);

        expect(match).toBeTruthy();
    }

    public async assertFeedNavigationWorks(feedTitle: string): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');
        const initialUrl = this.page.url();

        await this.clickOnFeedTitle(feedTitle);
        await this.assertUrlChanged(initialUrl);
        await this.assertSelectionPageTitle(feedTitle);

        await this.open('moscow');
    }

    public async checkAllFeedNavigations(feedTitles: string[]): Promise<void> {
        let checkedCount = 0;

        for (const feedTitle of feedTitles) {
            await this.assertFeedNavigationWorks(feedTitle);
            checkedCount++;
        }
        expect(checkedCount).toBeGreaterThan(0);
    }

    public getRandomTitles(titles: string[], count: number): string[] {
        const shuffled = [...titles].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    public async clickRandomCardInFeed(feedTitle: string): Promise<string> {
        await this.scrollToEventByTitle(feedTitle);

        const titleLocator = this.page.locator(this.locators.eventsFeedTitle, {hasText: feedTitle});
        const feedContainer = titleLocator.locator('xpath=ancestor::div[contains(@class, "iHSQLP")]');
        const cardsContainer = feedContainer.locator('[data-test-id="eventsFeed.eventsFeedList"]');
        const cards = cardsContainer.locator(this.locators.eventCardRoot);

        await cards.first().waitFor({state: 'attached', timeout: 10000});

        const cardsCount = await cards.count();

        const randomIndex = Math.floor(Math.random() * Math.min(cardsCount, 3));
        const randomCard = cards.nth(randomIndex);

        await randomCard.scrollIntoViewIfNeeded();

        const eventTitleElement = randomCard.locator(this.locators.eventCardTitle);
        await eventTitleElement.waitFor({state: 'attached'});
        const eventTitle = await eventTitleElement.textContent();
        const cleanEventTitle = eventTitle?.trim() || '';

        const cardLink = randomCard.locator(this.locators.eventCardLink);
        const href = await cardLink.getAttribute('href');

        await this.page.goto(`https://afisha.yandex.ru${href}`, {
            waitUntil: 'domcontentloaded',
        });
        return cleanEventTitle;
    }

    public async viewRandomCards(feedTitles: string[]): Promise<string[]> {
        const viewedEventTitles: string[] = [];

        for (let i = 0; i < feedTitles.length; i++) {
            const feedTitle = feedTitles[i];
            await this.open('moscow');
            const eventTitle = await this.clickRandomCardInFeed(feedTitle);
            viewedEventTitles.push(eventTitle);
        }
        return viewedEventTitles;
    }

    public async scrollToViewedBlock(): Promise<void> {
        const viewedBlock = this.page.locator(this.locators.viewedBlock).filter({hasText: 'Вы смотрели'});
        await viewedBlock.waitFor({state: 'attached'});
        await viewedBlock.scrollIntoViewIfNeeded();
    }

    public async getViewedEventsTitles(): Promise<string[]> {
        await this.scrollToViewedBlock();

        const viewedBlock = this.page.locator(this.locators.viewedBlock).filter({hasText: 'Вы смотрели'});
        const cards = viewedBlock.locator(this.locators.viewedCard);

        const count = await cards.count();
        const titles: string[] = [];

        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            const titleElement = card.locator(this.locators.viewedCardTitle);
            const titleText = await titleElement.textContent();

            if (titleText) {
                titles.push(titleText.trim());
            }
        }
        return titles;
    }

    public async assertViewedEventsMatch(expectedTitles: string[]): Promise<void> {
        expect(expectedTitles.length).toBeGreaterThan(0);
        const actualTitles = await this.getViewedEventsTitles();
        for (const expectedTitle of expectedTitles) {
            const found = actualTitles.some(actualTitle =>
                actualTitle.toLowerCase().includes(expectedTitle.toLowerCase()) ||
                expectedTitle.toLowerCase().includes(actualTitle.toLowerCase())
            );
            expect(found).toBeTruthy();
        }
    }
}