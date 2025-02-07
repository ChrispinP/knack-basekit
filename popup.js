console.log("This is a Knice popup!")

const buildUrl = (appName, appSlug, sceneKey, viewId) => {
    return `https://builder.knack.com/atd/${appSlug}/pages/${sceneKey}/views/${viewId}/form/emails`;
};

const hasEmails = view => Boolean(view.attributes?.rules?.emails?.length);

const getEmailUrls = models => {
    const appAttributes = Knack.app.attributes;
    const { name: appName, slug: appSlug } = appAttributes;

    return models.reduce((acc, model) => {
        const foundView = model.views.models.find(hasEmails);
        
        if (foundView) {
            const url = buildUrl(appName, appSlug, foundView.attributes.scene.key, foundView.id);
            acc.push(url);
        }

        return acc;
    }, []);
};

const emails = getEmailUrls(Knack.scenes.models);
console.table(emails);
