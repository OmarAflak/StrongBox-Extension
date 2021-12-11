function getProfile() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["profile"], result => {
            resolve(result.profile)
        })
    })
}

function setProfile(profile) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({profile}, () => {
            resolve(profile)
        })
    })
}

function getAccountForUrl(profile, password, url) {
    return fetch("http://localhost:8000/account", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile,
            password,
            url
        })
    })
    .then(response => response.json())
}

function createAccount(url, usernameSelector, passwordSelector, usernameValue, passwordValue) {
    return fetch("http://localhost:8000/account/new", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "website": {
                url
            },
            "username": {
                "selector": usernameSelector,
                "value": usernameValue
            },
            "password": {
                "selector": passwordSelector,
                "value": passwordValue
            }
        })
    })
}

window.onload = () => {
    document.addEventListener("keypress", event => {
        if (event.key === "p" && event.ctrlKey) {
            getProfile()
            .then(profile => {
                if (typeof profile === "undefined") {
                    profile = window.prompt("profile", "")
                    return setProfile(profile)
                }
                return profile
            })
            .then(profile => {
                const password = window.prompt("password", "")
                getAccountForUrl(profile, password, window.location.href)
                .then(account => {
                    document.querySelector(account.username.selector).value = account.username.value
                    document.querySelector(account.password.selector).value = account.password.value
                })
                .catch(console.error)
            })
        }
    })
}