document.addEventListener('DOMContentLoaded', () => {
    fetchAPI();

    document.getElementById('submitBtn').addEventListener('click', updateParams);
    document.getElementById('pageInput').addEventListener('change', goToPage);
    document.getElementById('addBookForm').addEventListener('submit', addBook);
});

function fetchAPI() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page') || 1);
    const limit = parseInt(urlParams.get('limit') || 10);

    fetch(`/books?page=${page}&limit=${limit}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(res => {
            const data = res.books;
            const totalPages = res.totalPages;

            let rows = '';
            data.forEach(element => {
                rows += `<tr>
                    <td>${element.gender}</td>
                    <td>${element.name.title} ${element.name.first} ${element.name.last}</td>
                    <td>${element.email}</td>
                    <td>Date: ${element.dob.date}<br>Age: ${element.dob.age}</td>
                    <td>Date: ${element.registered.date}<br>Age: ${element.registered.age}</td>
                    <td>${element.phone}</td>
                    <td>${element.cell}</td>
                    <td>${element.id.name} ${element.id.value}</td>
                    <td><img src="${element.picture.thumbnail}" style="width: 100%" class="img" alt="User Picture"/></td>
                    <td>${element.nat}</td>
                </tr>`;
            });

            document.getElementById('tablerows').innerHTML = rows;
            document.getElementById('pageInput').value = page;
            document.getElementById('pageCount').innerText = totalPages;
            document.getElementById('errorMessage').innerText = '';

            document.getElementById('prevPage').disabled = (page <= 1);
            document.getElementById('nextPage').disabled = (page >= totalPages);
            document.getElementById('firstPage').disabled = (page <= 1);
            document.getElementById('lastPage').disabled = (page >= totalPages);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('errorMessage').innerText = `An error occurred while fetching data: ${error.message}`;
        });
}

function addBook(event) {
    event.preventDefault();

    const newBook = {
        gender: document.getElementById('gender').value,
        name: {
            title: document.getElementById('title').value,
            first: document.getElementById('firstName').value,
            last: document.getElementById('lastName').value
        },
        email: document.getElementById('email').value,
        dob: {
            date: document.getElementById('dobDate').value,
            age: document.getElementById('dobAge').value
        },
        registered: {
            date: document.getElementById('registeredDate').value,
            age: document.getElementById('registeredAge').value
        },
        phone: document.getElementById('phone').value,
        cell: document.getElementById('cell').value,
        id: {
            name: document.getElementById('idName').value,
            value: document.getElementById('idValue').value
        },
        picture: {
            thumbnail: document.getElementById('picture').value
        },
        nat: document.getElementById('nat').value
    };

    fetch('/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(result => {
        fetchAPI();
        document.getElementById('addBookForm').reset();
    })
    .catch(error => {
        console.error('Error adding book:', error);
        document.getElementById('errorMessage').innerText = `An error occurred while adding the book: ${error.message}`;
    });
}

function updateParams() {
    const limit = document.getElementById('limitInput').value;
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;

    if (limit) {
        urlParams.set('limit', limit);
    } else {
        urlParams.delete('limit');
    }

    urlParams.set('page', page);

    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    fetchAPI();
}

function prevPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let page = parseInt(urlParams.get('page') || 1);
    if (page > 1) {
        updateParamsForPage(page - 1);
    }
}

function nextPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let page = parseInt(urlParams.get('page') || 1);
    updateParamsForPage(page + 1);
}

function firstPage() {
    updateParamsForPage(1);
}

function lastPage() {
    fetch(`/books?page=${1}&limit=${document.getElementById('limitInput').value || 10}`)
        .then(response => response.json())
        .then(res => {
            const totalPages = res.totalPages;
            updateParamsForPage(totalPages);
        });
}

function updateParamsForPage(page) {
    const urlParams = new URLSearchParams(window.location.search);
    const limit = urlParams.get('limit') || 10;

    urlParams.set('page', page);
    urlParams.set('limit', limit);

    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    fetchAPI();
}

function goToPage() {
    const pageInput = document.getElementById('pageInput');
    const page = parseInt(pageInput.value, 10);
    const totalPages = parseInt(document.getElementById('pageCount').innerText, 10);

    if (!isNaN(page) && page > 0) {
        if (page > totalPages) {
            document.getElementById('errorMessage').innerText = 'Page number is greater than the total number of pages.';
        } else {
            document.getElementById('errorMessage').innerText = '';
            updateParamsForPage(page);
        }
    } else {
        document.getElementById('errorMessage').innerText = 'Please enter a valid page number.';
    }
}