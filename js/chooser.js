const apiString = "https://www.googleapis.com/books/v1/volumes?q=isbn:"
const greadbookString = "https://www.goodreads.com/book/show/"

var csvfile
const cover = document.querySelector("#cover");
const library = document.querySelector("#library");
const shelf = document.querySelector('#shelf');
const checkbox = document.querySelector('#includeRead');
var candidates = [];
const defaultcover = "defaultcover.jpg"

window.onload = function(){
    $('.hero-btn').tilt({
        glare: true,
        maxGlare: .8    
    })
    document.querySelector("#btnChoose").addEventListener('click', function(){
        loadCSV();
    })
    document.querySelector("#btnReChoose").addEventListener('click', function(){
        toggleAnother();
    })
    document.querySelector("#btnHome").addEventListener('click', function(){
        toggleParamsMode();
    })
    cover.onload = function(){
        $(cover).removeClass('blur');
    }
    library.addEventListener('change', function(e){csvfile = e.target.files[0]});
}

function loadCover(source){
    if(!$(cover).hasClass('blur')){
        $(cover).addClass('blur');
    }
    if(source == defaultcover){
        setTimeout(()=>{
            cover.src = source;
        }, 100)
    }else{
        cover.src = source;
    }
}


function loadCSV(){
    candidates = [];
    const file = csvfile;
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
    var csv = event.target.result;
    var data = $.csv.toObjects(csv);

    if(data[0].hasOwnProperty('Book Id') && data[0].hasOwnProperty('Author') 
    && data[0].hasOwnProperty('Title') && data[0].hasOwnProperty('Exclusive Shelf') 
    && data[0].hasOwnProperty('Year Published') && data[0].hasOwnProperty('Average Rating')){
        for (var key in data){
            var obj = data[key];
            if(document.querySelector('#includeRead').checked){
                if(obj['Exclusive Shelf'] == 'to-read' || obj['Exclusive Shelf'] == 'read'){
        
                    var shelftext = document.querySelector('#shelf').value;
                    shelftext = shelftext.replace(/ /g, '-');
        
                    if(obj['Bookshelves'].includes(shelftext)){
                        var authors = obj['Author'] + ' ' + obj['Additional Authors'];
        
                        if(obj.hasOwnProperty('ISBN13')){
                            var bookISBN = obj['ISBN13'].replace(/\D/g,'');
                            if(!bookISBN){
                                candidates.push({'title':obj['Title'], 'author': authors, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                            }else{
                                candidates.push({'title':obj['Title'], 'author': authors,'isbn':bookISBN, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                            }
                        }else{
                            candidates.push({'title':obj['Title'], 'author': authors, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                        }
                    }
                }
            }else{
                if(obj['Exclusive Shelf'] == 'to-read'){
                    var shelftext = document.querySelector('#shelf').value;
                    shelftext = shelftext.replace(/ /g, '-');
        
                    if(obj['Bookshelves'].includes(shelftext)){
                        var authors = obj['Author'] + ' ' + obj['Additional Authors'];
        
                        if(obj.hasOwnProperty('ISBN13')){
                            var bookISBN = obj['ISBN13'].replace(/\D/g,'');
                            if(!bookISBN){
                                candidates.push({'title':obj['Title'], 'author': authors, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                            }else{
                                candidates.push({'title':obj['Title'], 'author': authors,'isbn':bookISBN, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                            }
                        }else{
                            candidates.push({'title':obj['Title'], 'author': authors, 'year':obj['Year Published'], 'rating': obj['Average Rating'], 'greadid': obj['Book Id']})
                        }
                    }
                }
            }
            candidates = candidates.filter(function(e){return e}); 
        }
        toggleReccMode();
        getRecommendation()
    }else{
        alert("Hello! It seems the CSV you've chosen isn't compatible with the app. This version only supports Goodreads libraries.")
    }
    };
}

function getRecommendation(){
    if(candidates.length>0){
        $('#cover').addClass('blur');

        var number = Math.floor(Math.random() * (candidates.length - 0) + 0);   
        var recommendation = candidates[number];
        var bookcover = defaultcover
        if(recommendation.hasOwnProperty('isbn')){
            $('#reccDescription').addClass('blur');
            const bUrl = apiString + recommendation['isbn'];
            $.ajax({
                type: "GET",
                url: bUrl,
                timeout: 10000,
                success: function(data){
                    console.log(JSON.stringify(data)) 
                    if(data.hasOwnProperty('items')){
                        const books = data['items']
                        const book = books[0]
                        const volume = book['volumeInfo']

                        if(volume.hasOwnProperty('description')){
                            document.querySelector('#reccDescription').innerHTML = volume['description']
                            $('#reccDescription').removeClass('blur');
                        }else{
                            defaultDescription();
                            $('#reccDescription').removeClass('blur');
                        }

                        if(volume.hasOwnProperty('imageLinks')){
                            const covers = volume['imageLinks']
                            if(covers.hasOwnProperty('thumbnail')){
                                bookcover = covers['thumbnail']
                            }
                        }          
                    }else{
                        defaultDescription();
                        $('#reccDescription').removeClass('blur');
                    }
                },
                error: function(){
                    defaultDescription();
                    $('#reccDescription').removeClass('blur');
                },complete: function(){
                    loadCover(bookcover);
                    $("#btnReChoose").attr("disabled", false);
                }
                })

        }else{
            $("#btnReChoose").attr("disabled", false);
            defaultDescription();
            loadCover(bookcover);
        }


        if(recommendation.hasOwnProperty('title')){
            document.querySelector('#reccTitle').innerHTML = recommendation['title']
        }else{
            document.querySelector('#reccTitle').innerHTML = "Book title could not be retrieved"
        }

        if(recommendation.hasOwnProperty('author')){
            document.querySelector('#reccAuthor').innerHTML = recommendation['author']
        }else{
            document.querySelector('#reccAuthor').innerHTML = "Book author could not be retrieved"
        }

        if(recommendation.hasOwnProperty('year')){
            document.querySelector('#reccYear').innerHTML = recommendation['year']
        }else{
            document.querySelector('#reccYear').innerHTML = "n/a"
        }

        if(recommendation.hasOwnProperty('rating')){
            document.querySelector('#reccRating').innerHTML = recommendation['rating'] + ' ⭐'
        }else{
            document.querySelector('#reccRating').innerHTML = "rating could not be retrieved"
        }
        if(recommendation.hasOwnProperty('greadid')){
            $('#lnk-goodreads').attr("href",greadbookString + recommendation['greadid']);
        }else{
            $('#lnk-goodreads').attr("href",'.');
        }
    }else{
        emptyTBR();
    }
}

// Transition Effects
function toggleTransition(){
    $('#stars').addClass('fast');
    $('#stars2').addClass('fast');
    $('#stars3').addClass('fast');
    setTimeout(()=>{
        $('#stars').removeClass('fast');
        $('#stars2').removeClass('fast');
        $('#stars3').removeClass('fast');
    }, 1000)
}

function toggleReccMode(){
    toggleTransition()
    $("#btnChoose").attr("disabled", true);
    $('#credits').fadeOut(800);
    $('#bookform').animate({opacity: '0'},800,'linear',function(){
        $('#bookform').css('display','none');
        setTimeout(()=>{
            $('#recommended').css('opacity','0');
            $('#recommended').css('display','block');
            $('#recommended').animate({opacity: '1'},500)
            $('#credits').fadeIn(800);
        }, 400)
    })
    
}

function toggleParamsMode(){
    toggleTransition()
    $("#btnChoose").attr("disabled", false);
    $('#credits').fadeOut(800);
    $('#recommended').animate({opacity: '0'},800,'linear',function(){
        $('#recommended').css('display','none');
        setTimeout(()=>{
            $('#bookform').css('opacity','0');
            $('#bookform').css('display','block');
            $('#bookform').animate({opacity: '1'},500)
            $('#credits').fadeIn(800);
            resetRecc()
        }, 400)
    })
}

function toggleAnother(){
    $("#btnReChoose").attr("disabled", true);
    $('#motherbox').addClass('overflow-hidden');
    $('#recommended').addClass('animanother');
    setTimeout(()=>{
        $('#motherbox').removeClass('overflow-hidden');
        $("#recommended").removeClass('animanother');
    },800)
    setTimeout(()=>{
        getRecommendation();
    },400)
}

// Reccomended div functions
function resetRecc(){
    loadCover(defaultcover);
    document.querySelector('#reccTitle').innerHTML = 'Title'
    document.querySelector('#reccAuthor').innerHTML = 'Author'
    document.querySelector('#reccDescription').innerHTML = 'Description'
    document.querySelector('#reccRating').innerHTML = '5⭐'
    document.querySelector('#reccYear').innerHTML = new Date().getFullYear()
    $('#lnk-goodreads').attr("href","");
    if($('#lnk-goodreads').hasClass('disabled')){
        $('#lnk-goodreads').removeClass("disabled");
    }
    $("#btnReChoose").attr("disabled", false);
}
function emptyTBR(){
    loadCover(defaultcover);
    document.querySelector('#reccTitle').innerHTML = 'None Found!'
    document.querySelector('#reccAuthor').innerHTML = 'Hooray!'
    document.querySelector('#reccDescription').innerHTML = 'Hooray! Your TBR is empty. Time to add more 📚!'
    document.querySelector('#reccRating').innerHTML = '5⭐'
    document.querySelector('#reccYear').innerHTML = new Date().getFullYear()
    $('#lnk-goodreads').addClass("disabled");
    $("#btnReChoose").attr("disabled", true);
}

function defaultDescription(){
    document.querySelector('#reccDescription').innerHTML = "A description could not be retrieved."
}
