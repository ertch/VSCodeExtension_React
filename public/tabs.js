// let tab = document.getElementById("tab0");
// let nextPage = document.getElementById("nextPage-btn");
// let lastPage = document.getElementById("lastPage-btn");
// let save = document.getElementById('save-btn');
        
// function opener(tabContent,target) {
//     tabContent.classList.add("tabcontent--open");
//     target.classList.add("tab--active");
//     tabContent.setAttribute('aria-expanded', true);
//     target.setAttribute('aria-selected', true);
// }
// function reset(openedTabs, openedTabsContent) {
//     openedTabs[0].setAttribute('aria-selected', false);
//     openedTabs[0].classList.remove('tab--active')
//     openedTabsContent[0].classList.remove("tabcontent--open");
//     openedTabsContent[0].setAttribute('aria-expanded', false);
// }

// function showNextPage() {
//     let openedTabs = document.querySelectorAll('[aria-selected="true"]');
//     let openedTabsContent = document.querySelectorAll('[aria-expanded="true"]');
//     let pages = document.querySelectorAll('.tab');
//     let currentIndex = Array.from(pages).indexOf(openedTabs[0]);
//     let nextIndex = (currentIndex + 1) % pages.length;
//     let nextPage = pages[nextIndex];
//     let contentId = nextPage.getAttribute('aria-controls');
//     let tabContent = document.getElementById(contentId);
//     opener(tabContent, nextPage);
//     reset(openedTabs, openedTabsContent);
// }

// function showLastPage() {
//     let openedTabs = document.querySelectorAll('[aria-selected="true"]');
//     let openedTabsContent = document.querySelectorAll('[aria-expanded="true"]');
//     let pages = document.querySelectorAll('.tab');
//     let currentIndex = Array.from(pages).indexOf(openedTabs[0]);
//     let nextIndex = (currentIndex - 1) % pages.length;
//     let nextPage = pages[nextIndex];
//     let contentId = nextPage.getAttribute('aria-controls');
//     let tabContent = document.getElementById(contentId);
//     opener(tabContent, nextPage);
//     reset(openedTabs, openedTabsContent);
// }

// tab.addEventListener('click', function (event) {
//     let openedTabs = document.querySelectorAll('[aria-selected="true"]');
//     let openedTabsContent = document.querySelectorAll('[aria-expanded="true"]');
//     let target = event.target;
//     let tabButton = target.getAttribute('aria-selected') === 'false';
//     let contentId = target.getAttribute('aria-controls');
// let tabContent = document.getElementById(contentId);
//     if (tabButton) {
//         opener(tabContent,target);
//         reset(openedTabs,openedTabsContent);
//     }  
// });

// nextPage.addEventListener('click', function() {
//     showNextPage();
// });

// lastPage.addEventListener('click', function() {
//     showLastPage();
// });

// save.addEventListener('click', ()=> {
//     const inputs = {};
//     let selectedRadio = document.querySelector('input[name="option1"]:checked').value;
    
//     inputs.name = document.getElementById('firstInput').value;
//     inputs.radio = selectedRadio;
//     inputs.frucht = document.getElementById('sel1').value;

//     const safeFile = JSON.stringify(inputs);
//     console.log(inputs);
//     console.log(safeFile);
// });