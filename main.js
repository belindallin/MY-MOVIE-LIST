const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
const MOVIES_PER_PAGE = 12 //分頁器，宣告每頁有幾筆資料數量
let filteredMovie = []
let mode = 'card'
let page = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listIcons = document.querySelector('#list-icons')

//主程式
//串接API
axios.get( INDEX_URL )
.then ( response =>{
  movies.push ( ...response.data.results )
  renderPagination ( movies.length )
  renderMovieCard (getMoviesByPage ( 1 ))
}) .catch ( error => {
  console.log (error)
})

//Listener
//Search Bar
searchForm.addEventListener ( 'submit' , onSearchFormSubmitted )
//List Icons
listIcons.addEventListener('click', function onListIconClicked (event) {
  if (event.target.matches(".cardIcon")) {
    mode = "card"    
  } else if (event.target.matches(".listIcon")) {
    mode = "list" 
  }  
  renderMovieCard (getMoviesByPage ( page ))
})
//Button MORE or +
dataPanel.addEventListener('click', function onPanelClicked (event)  {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal (Number(event.target.dataset.id)) 
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite (Number(event.target.dataset.id))
  }
})
//Pagiator
paginator.addEventListener ( 'click' , function onPaginatorClicked ( event )  {
  if ( event.target.tagName !== 'A' ) return
  page = Number ( event.target.dataset.page ) 
  renderMovieCard (getMoviesByPage ( page ))
})

//函式
//Rander Movie Data  
function renderMovieCard ( data ) {
  let rawHTML = ''
  if ( mode === 'card' ) {  
    mode = 'card'  
    data.forEach ( item  => {
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img class="card-img-top" src="${POSTER_URL + item.image}" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer text-muted">
                <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>  
        `    
    })
  } else {
    mode = 'list'
    data.forEach ( item  => {      
      rawHTML += `
      <li class="list-group-item w-100 border-right-0 border-left-0">
        <div class="row">
          <p class="col-8">${item.title}</p>
          <div class="button-groups">
            <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
            <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>        
          </div>
        </div>
      </li>
    `
    }) 
  }
  dataPanel.innerHTML = rawHTML
}

//MODAL，按下Button MORE 跳出的互動視窗畫面
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-model-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`    
  })
}

//加入最愛，按下Button + 把資料存入瀏覽器的localStorage中
function addToFavorite (id) {
  const list = JSON.parse(localStorage.getItem ('favoriteMovies')) || []
  const movie = movies.find ( movie => movie.id === id )
  if ( list.some ( movie => movie.id === id )) {  
   return  alert('此電影已經在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//搜尋關鍵字
function onSearchFormSubmitted ( event ) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()
  filteredMovie = movies.filter( movie => 
    movie.title.toLowerCase().includes(keyWord)
  )
  if (filteredMovie.length === 0) {
    return alert(`您輸入的關鍵字：${keyWord} 沒有符合條件的電影`)
  }
  page = 1
  renderPagination(filteredMovie.length)
  renderMovieCard (getMoviesByPage ( page ))
}

//分頁器-1，函式分割movies資料
function getMoviesByPage ( page ) {
  const data = filteredMovie.length? filteredMovie:movies
  const startIndex = ( page - 1 ) * MOVIES_PER_PAGE  
  return data.slice ( startIndex , startIndex + MOVIES_PER_PAGE ) 
}

//分頁器-2，函式render pagination <li> 分頁數量
function renderPagination ( amount ) {
  const numberOfPage = Math.ceil( amount / MOVIES_PER_PAGE )
  let rawHTML = ''
  for ( let page = 1 ; page <= numberOfPage ; page++ ) {
    rawHTML +=  `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}



