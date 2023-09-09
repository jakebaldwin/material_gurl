document.addEventListener("DOMContentLoaded", function () {
    // Sample list of items (you can replace this with your own data)
    let items = [];

    let categories = new Set();

    // Default the "Active" button to be active
    const defaultActiveButton = document.querySelector(".active-button[data-active='true']");
    if (defaultActiveButton) {
        defaultActiveButton.classList.add("active");
    }

    // Event listener for the "Add New Item" button
    document.getElementById("addItemButton").addEventListener("click", () => {
        const addItemForm = document.getElementById("addItemForm");
        if (addItemForm.style.display === "none" || addItemForm.style.display === "") {
            addItemForm.style.display = "block";
        } else {
            addItemForm.style.display = "none";
        }

    });

    // Function to populate today's date in the format "YYYY-MM-DD"
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to toggle between "Active" and "Purchased" items
    async function toggleItems(active, saveToDB = true) {
        const itemList = document.getElementById("itemList");
        const tabContainer = document.getElementById("tabContainer");

        itemList.innerHTML = ""; // Clear the item list
        tabContainer.innerHTML = "";
        categories.clear()

        const filteredItems = items.filter(item => active === item.active);

        for (const item of filteredItems) {
            if (saveToDB) {
                await addItemToDB(item);
            }

            const category = item.category;
            let categoryContainer;
            if (categories.has(category))
            {
                categoryContainer = document.getElementById(category);
            }
            else
            {
                categories.add(category);
                categoryContainer = document.createElement("div");
                categoryContainer.classList.add("content");
                categoryContainer.id = category;

                const tab = document.createElement("div");
                tab.classList.add("tab");
                tab.id = (category + "tab");
                tab.innerText = category;
                tabContainer.appendChild(tab);

            }

            const itemRow = document.createElement("div");
            itemRow.className = "item-row row";

            // Item Image
            const itemImage = document.createElement("div");
            itemImage.className = "col-md-2";
            const img = document.createElement("img");
            img.className = "item-image img-fluid";
            img.height = "200";
            img.width = "150";
            img.src = item.image;
            itemImage.appendChild(img);

            // Item Details
            const itemDetails = document.createElement("div");
            itemDetails.className = "col";
            const itemName = document.createElement("h4");
            itemName.innerText = item.name;
            const itemLink = document.createElement("a");
            itemLink.href = item.link;
            itemLink.innerText = "Purchase Link";
            const itemPrice = document.createElement("p");
            itemPrice.innerText = `Price: ${item.price}`;
            const itemDateAdded = document.createElement("p");
            itemDateAdded.innerText = `Date Added: ${item.dateAdded}`;

            const progress = document.createElement("div");
            progress.classList.add("progress");

            const percentage = (item.savedAmount / item.price) * 100;
            const progressBar = document.createElement("div");
            progressBar.classList.add("progress-bar");
            progressBar.innerText = `${Math.round(percentage)}% a.k.a. ${item.savedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
            progressBar.style.width = `${percentage}%`;

            progress.appendChild(progressBar);

            itemDetails.appendChild(itemName);
            itemDetails.appendChild(itemLink);
            itemDetails.appendChild(itemPrice);
            itemDetails.appendChild(itemDateAdded);
            itemDetails.appendChild(progress);

            // Button to move item (purchased or still active)
            const moveButton = document.createElement("button");
            moveButton.className = "btn btn-primary";
            moveButton.addEventListener("click", () => toggleItemStatus(item));
            updateMoveButtonLabel(moveButton, item.active);

            // Create a container for buttons
            const buttonContainer = document.createElement("div");

            // Apply Bootstrap classes to the button container
            buttonContainer.classList.add("btn-group");

            // Create a red delete button
            const deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger";
            deleteButton.innerText = "Delete";
            deleteButton.addEventListener("click", () => {
                // Find the index of the item in the array
                const index = items.indexOf(item);

                if (index !== -1) {
                    // Remove the item from the array
                    items.splice(index, 1);

                    removeItemFromDB(item);

                    // Regenerate the item list
                    toggleItems(true, false); // or pass false to show purchased items
                }
            });

            // Create an "Update Saved Amount" button
            const updateButton = document.createElement("button");
            updateButton.className = "btn btn-info";
            updateButton.innerText = "Update Saved Amount";
            updateButton.addEventListener("click", () => {
                const newSavedAmount = parseFloat(prompt("Enter the new saved amount:"));
                if (!isNaN(newSavedAmount)) {
                    item.savedAmount = newSavedAmount;
                    const newPercentage = (item.savedAmount / item.price) * 100;
                    progressBar.style.width = `${newPercentage}%`;
                    progressBar.innerText = `${Math.round(newPercentage)}% a.k.a. ${item.savedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
                }
                addItemToDB(item);
            });

            // Append buttons to the button container
            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(updateButton);
            buttonContainer.appendChild(moveButton);

            itemRow.appendChild(itemImage);
            itemRow.appendChild(itemDetails);
            itemRow.appendChild(buttonContainer);

            categoryContainer.append(itemRow);
            itemList.appendChild(categoryContainer);
        }

        updateTabs();
    }

    // Function to toggle the status of an item (purchased or still active)
    function toggleItemStatus(item) {
        item.active = !item.active;
        console.log('clicked!');
        toggleItems(document.querySelector(".active-button.active").getAttribute("data-active") === "true"); // Refresh the list after moving an item
        addItemToDB(item);
    }

    // Function to update the label of the move button based on the item's status
    function updateMoveButtonLabel(button, isActive) {
        if (isActive) {
            button.innerText = "Mark Purchased";
        } else {
            button.innerText = "Mark Active";
        }
    }

    function updateTabs() {
        // Get all tab elements
        
        const tabs = document.querySelectorAll('.tab');

        // Get all content elements
        const contents = document.querySelectorAll('.content');

        // Add a click event listener to each tab
        tabs.forEach(tab => {

            const randomColor = getRandomPastelColor();
            tab.style.backgroundColor = randomColor;

            tab.addEventListener('click', () => {
                // Hide all content

                contents.forEach(content => {
                    content.style.display = 'none';
                });

                document.querySelectorAll('.tab').forEach(t => {
                    t.classList.remove('active')
                    t.classList.remove('inactive')
                })

                // Show the corresponding content
                const categoryId = tab.id.replace('tab', '');
                tab.classList.add('active');
                const contentId = `${categoryId}`;
                document.getElementById(contentId).style.display = 'block';
                document.getElementById('fillRow').style.backgroundColor = randomColor;

                document.querySelectorAll('.tab').forEach(t => {
                    if (t.id !== tab.id) {
                        t.classList.add('inactive');
                    }
                })
            });
        });
    }

    // Event listeners for "Active" and "Purchased" buttons
    const activeButtons = document.querySelectorAll(".active-button");
    activeButtons.forEach(button => {
        button.addEventListener("click", () => {
            activeButtons.forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            toggleItems(button.getAttribute("data-active") === "true", false);
        });
    });

    // Event listener for the "Add Item" form
    document.getElementById("addItemForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        // Get form values and populate today's date
        const newItem = {
            name: document.getElementById("itemName").value,
            image: document.getElementById("itemImage").value,
            link: document.getElementById("itemLink").value,
            price: document.getElementById("itemPrice").value,
            dateAdded: getTodayDate(),
            savedAmount: parseFloat(document.getElementById("itemSavedAmount").value),
            active: true, // Initially set as active
            category: document.getElementById("itemCategory").value
        };

        // Add the new item to the list
        items.push(newItem);

        // Clear form inputs
        document.getElementById("addItemForm").reset();

        // Refresh the list
        toggleItems(document.querySelector(".active-button.active").getAttribute("data-active") === "true");

        // Hide the form after submission
        document.getElementById("addItemForm").style.display = "none";
    });

    async function removeItemFromDB(item) {
        const response = await fetch("/remove_item_from_db", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        });

        if (response.ok) {
            alert("Item deleted from the database.");
        } else {
            alert("Failed to delete item from the database.");
        }
    }

    async function addItemToDB(item) {
        const response = await fetch("/save_item_to_db", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        });

        if (response.ok) {
            alert("Item saved to the database.");
        } else {
            alert("Failed to save item to the database.");
        }
    }

    async function loadItemsFromDB() {
        const response = await fetch("/load_items_from_db");

        if (response.ok) {
            const data = await response.json();
            items = data.items || [];
            // Initial call to populate the list
            toggleItems(true, false);
        } else {
            console.error("Failed to load items from the database.");
        }
    }

    // used for groups
    function setupAutocomplete() {
        // Fetch data from the /getgroups endpoint
        fetch('/getcategories')
          .then((response) => response.json())
          .then((data) => {

            console.log(data);
            // Get the input element for autocomplete
            const inputElement = document.getElementById('itemCategory');
    
            // Initialize an array to store autocomplete suggestions
            const suggestions = data.map((item) => item[0]);
            // Set up autocomplete using the suggestions array
            autocomplete(inputElement, suggestions);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
          });
      }
    
      // Event listener for the "Add New Item" button
      document.getElementById('addItemButton').addEventListener('click', setupAutocomplete);

      function autocomplete(input, suggestions) {
        // Create a new instance of the Autocomplete class
        new Autocomplete(input, suggestions);
      }

      class Autocomplete {
        constructor(input, suggestions) {
          this.input = input;
          this.suggestions = suggestions;
          this.init();
        }
    
        init() {
          this.input.addEventListener('input', () => {
            this.showSuggestions();
          });
        }
    
        showSuggestions() {

            const inputValue = this.input.value.toLowerCase();
            const filteredSuggestions = this.suggestions.filter((suggestion) => suggestion.toLowerCase().includes(inputValue));
    
            // Display the filtered suggestions
            this.displaySuggestions(filteredSuggestions);
        }
    
        displaySuggestions(suggestions) {
          // Clear any previous suggestions
          this.clearSuggestions();
    
          // Create a dropdown for suggestions
          const suggestionDropdown = document.createElement('ul');
          suggestionDropdown.classList.add('suggestion-dropdown');
    
          // Create list items for each suggestion
          suggestions.forEach((suggestion) => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion;
    
            // Handle click on a suggestion
            listItem.addEventListener('click', () => {
              this.input.value = suggestion;
              this.clearSuggestions();
            });
    
            suggestionDropdown.appendChild(listItem);
          });
    
          // Append the suggestion dropdown to the input's parent container
          this.input.parentNode.appendChild(suggestionDropdown);
        }
    
        clearSuggestions() {
          const existingDropdown = this.input.parentNode.querySelector('.suggestion-dropdown');
          if (existingDropdown) {
            existingDropdown.remove();
          }
        }
      }

      function getRandomPastelColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        // Convert the color to a pastel shade (lighten it)
        return lightenColor(color, 30);
      }
      
      // Function to lighten a color
      function lightenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 255) + amt;
        const B = (num & 255) + amt;
        const newColor = `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
        return newColor;
      }

    loadItemsFromDB();

});
