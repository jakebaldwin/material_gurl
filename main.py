from flask import Flask, render_template, request, jsonify, send_from_directory
from fpdf import FPDF
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
        active BOOLEAN,
        category TEXT
        );
        """
        # Execute the SQL command to create the table
        cursor.execute(create_table_sql)

        # Define your SQL INSERT query here
        insert_query = """
            INSERT OR REPLACE INTO items (name, link, image, price, dateAdded, savedAmount, active, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        # Define the values as a tuple
        values = (
            item['name'],
            item['link'],
            item['image'],
            item['price'],
            item['dateAdded'],
            item['savedAmount'],
            item['active'],
            item['category']
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
                'active': (item[6] == 1),
                'category': item[7]
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

@app.route('/getcategories', methods=['GET'])
def getcategorys():
    try:
        conn = sqlite3.connect('./material_db.db')
        cursor = conn.cursor()
        # Define your SQL SELECT query here
        query = "SELECT DISTINCT category FROM items"
        cursor.execute(query)
        items = cursor.fetchall()

        return jsonify(items)
    except Exception as e:
        print(f"Error loading items: {e}")
        return jsonify(items=[])

def create_pdf(items):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    current_category = None
    items.sort(key=lambda x: x['category'])  # Sort items by category

    for item in items:
        if item['category'] != current_category:
            if current_category is not None:
                pdf.add_page()  # Add a new page for each category
            current_category = item['category']
            pdf.set_font("Arial", 'B', size=16)
            pdf.cell(200, 10, txt=f"Category: {current_category}", ln=True)
            pdf.set_font("Arial", size=12)

        pdf.cell(200, 10, txt=f"Name: {item['name']}", ln=True)
        pdf.cell(200, 10, txt=f"Link: {item['link']}", ln=True)
        pdf.cell(200, 10, txt=f"Image: {item['image']}", ln=True)
        pdf.cell(200, 10, txt=f"Price: {item['price']}", ln=True)
        pdf.cell(200, 10, txt=f"Date Added: {item['dateAdded']}", ln=True)
        pdf.cell(200, 10, txt=f"Saved Amount: {item['savedAmount']}", ln=True)
        pdf.ln(10)  # Add some space between items

    pdf_file = "items.pdf"
    pdf.output(pdf_file)
    return pdf_file

@app.route('/exportWants', methods=['GET'])
def export_wants():
    conn = sqlite3.connect('material_db.db')  # Replace with your database file path
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM items')
    items = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()

    pdf_file = create_pdf(items)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(port=3000, debug=True)
