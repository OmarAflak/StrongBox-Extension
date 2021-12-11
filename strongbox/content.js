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

function handleAPIResponse(response) {
    if (response.success) {
        return Promise.resolve(response.data)
    }
    return Promise.reject(response.message)
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
    .then(handleAPIResponse)
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
    .then(response => response.json())
    .then(handleAPIResponse)
}

function zoomInOut(element) {
    element.animate([
        {transform: "scale(1, 1)"},
        {transform: "scale(1.3, 1.3)"},
        {transform: "scale(1, 1)"}
    ], {
        duration: 300,
        iterations: 1,
        "animation-timing-function": "cubic-bezier(0.1, 0.7, 1.0, 0.1)"
    })
}

function setValueAndAnimate(selector, value) {
    const element = document.querySelector(selector)
    element.value = value
    zoomInOut(element)
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
                const password = sha256(window.prompt("password", ""))
                getAccountForUrl(profile, password, window.location.href)
                .then(account => {
                    setValueAndAnimate(account.username.selector, account.username.value)
                    setValueAndAnimate(account.password.selector, account.password.value)
                })
                .catch(console.error)
            })
        }
    })
}