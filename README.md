# 🏠 Voice-Driven Property Listing Tool

A real-time, voice-enabled property listing web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It empowers real estate agents or admins to create structured property listings through **natural speech input**, enhancing speed and usability in listing workflows.

---

## ✨ Features

- 🎙️ **Voice Input with Web Speech API** – Fill out property forms using natural voice commands.
- 🧠 **Speech-to-Data Transformation** – Automatically extracts, validates, and maps spoken words to structured fields (e.g., price, area, location).
- 🖥️ **Responsive Frontend** – Built with React.js and Tailwind CSS for a seamless, mobile-friendly experience.
- 🔒 **Secure APIs** – Backend routes protected with validation, error handling, and best practices.
- 🔁 **Full CRUD Support** – Add, update, delete, and view property listings.
- 📦 **MongoDB Integration** – Stores property details in a scalable NoSQL database.

---

## 🧰 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React.js, Tailwind CSS         |
| Voice Input  | Web Speech API                 |
| Backend      | Node.js, Express.js            |
| Database     | MongoDB                        |
| State Mgmt   | React Hooks (useState, useEffect) |

---

## 🛠️ Installation & Setup

# Clone the repository
git clone https://github.com/your-username/voice-driven-property-listing.git
cd voice-driven-property-listing

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Add your MongoDB URI to a .env file in /server
touch .env
# Example
MONGO_URI=mongodb+srv://your-db-url

# Run the development servers

-- cd ../client && npm start  
-- cd ../server && npm run dev     


🧠 How It Works --- 

	1. The user clicks a mic button on the property form.
 
	2. The Web Speech API captures natural language speech.
 
	3. Captured text is parsed and mapped to form fields
           (e.g., “Price 50 lakhs” → price: 5000000).
	   
	4. User reviews the auto-filled form, makes edits, and submits.
 
	5. Backend validates and stores the data in MongoDB.
 
	6. All listings are displayed in a searchable, responsive UI.
