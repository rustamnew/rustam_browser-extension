// Восстановление полей
loadInputStates()



// Функционал открытия вкладки путём субмита <form>
const forms = document.querySelectorAll('form.single')

forms.forEach( (form) => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        await saveInputStates();

        const URL_SEARCH = getPageFromForm(form)
    
        //Открыть новую вкладку с поиском по тексту из инпута
        chrome.tabs.create({
            url: URL_SEARCH, 
            active: true,
        });
        
        return false;
    })
})



// Поиск по всем маркетплейсам
const formGlobal = document.querySelector('.form.global')

formGlobal.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formInput = formGlobal.querySelector(`input`)
    const formValue = formInput.value

    const URL_ARRAY = []

    forms.forEach( (form) => {
        form.querySelector('input').value = formValue
        const URL_SEARCH = getPageFromForm(form)
        URL_ARRAY.push(URL_SEARCH)
    })

    await openLinks(URL_ARRAY);
})



// Очистка форм
const clearButton = document.querySelector('#button-clear')
clearButton.addEventListener('click', (e) => {
    clearForms()
})



// Составить URL с запросом поиска из элемента <form>
function getPageFromForm(form) {
    const formValue = form.querySelector(`input`).value
    
    if (!formValue) {
        return false
    }
    
    const BASE_URL = form.dataset.href + form.dataset.base //URL страницы маркетплейса (поиск)
    let searchString = ''

    //Проверка на количество слов > 1 (присутствует пробел)
    if (formValue.includes(' ')) { 
        const WORD_DIVIDE = form.dataset.divider //(пробел)
        const formValueArray = formValue.split(' ')

        for (let i = 0; i < formValueArray.length; i++) {
            if (i < formValueArray.length - 1) {
                searchString += formValueArray[i] + WORD_DIVIDE 
            }
            else {
                searchString += formValueArray[i]
            }
        }
    } 
    else {
        searchString = formValue
    }

    return BASE_URL + searchString
}


//Асинхнонное открытие ссылок из массива
async function openLinks(url_array) {
    await saveInputStates()

    for (let i = 0; i < url_array.length; i++) {
        chrome.tabs.create({
            url: url_array[i], 
            active: (i === url_array.length - 1) ? true : false, //Переключать на последнюю из открытых вкладок 
        });
    }
}

// Сохранение в localstorage
async function saveInputStates() {
    const values = []
    const inputs = document.querySelectorAll('input')
    inputs.forEach((input) => {
        values.push(input.value)
    })

    
    await chrome.storage.local.set({ // writing
        values: values,
    });
}

// Загрузка из localstorage
async function loadInputStates() {

    const values = await chrome.storage.local.get('values'); //reading
    const inputs = document.querySelectorAll('input');

    inputs.forEach((input, index) => {
        input.value = values.values[index]
    })
}

function clearForms() {
    forms.forEach( (form) => {
        form.querySelector('input').value = ''
    })

    formGlobal.querySelector('input').value = ''
}