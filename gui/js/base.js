// script.js

document.addEventListener("DOMContentLoaded", function() {

    // Sample list of items (you can replace this with your own data)
    let items = [];

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
        
        // Ensure there is an active button before calling toggleItems
        const activeButton = document.querySelector(".active-button.active");
        if (activeButton) {
            toggleItems(activeButton.getAttribute("data-active") === "true");
        } else {
            // If no active button is found, default to showing "Active" items
            toggleItems(true);
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
    function toggleItems(active, saveToDB=true) {
        const itemList = document.getElementById("itemList");

        itemList.innerHTML = ""; // Clear the item list

        const filteredItems = items.filter(item => active === item.active);

        filteredItems.forEach(item => {
            if (saveToDB) 
            {
                addItemToDB(item);
            }
            
            const itemRow = document.createElement("div");
            itemRow.className = "item-row row";

            // Item Image
            const itemImage = document.createElement("div");
            itemImage.className = "col-md-2";
            const img = document.createElement("img");
            img.className = "item-image img-fluid";
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
            progressBar.innerText = Math.round(percentage);
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
                progressBar.innerText = `${Math.round(newPercentage)}% out of ${item.price}`;
            }
            });

            // Append buttons to the button container
            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(updateButton);
            buttonContainer.appendChild(moveButton);

            itemRow.appendChild(itemImage);
            itemRow.appendChild(itemDetails);
            itemRow.appendChild(buttonContainer);

            itemList.appendChild(itemRow);
        });
    }


    // Function to toggle the status of an item (purchased or still active)
    function toggleItemStatus(item) {
        item.active = !item.active;
        toggleItems(document.querySelector(".active-button.active").getAttribute("data-active") === "true", false); // Refresh the list after moving an item
    }

    // Function to update the label of the move button based on the item's status
    function updateMoveButtonLabel(button, isActive) {
        if (isActive) {
            button.innerText = "Mark Purchased";
        } else {
            button.innerText = "Mark Active";
        }
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
    document.getElementById("addItemForm").addEventListener("submit", function(event) {
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

        //item.name, item.link, item.price, item.dateAdded, item.active, item.savedAmount
        const result = await eel.remove_item_from_db(item)();
        if (result) {
            alert("Item deleted from the database.");
        } else {
            alert("Failed to save item to the database.");
        }
    }



    async function addItemToDB(item) {

        const result = await eel.save_item_to_db(item)();
        if (result) {
            alert("Item saved to the database.");
        } else {
            alert("Failed to save item to the database.");
        }
    }

    async function loadItemsFromDB() {
        resp = await eel.load_items_from_db()();
        for(i = 0; i < resp.length; i++)
        {
            items.push(resp[i]);
        }
        // Initial call to populate the list
        toggleItems(true, false);
    }

    loadItemsFromDB()
});


