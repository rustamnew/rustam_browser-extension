const submitButtons = document.querySelectorAll('.submit-button')

submitButtons.forEach( (item) => {
    item.addEventListener('click', function(e) {
        const marketplaceName = item.dataset.marketplace //название маркетплейса
        const itemInput = document.querySelector(`input[data-marketplace="${marketplaceName}"]`)
        const itemValue = itemInput.value
    
        if (!itemValue) {
            return false
        }
        
        
        let searchString = '' //составной URL строки поиска
        let BASE_URL = '' //URL страницы маркетплейса 
        let WORD_DIVIDE = '' //("пробел" в URL запросе, иногда различается)


        //Различные параметры в зависимости от паркетплейса
        if (marketplaceName === 'ozon') {
            BASE_URL = item.getAttribute("href") + `/search/?from_global=true&text=`
            WORD_DIVIDE = '%20' 
        }
        if (marketplaceName === 'wb') {
            BASE_URL = item.getAttribute("href") + `/catalog/0/search.aspx?search=`
            WORD_DIVIDE = '%20'
        }
        if (marketplaceName === 'ym') {
            BASE_URL = item.getAttribute("href") + `/search?text=`
            WORD_DIVIDE = '+'
        }
        

        //Проверка на количество слов > 1 (присутствует пробел)
        if (itemValue.includes(' ')) { 
            const itemValueArray = itemValue.split(' ')
    
            for (let i = 0; i < itemValueArray.length; i++) {
                if (i < itemValueArray.length - 1) {
                    searchString += itemValueArray[i] + WORD_DIVIDE 
                }
                else {
                    searchString += itemValueArray[i]
                }
            }
        } 
        else {
            searchString = itemValue
        }
    

        //Открыть новую вкладку с поиском по тексту из инпута
        chrome.tabs.create({
            url: BASE_URL + searchString, 
            active: true,
        });
        
        return false;
    })
})