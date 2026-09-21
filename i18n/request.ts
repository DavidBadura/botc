import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => {
    // Static for now, we'll change this later
    const locale = 'de';

    return {
        locale,
        messages: (await import(`../botc-translations/game/${locale}.json`)).default
    };
});