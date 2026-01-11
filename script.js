function onWindowLoad() {

    chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
            func: init,
        });

    })
}
window.onload = onWindowLoad;


function init() {
    const HOURS_DAY = 8
    const DAYS_WEEK = 5
    // const MONEY_HOUR = 550
    const MONEY_HOUR = 650

    const HOURS_PLAN = HOURS_DAY * 23 // 23 смены в месяц

    createPopup(buildInfoString(parseData()));

    createCheckboxes()
    
    // createProgressBar()

    // Функции
    // function createProgressBar() {

    //     const progressBar = document.createElement('div')
    //     progressBar.classList.add('progress-bar')
    //     progressBar.setAttribute('aria-valuenow', '75')
    //     progressBar.setAttribute('aria-valuemin', '0')
    //     progressBar.setAttribute('aria-valuemax', '100')

    //     document.querySelector('.popup-custom .container').append(progressBar)
    // }

    function createCheckboxes() {
        let trackedTasks = JSON.parse(localStorage.getItem("trackedTasks"));
        if (!trackedTasks) {
            trackedTasks = {}
        }
        const task_links = document.querySelectorAll('.issuekey a[data-issue-key]')
        task_links.forEach(task_link => {
            const issue_key = task_link.getAttribute('data-issue-key')
            if (document.querySelector(`input[data-issue-key=${issue_key}]`)) {
                
                document.querySelector(`input[data-issue-key=${issue_key}]`).remove()
            }
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.setAttribute('data-issue-key', issue_key)

            if (trackedTasks[issue_key]) {
                checkbox.checked = true
                fetchTask(issue_key)
            }

            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    trackedTasks[issue_key] = e.target.checked
                    fetchTask(issue_key)
                } else {
                    delete trackedTasks[issue_key]

                    let savedObjects = JSON.parse(localStorage.getItem("savedObjects"));
                    if (savedObjects && savedObjects[issue_key]) {
                        delete savedObjects[issue_key]
                        createPopup(buildInfoString(savedObjects)); 
                    }
                    
                }
                console.log(trackedTasks)
                localStorage.setItem("trackedTasks", JSON.stringify(trackedTasks));
            })

            task_link.closest('.issuekey').append(checkbox)
        })
    }
    function createPopup(infoString = null) {
        closePopup();

        if (!infoString) {
            infoString = buildInfoString(parseData())
        }
        
        const popup = document.createElement('div');
        popup.classList.add('popup-custom');

        const container = document.createElement('div');
        container.classList.add('container');
    
        const title = document.createElement('h3');
        title.innerHTML = 'Часы'

        const close = document.createElement('div');
        close.classList.add('close');
        close.innerHTML = 'X'
        close.addEventListener('click', () => {
            closePopup()
        })
    
        const list = document.createElement('div');
        list.classList.add('list');
        list.innerHTML = infoString;

        // const list = document.createElement('table');
        // list.classList.add('table');
        // list.innerHTML = infoString;
    
        const style = createCSS()
    
        container.append(close)
        container.append(title)
        container.append(list)
        popup.append(style)
        popup.append(container)
    
        document.body.append(popup)
    }

    function closePopup() {
        const popup = document.querySelectorAll('.popup-custom')
        popup.forEach((item) => {
            item.remove()
        })
    }
    
    function createCSS() {
        const css = `
        .popup-custom {
            position: fixed;
            top: 0;
            right: 0;
            background: white;
            z-index: 1000;
            padding: 20px;
        }
        .popup-custom .container{
            position: relative;
            display: flex;
            flex-direction: column;
        }
        .popup-custom table td{
            border: 1px solid black;
        }
        .popup-custom .close{
            position: fixed;
            top: 0;
            right: 0;
        }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
    
        return style
    }
    
    function parseData(element = document, task_name = null) {
        const timeElement = element.querySelector('#tt_single_values_spent')
        const timeString = timeElement?.innerText
        
        let savedObjects = JSON.parse(localStorage.getItem("savedObjects"));
        if (!savedObjects) {
            savedObjects = {}
        }

        if (timeElement && timeString) {
            const arr = timeString.split(' ')
        
            let hours = 0
            
            arr.forEach((item) => {
                if (item.includes('w')) {
                    item = item.replace('w','')
                    hours += Number(item) * DAYS_WEEK * HOURS_DAY
                    // console.log('week', Number(item) * DAYS_WEEK * HOURS_DAY)
                }
                if (item.includes('d')) {
                    item = item.replace('d','')
                    hours += Number(item) * HOURS_DAY
                    // console.log('day', Number(item) * HOURS_DAY)
                }
                if (item.includes('h')) {
                    item = item.replace('h','')
                    hours += Number(item)
                    // console.log('hour', Number(item))
                }
                if (item.includes('m')) {
                    item = item.replace('m','')
                    hours += Number((item/60).toFixed(2))
                    // console.log('minute', Number((item/60).toFixed(2)))
                }
            })
            
            let task 
            if (task_name) {
                task = task_name
            } else {
                task = window.location.href.split('/').pop()
            }
            
            savedObjects[task] = hours
        }

        localStorage.setItem("savedObjects", JSON.stringify(savedObjects));
        return savedObjects
    }

    function fetchTask(task_name) {
        fetch(`https://job.technesis.ru/browse/${task_name}`)
        .then(response => {
            // Проверяем, успешен ли ответ
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // Преобразуем ответ в текст
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const parsedHTML = parser.parseFromString(data, 'text/html')
            const newData = parseData(parsedHTML, task_name)
            createPopup(buildInfoString(newData))
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    function buildInfoString(objects) {
        let infoString = '';
        let hours = 0
        for (key in objects) {
            infoString += `<a href="https://job.technesis.ru/browse/${key}"> ${key}: ${objects[key]}ч (${objects[key]*MONEY_HOUR}р)</a> <br>`
            hours += objects[key]
        }
        infoString += `hours: ${hours} <br>`
        infoString += `money: ${hours*MONEY_HOUR} <br>`
        // infoString += `<div class="progress-bar" role="progressbar" aria-valuenow="75"
        //     aria-valuemin="0" aria-valuemax="100"></div>`
        infoString += `
        <style>
        .progress-bar {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: 
            radial-gradient(closest-side, white 79%, transparent 80% 100%),
            conic-gradient(hotpink ${Math.round((hours / HOURS_PLAN) * 100)}%, pink 0);    
        }
        .progress-bar::before {
            content: "${Math.round((hours / HOURS_PLAN) * 100)}%";
        }
        </style>
        <div class="progress-bar" role="progressbar" aria-valuenow="${hours}"
            aria-valuemin="0" aria-valuemax="${HOURS_PLAN}"></div>
            `
        return infoString
    }
    function buildInfoTableString(objects) {
        let infoString = '';
        let hours = 0
        for (key in objects) {
            const tr =
            infoString += `<tr>
                            <td>${key}</td> 
                            <td>${objects[key]}ч</td> 
                            <td>${objects[key]*MONEY_HOUR}р</td>
                        </tr>`
            hours += objects[key]
        }
        infoString += `<tr> <td>hours</td> <td>${hours}</td> </tr>`
        infoString += `<tr> <td>money</td> <td>${hours*MONEY_HOUR}</td> </tr>`

        return infoString
    }
}