// event listener whenever DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    //get elements by their ids
    const poster = document.getElementById('poster');
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const showtime = document.getElementById('showtime');
    const availableTickets = document.getElementById('available-tickets');
    const buyTicketButton = document.getElementById('buy-ticket');
    const filmsList = document.getElementById('films');
    //fetching detals
    fetchMovieDetails(1);
    //fetching movies
    fetchMoviesList();
    // fetchng all the detals of single movies
    function fetchMovieDetails(movieId) {
        fetch(`http://localhost:3000/films/${movieId}`)
            .then(response => response.json())
            .then(film => {
                // updating ui with the fetched film details
                poster.src = film.poster;
                title.textContent = film.title;
                runtime.textContent = `Runtime: ${film.runtime} minutes`;
                showtime.textContent = `Showtime: ${film.showtime}`;
                availableTickets.textContent = `Available Tickets: ${film.capacity - film.tickets_sold}`;
                // enabling or deasbling based on the ticket available
                buyTicketButton.textContent = 'Buy Ticket';
                buyTicketButton.disabled = film.tickets_sold >= film.capacity;
                //adding new event listener and removng the previous
                buyTicketButton.removeEventListener('click', handleBuyTicket);
                buyTicketButton.addEventListener('click', () => handleBuyTicket(film));
            })
            .catch(error => console.error('Error fetching movie details:', error)); //error hundling
    }
    //fetching and displaying the list of movies
    function fetchMoviesList() {
        fetch('http://localhost:3000/films')
            .then(response => response.json()) // converting the response to JSON
            .then(films => {
                //clearing the current list and fetching 
                filmsList.innerHTML = '';
                films.forEach(film => {
                    //creating a list items for the films and adding event listeners
                    const filmItem = document.createElement('li');
                    filmItem.textContent = film.title;
                    filmItem.classList.add('film', 'item');
                    filmItem.setAttribute('data-id', film.id);
                    //loading and selecting the films whenever click is done
                    filmItem.addEventListener('click', () => fetchMovieDetails(film.id));
                    //appending fils to the list
                    filmsList.appendChild(filmItem);
                });
            })
            .catch(error => console.error('Error fetching movies list:', error));
    }
    //handles buying tickets for the films currently
    function handleBuyTicket(film) {
        // cheks the tickets if they are still available
        if (film.tickets_sold < film.capacity) {
            //updating the available tickets
            film.tickets_sold++;
            availableTickets.textContent = `Available Tickets: ${film.capacity - film.tickets_sold}`;
            // updating with new ticket count
            fetch(`http://localhost:3000/films/${film.id}`, {
                method: 'PATCH', //updates also the ticket count
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickets_sold: film.tickets_sold }),
            }).catch(error => console.error('Error updating tickets sold:', error)); //handling the errors
            //updates whenever the tickets are no longer available
            if (film.tickets_sold >= film.capacity) {
                buyTicketButton.textContent = 'SOLD';
                buyTicketButton.disabled = true; //making the button disabled
                // add the word sold out to the flms items along the list
                const filmItem = document.querySelector(`li[data-id='${film.id}']`);
                if (filmItem) {
                    filmItem.classList.add('sold-out');
                }
            }
        }
    }
});