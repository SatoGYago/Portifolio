const startupAnimation = document.querySelector("#startup-animation");
const startupSkipButton = document.querySelector(".startup-skip");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let startupFinished = false;

function finishStartup() {
    if (startupFinished) return;
    startupFinished = true;
    startupAnimation.classList.add("leaving");
    startupAnimation.setAttribute("aria-hidden", "true");
    document.body.classList.remove("system-starting");

    window.setTimeout(() => startupAnimation.remove(), reduceMotion ? 120 : 700);
}

const welcomeDelay = reduceMotion ? 250 : 2800;
const finishDelay = reduceMotion ? 650 : 4400;
window.setTimeout(() => startupAnimation.classList.add("welcome"), welcomeDelay);
window.setTimeout(finishStartup, finishDelay);

startupSkipButton.addEventListener("click", finishStartup);
document.addEventListener("keydown", (event) => {
    if (!startupFinished && ["Escape", "Enter", " "].includes(event.key)) {
        finishStartup();
    }
});

const startButton = document.querySelector("#start-button")
const startMenu = document.querySelector("#start-menu")

function setStartMenuOpen(isOpen) {
    startMenu.classList.toggle("open", isOpen);
    startButton.setAttribute("aria-expanded", String(isOpen));
}

startButton.addEventListener("click", () => {
    setStartMenuOpen(!startMenu.classList.contains("open"));
});

document.addEventListener("click", (event) => {
    if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
        setStartMenuOpen(false);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && startMenu.classList.contains("open")) {
        setStartMenuOpen(false);
        startButton.focus();
    }
});

startMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setStartMenuOpen(false);
});

const taskbarApps = document.querySelector("#taskbar-apps");
let highestWindowLayer = 10;

function getTaskbarButton(windowElement) {
    return taskbarApps.querySelector(`[data-taskbar-window="${windowElement.id}"]`);
}

function createTaskbarButton(windowElement) {
    const existingButton = getTaskbarButton(windowElement);
    if (existingButton) return existingButton;

    const button = document.createElement("button");
    const windowIcon = windowElement.querySelector(".window-title img");
    const windowTitle = windowElement.querySelector(".window-title span");
    button.type = "button";
    button.className = "taskbar-app";
    button.dataset.taskbarWindow = windowElement.id;

    const icon = document.createElement("img");
    icon.src = windowIcon?.src || "imagens/windows-xp.png";
    icon.alt = "";

    const label = document.createElement("span");
    label.textContent = windowTitle?.textContent || "Aplicativo";

    button.append(icon, label);
    button.addEventListener("click", () => {
        if (windowElement.classList.contains("minimized")) {
            restoreWindow(windowElement);
        } else if (!button.classList.contains("active")) {
            focusWindow(windowElement);
        } else {
            minimizeWindow(windowElement);
        }
    });
    taskbarApps.appendChild(button);
    return button;
}

function focusWindow(windowElement) {
    highestWindowLayer += 1;
    windowElement.style.zIndex = highestWindowLayer;
    document.querySelectorAll(".taskbar-app").forEach((button) => {
        button.classList.toggle("active", button.dataset.taskbarWindow === windowElement.id);
    });
}

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;

    windowElement.classList.add("open");
    windowElement.classList.remove("minimized");
    windowElement.setAttribute("aria-hidden", "false");

    const taskbarButton = createTaskbarButton(windowElement);
    taskbarButton.classList.add("visible");
    focusWindow(windowElement);
    setStartMenuOpen(false);

    if (windowId === "terminal-window") {
        setTimeout(() => document.querySelector("#terminal-input")?.focus(), 0);
    }
}

function minimizeWindow(windowElement) {
    windowElement.classList.remove("open");
    windowElement.classList.add("minimized");
    windowElement.setAttribute("aria-hidden", "true");
    getTaskbarButton(windowElement)?.classList.remove("active");
}

function restoreWindow(windowElement) {
    windowElement.classList.remove("minimized");
    windowElement.classList.add("open");
    windowElement.setAttribute("aria-hidden", "false");
    focusWindow(windowElement);
}

function closeWindow(windowElement) {
    windowElement.classList.remove("open", "minimized", "maximized");
    windowElement.setAttribute("aria-hidden", "true");
    getTaskbarButton(windowElement)?.classList.remove("visible", "active");

    const maximizeButton = windowElement.querySelector('[data-window-action="maximize"]');
    if (maximizeButton) {
        maximizeButton.textContent = "□";
        maximizeButton.setAttribute("aria-label", "Maximizar");
    }
}

document.addEventListener("click", (event) => {
    const windowTrigger = event.target.closest("[data-window]");
    if (windowTrigger) openWindow(windowTrigger.dataset.window);

    const control = event.target.closest("[data-window-action]");
    if (!control) return;

    const windowElement = control.closest(".window");
    const action = control.dataset.windowAction;

    if (action === "minimize") minimizeWindow(windowElement);
    if (action === "maximize") {
        windowElement.classList.toggle("maximized");
        control.textContent = windowElement.classList.contains("maximized") ? "❐" : "□";
        control.setAttribute("aria-label", windowElement.classList.contains("maximized") ? "Restaurar" : "Maximizar");
    }
    if (action === "close") closeWindow(windowElement);
});

document.querySelectorAll(".window").forEach((windowElement) => {
    windowElement.addEventListener("pointerdown", () => focusWindow(windowElement));
});

const browserPage = document.querySelector("#browser-page");
const browserAddressForm = document.querySelector("#browser-address-form");
const browserAddressInput = document.querySelector("#browser-address-input");

function visitBrowserSection(sectionName) {
    const routes = {
        inicio: "inicio",
        home: "inicio",
        sobre: "sobre",
        projetos: "projetos"
    };
    const route = routes[sectionName.toLowerCase()] || "inicio";
    document.getElementById(route)?.scrollIntoView({ behavior: "smooth", block: "start" });
    browserAddressInput.value = `https://yago.dev/${route}`;
}

browserAddressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const route = browserAddressInput.value.split("/").filter(Boolean).pop() || "inicio";
    visitBrowserSection(route);
});

document.querySelector("[data-browser-action='home']").addEventListener("click", () => visitBrowserSection("inicio"));
document.querySelector("[data-browser-action='refresh']").addEventListener("click", () => {
    browserPage.classList.remove("browser-refreshed");
    requestAnimationFrame(() => browserPage.classList.add("browser-refreshed"));
});

browserPage.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    event.preventDefault();
    visitBrowserSection(link.getAttribute("href").slice(1));
});

const explorerAddress = document.querySelector("#explorer-address-value");
const explorerStatus = document.querySelector("#explorer-status");
const explorerBackButton = document.querySelector("[data-explorer-back]");
const explorerNames = {
    computer: "Meu Computador",
    projects: "Meu Computador > Meus Projetos",
    documents: "Meu Computador > Meus Documentos",
    pictures: "Meu Computador > Minhas Imagens",
    "project-detail": "Meu Computador > Meus Projetos"
};

function showExplorerView(viewName) {
    const targetView = document.querySelector(`[data-explorer-page="${viewName}"]`);
    if (!targetView) return;

    document.querySelectorAll("[data-explorer-page]").forEach((view) => {
        view.classList.toggle("active", view === targetView);
    });
    explorerAddress.textContent = explorerNames[viewName] || "Meu Computador";
    explorerStatus.textContent = `${targetView.querySelectorAll(":scope .explorer-items > button").length} objetos`;
    explorerBackButton.disabled = viewName === "computer";
}

document.addEventListener("click", (event) => {
    const explorerTrigger = event.target.closest("[data-explorer-view]");
    if (explorerTrigger) showExplorerView(explorerTrigger.dataset.explorerView);
});

explorerBackButton.addEventListener("click", () => showExplorerView("computer"));

const projectDetails = {
    delivery: ["Projeto Delivery", "Aplicação voltada ao fluxo e acompanhamento de entregas.", "Python, Django, HTML e CSS"],
    tasks: ["Task Tracker", "Aplicação para organizar tarefas e acompanhar atividades.", "HTML, CSS e JavaScript"],
    django: ["Projeto Django", "Projeto web desenvolvido para praticar aplicações com back-end em Python.", "Python, Django e banco de dados"],
    portfolio: ["Portfólio Windows XP", "Este portfólio pessoal inspirado na interface Luna Blue do Windows XP.", "HTML, CSS, JavaScript e Bootstrap"]
};

document.querySelector(".project-items").addEventListener("click", (event) => {
    const projectButton = event.target.closest("[data-project]");
    if (!projectButton) return;

    const [title, description, technologies] = projectDetails[projectButton.dataset.project];
    document.querySelector("#project-detail-title").textContent = title;
    document.querySelector("#project-detail-description").textContent = description;
    document.querySelector("#project-detail-technologies").textContent = technologies;
    showExplorerView("project-detail");
});

const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");
const terminalOutput = document.querySelector("#terminal-output");

function writeTerminal(text = "") {
    const line = document.createElement("div");
    line.textContent = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

const terminalCommands = {
    help() {
        writeTerminal("Comandos: help, about, projects, skills, contact, github, linkedin, clear, exit");
    },
    about() {
        writeTerminal("Yago — estudante e desenvolvedor interessado em aplicações web e interfaces criativas.");
    },
    projects() {
        openWindow("computer-window");
        showExplorerView("projects");
        writeTerminal("Abrindo Meu Computador > Meus Projetos...");
    },
    skills() {
        writeTerminal("HTML | CSS | JavaScript | Python | Bootstrap | Django | Git");
        openWindow("control-panel-window");
    },
    contact() {
        writeTerminal("Entre em contato pelo LinkedIn ou GitHub disponíveis no Menu Iniciar.");
    },
    github() {
        writeTerminal("Abrindo GitHub...");
        window.open("https://github.com/SatoGYago", "_blank", "noopener");
    },
    linkedin() {
        writeTerminal("Abra o LinkedIn pelo Menu Iniciar para acessar o perfil profissional.");
    },
    clear() {
        terminalOutput.replaceChildren();
    },
    exit() {
        closeWindow(document.querySelector("#terminal-window"));
    }
};

terminalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = terminalInput.value.trim().toLowerCase();
    writeTerminal(`C:\\Documents and Settings\\Yago> ${terminalInput.value}`);
    terminalInput.value = "";

    if (!command) return;
    if (terminalCommands[command]) terminalCommands[command]();
    else writeTerminal(`'${command}' não é reconhecido como um comando. Digite help.`);
});

function setClock()
{
    let clock = document.getElementById("clock");
    let time = new Date()
    let hour = time.getHours();
    let minute = time.getMinutes();

    if(hour < 10)
        {
            hour = "0" + hour
        }
        
        if(minute < 10)
        {
            minute = "0" + minute
        }

    clock.textContent = `${hour}:${minute}`
}

setClock();
setInterval(setClock, 1000);
