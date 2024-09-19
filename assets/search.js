// Initialize the FlexSearch index
const index = new FlexSearch.Document({
    tokenize: "forward",
    document: {
        id: "id",
        index: ["title", "content"],
        store: ["title", "content", "url"]
    }
});

// Define the pages to be indexed
const pages = [
    { id: 1, title: "Bits and Bytes", url: "../index.html" },
    { id: 2, title: "Brain Teaser", url: "../pages/bt.html" },
    { id: 3, title: "Synergy", url: "../pages/synergy.html" },
    { id: 4, title: "Personal Space", url: "../pages/sikkim.html" },
    { id: 2, title: "Tech Documentation", url: "../pages/llm.html" },
    { id: 2, title: "Know Your Colleague", url: "../pages/kyc.html" },
    { id: 2, title: "Hackathon", url: "../pages/hackathon.html" },
    { id: 2, title: "Industry Focus - FTDM", url: "../pages/ftdm.html" },
    { id: 2, title: "Industry Focus - Connected Worker", url: "../pages/connectedworker.html" }
];

// Fetch and index content of each page (excluding navbar)
pages.forEach(page => {
    fetch(page.url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            // Select only the content outside the navbar, e.g., inside the 'container' class
            const mainContent = doc.querySelector('.forsearch'); // Adjust as needed

            if (mainContent) {
                const contentText = mainContent.innerText; // Get the text content of the main section

                // Add page content to the index, excluding the navbar
                index.add({
                    id: page.id,
                    title: page.title,
                    content: contentText,
                    url: page.url
                });
            }
        })
        .catch(error => console.error(`Error fetching ${page.url}:`, error));
});

// Function to extract a snippet around the search term
function getSnippet(content, query) {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex !== -1) {
        const snippetStart = Math.max(0, queryIndex - 30); // Start snippet 30 characters before the found query
        const snippetEnd = Math.min(content.length, queryIndex + 30); // End snippet 30 characters after the found query
        return content.substring(snippetStart, snippetEnd) + '...'; // Return the snippet with ellipsis
    }
    return '';
}

// Search function for input event
document.getElementById('search-input').addEventListener('input', function (event) {
    const query = event.target.value;
    const results = index.search(query, { enrich: true });
    const searchDropdown = document.getElementById('search-dropdown');
    searchDropdown.innerHTML = ''; // Clear previous results

    if (results.length && query.length > 0) {
        results[0].result.forEach(result => {
            const item = document.createElement('li');
            item.className = 'dropdown-item';
            const snippet = getSnippet(result.doc.content, query); // Get content snippet
            item.innerHTML = `<a href="${result.doc.url}" class="d-block"><strong>${result.doc.title}</strong><br><small>${snippet}</small></a>`;
            item.onclick = () => highlightContent(result.doc.url, query); // Highlight content on click
            searchDropdown.appendChild(item);
        });
        searchDropdown.classList.add('show'); // Show the dropdown if results exist
    } else {
        searchDropdown.classList.remove('show'); // Hide dropdown if no results
    }
});

// Function to highlight content
function highlightContent(url, query) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML = html; // Replace content with fetched page content
            const markInstance = new Mark(document.querySelector("body"));
            markInstance.mark(query); // Highlight the search query
        })
        .catch(error => console.error(`Error loading content from ${url}:`, error));
}
 