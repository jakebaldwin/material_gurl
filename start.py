import eel, ctypes, sqlite3

eel.init('gui/')

conn = sqlite3.connect('./material_db.db')
cursor = conn.cursor()

@eel.expose
def save_item_to_db(item):
    # item.name, item.link, item.price, item.dateAdded, item.active, item.savedAmount
    try:
        # Define the SQL command to create the table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        link TEXT,
        image TEXT,
        price REAL,
        dateAdded DATE,
        savedAmount REAL,
        active BOOLEAN
        );
        """

        # Execute the SQL command to create the table
        cursor.execute(create_table_sql)


        # Define your SQL INSERT query here
        insert_query = """
        INSERT INTO items (name, link, image, price, dateAdded, savedAmount, active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        # Define the values as a tuple
        values = (
            item['name'],
            item['link'],
            item['image'],
            item['price'],
            item['dateAdded'],
            item['savedAmount'],
            item['active']
        )

        # Execute the SQL command with the parameterized query
        cursor.execute(insert_query, values)
        conn.commit()
        return True
    except Exception as e:
        print(f"Error saving item: {e}")
        return False

@eel.expose
def load_items_from_db():
    try:
        # Define your SQL SELECT query here
        query = "SELECT * FROM items"
        cursor.execute(query)
        items = cursor.fetchall()
        toReturn = []
        for item in items:
            t = {}
            
            t['name'] = item[1]
            t['link'] = item[2]
            t['image'] = item[3]
            t['price'] = item[4]
            t['dateAdded'] = item[5]
            t['savedAmount'] = item[6]
            t['active'] = (item[7] == 1)
            
            toReturn.append(t)
        return toReturn
    except Exception as e:
        print(f"Error loading items: {e}")
        return []

@eel.expose
def remove_item_from_db(item):
    try:
        # Create a cursor
        cursor = conn.cursor()
        
        # Define SQL command to delete the item based on matching name and price
        delete_query = "DELETE FROM items WHERE name = ? AND price = ?"
        
        # Extract the name and price from the item dictionary
        item_name = item['name']
        item_price = item['price']
        
        # Execute the SQL command
        cursor.execute(delete_query, (item_name, item_price))
        
        # Commit the transaction
        conn.commit()
        
        return True  # Success

    except Exception as e:
        print(f"Error removing item: {e}")
        return False  # Error occurred


# Start the index.html file
eel.start('src/base.html',
    jinja_templates='src')

