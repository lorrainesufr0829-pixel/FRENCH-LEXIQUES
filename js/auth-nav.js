// =====================================
// LEXIQUE — Account status in the header
// =====================================
(function initLexiqueAccountNav() {
    const header = document.querySelector(".site-header");
    if (!header || !window.lexiqueAuth) return;

    const oldNavItem = document.querySelector('.main-navigation a[href="auth.html"]');
    if (oldNavItem) oldNavItem.closest("li")?.remove();

    const accountControl = document.createElement("div");
    accountControl.className = "account-nav";
    accountControl.setAttribute("aria-live", "polite");
    header.appendChild(accountControl);

    function renderSignedOut() {
        accountControl.innerHTML = '<a class="account-login" href="auth.html">LOG IN / SIGN UP</a>';
    }

    function renderSignedIn(user) {
        const email = user?.email || "Signed in";
        accountControl.innerHTML = `
            <span class="account-signed-in" title="${email}" aria-label="Signed in">
                <span class="account-check" aria-hidden="true">✓</span>
                <span class="account-label">SIGNED IN</span>
            </span>
            <button class="account-logout" type="button">LOG OUT</button>
        `;
        accountControl.querySelector(".account-logout").addEventListener("click", async () => {
            const button = accountControl.querySelector(".account-logout");
            button.disabled = true;
            button.textContent = "LOGGING OUT…";
            const { error } = await window.lexiqueAuth.signOut();
            if (error) {
                button.disabled = false;
                button.textContent = "LOG OUT";
                console.error("LEXIQUE logout failed:", error);
                return;
            }
            window.location.href = "index.html";
        });
    }

    async function refreshAccountStatus() {
        try {
            const { data, error } = await window.lexiqueAuth.getSession();
            if (error || !data?.session?.user) {
                renderSignedOut();
                return;
            }
            renderSignedIn(data.session.user);
        } catch (error) {
            console.error("Unable to read LEXIQUE account status:", error);
            renderSignedOut();
        }
    }

    refreshAccountStatus();
    window.lexiqueAuth.onAuthStateChange((_event, session) => {
        if (session?.user) renderSignedIn(session.user);
        else renderSignedOut();
    });
})();
