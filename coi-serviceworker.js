/*! coi-serviceworker v0.1.7 | MIT License | https://github.com/gzguidoti/coi-serviceworker */
const coepCredentialless = false;

if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (event) => {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }

        let request = r;
        if (coepCredentialless && r.mode === "no-cors") {
            request = new Request(r, { credentials: "omit" });
        }

        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        const script = document.currentScript;
        const reload = () => {
            window.location.reload();
        };

        if (window.isSecureContext) {
            navigator.serviceWorker.register(script.src).then(
                (registration) => {
                    registration.addEventListener("updatefound", () => {
                        registration.installing.addEventListener("statechange", (event) => {
                            if (event.target.state === "activated") {
                                reload();
                            }
                        });
                    });
                },
                (err) => console.error("COI Service Worker register failed: ", err)
            );
        } else {
            console.warn("COI Service Worker requires a secure context (HTTPS/localhost).");
        }
    })();
}
