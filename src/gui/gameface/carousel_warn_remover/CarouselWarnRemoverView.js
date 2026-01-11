let domObserver = new MutationObserver(() => {
    // div:first-child is container for background images
    // div:nth-child(2) may have a little obfuscated "dimmed" class that dims vehicle icon
    document.querySelectorAll(
        'div.vehicle-card[data-name="Slot"] div[data-name="Content"] > div:first-child > div:nth-child(2)'
    ).forEach((backgroundElement) => {
        let dimmedClassName = Array
            .from(backgroundElement.classList)
            .find(className => className.indexOf("dimmed") !== -1);

        if (dimmedClassName !== undefined) {
            backgroundElement.classList.remove(dimmedClassName);
        }
    });
    
    // first div:nth-child(2) is vehicle card that contains info; it is on background
    // second div:nth-child(2) is (if present) an overlay that dims background
    document.querySelectorAll(
        'div.vehicle-card[data-name="Slot"] div[data-name="Content"] > div:nth-child(2) > div:nth-child(2)'
    ).forEach((overlayEl) => {
        // we want to remove background image that dims and display lines on entire card
        overlayEl.style.backgroundImage = "none";

        // remove FormatText that displays warn text covering tank name
        overlayEl.querySelectorAll("div > span").forEach((spanEl) => {
            spanEl.remove();
        });
    });

    // add simple small background rectangle behind icon to make icon easier to read
    document.querySelectorAll(
        'div.vehicle-card[data-name="Slot"] div[data-name="Content"] > div:nth-child(2) > div:nth-child(2) > div > div'
    ).forEach((alertIconEl) => {
        alertIconEl.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        alertIconEl.style.borderRadius = "10px";
    });
});

domObserver.observe(document.body, { childList: true, subtree: true });
