from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('base.html')

@app.route('/save_item_to_db', methods=['POST'])
def save_item_to_db():
    try:
        conn = sqlite3.connect('./material_db.db')
        cursor = conn.cursor()
        item = request.get_json()
        # Define the SQL command to create the table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS items (
        name TEXT PRIMARY KEY,
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
            INSERT OR REPLACE INTO items (name, link, image, price, dateAdded, savedAmount, active)
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
        return jsonify(success=True)
    except Exception as e:
        print(f"Error saving item: {e}")
        return jsonify(success=False)

@app.route('/load_items_from_db', methods=['GET'])
def load_items_from_db():
    try:
        conn = sqlite3.connect('./material_db.db')
        cursor = conn.cursor()
        # Define your SQL SELECT query here
        query = "SELECT * FROM items"
        cursor.execute(query)
        items = cursor.fetchall()
        toReturn = []
        for item in items:
            t = {
                'name': item[0],
                'link': item[1],
                'image': item[2],
                'price': item[3],
                'dateAdded': item[4],
                'savedAmount': item[5],
                'active': (item[6] == 1)
            }
            toReturn.append(t)
        return jsonify(items=toReturn)
    except Exception as e:
        print(f"Error loading items: {e}")
        return jsonify(items=[])

@app.route('/remove_item_from_db', methods=['POST'])
def remove_item_from_db():
    try:
        conn = sqlite3.connect('./material_db.db')
        cursor = conn.cursor()
        item = request.get_json()
        # Define SQL command to delete the item based on matching name and price
        delete_query = "DELETE FROM items WHERE name = ? AND price = ?"

        # Extract the name and price from the item dictionary
        item_name = item['name']
        item_price = item['price']

        # Execute the SQL command
        cursor.execute(delete_query, (item_name, item_price))

        # Commit the transaction
        conn.commit()

        return jsonify(success=True)  # Success
    except Exception as e:
        print(f"Error removing item: {e}")
        return jsonify(success=False)  # Error occurred

if __name__ == '__main__':
    app.run(port=3000)
