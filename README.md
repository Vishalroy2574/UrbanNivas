UrbanNivas– Rental Listing Platform 

🚀 A feature-rich full-stack web application inspired by Airbnb, developed using MongoDB, Express.js, and Node.js — providing seamless listing, reviewing, and user authentication functionalities.

🌐 Project Overview

WanderLust enables users to explore and create property listings, add reviews, and manage their accounts through secure authentication. It integrates modern tools for media uploads, location mapping, and session management — delivering a smooth user experience throughout the platform.

🔗 Live Demo: (Project URL)
🔗 GitHub Repo: (Your Repo URL)

🛠️ Tech Stack & Dependencies
Backend & Core

Node.js

Express.js

MongoDB

Mongoose (MongoDB Object Modeling)

Authentication & Security

Passport.js

Passport Local

Passport Local Mongoose

Express-Session

Connect-Mongo (Session Storage)

BCrypt / built-in Password Hashing

Cookie-Parser


Dotenv (Environment Variables)

Media & UI

EJS (Templating Engine)

Cloudinary (Image Storage)

Multer (File Uploads)

Mapping & Utilities

Leaflet

Connect-Flash (Flash Messages)

🌟 Key Features

✔ User Authentication

Signup, Login & Logout

Secure Password Hashing

Individual User Profile Page

✔ Listings Management

Create new property listings

Edit or Delete your listings

Upload images to Cloudinary

✔ Review System

Add and delete reviews on listings

✔ Account Management

Update Profile & Change Password

✔ Interactive Maps

Leaflet integration to visualize listing location

✔ Enhanced Security & UX


Flash messaging system for better communication

🚧 Challenges & Solutions
Challenge	Solution
Handling user data securely	Adopted secure hashing & session-based authentication
Managing media uploads & storage	Integrated Cloudinary + Multer for optimized delivery
Implementing scalable backend architecture	Designed a REST-structured server ensuring smooth scalability
📸 Screenshots

📍 Add screenshots of the UI here once ready

🚀 How to Run Locally
# Clone the repository
git clone <your-repo-link>

# Navigate into the project
cd UrbanNivas

# Install dependencies
npm install


# Add your .env file with:
# CLOUDINARY credentials
# SESSION_SECRET
# MONGO_URL

# Start server
npm start


Server runs at:
urbannivas-8.onrender.com/

🎯 Future Enhancements

Wishlist / Favorites Feature

Booking & Payment Integration

Advanced Search & Filters

User-to-User Messaging

🤝 Acknowledgements

Special thanks to Shradha Khapra and Aman Dhattarwal of Apna College for their guidance, mentorship, and motivational support throughout this project. 🙌

🙌 Feedback & Support

If you have any suggestions or questions, feel free to share your thoughts. Looking forward to improvements and collaboration with the tech community!

🏷️ Tags

#FullStackDevelopment #WebDevelopment #WanderLust #Coding #TechCommunity #ApnaCollege

If you want, I can also:
✨ Add screenshots section placeholders professionally
📌 Add badges (stars, forks, tech stack icons)
🧩 Provide a folder structure section
🛡️ Add detailed API documentation
🎨 Improve formatting with emojis & visuals


🌍 UrbanNivas

UrbanNivas is a full-stack web application inspired by Airbnb where users can browse listings, create their own stays, and leave reviews. It is built using the MongoDB, Express.js, Node.js (MEN stack) with secure authentication, media uploads, and interactive maps.

📌 About the Project

The goal of this project is to practice and implement real-world features found in booking platforms. From user management to image handling and location visualization, every part of this app helped me grow my full-stack development skills.

This project includes:

User login, logout, and profile handling

Full CRUD operations for listings

Review system with proper validation

Secure password hashing and session storage

Cloud image uploads and Mapbox maps integration

🛠️ Tech Stack & Libraries

Core

Node.js

Express.js

MongoDB

Mongoose

Authentication & Security

Passport.js

Passport-Local / Passport-Local-Mongoose

Express-Session

Connect-Mongo

Cookie-Parser

Dotenv

Media, UI & Utilities

EJS (templating)

Cloudinary (image storage)

Multer (file upload)

Connect-Flash (flash messages)

Leaflet

🌟 Features

🔑 User Authentication with hashed passwords

🏡 Add, edit, and delete listings

🖼️ Upload listing images to Cloudinary

⭐ Add and delete reviews

👤 Update profile info and password

🗺️ Leaflet for viewing listing locations

✨ Flash message support for a better user experience

🔧 Setup Instructions

Clone the project:

git clone <your-repo-url>
cd UrbanNivas


Install required packages:

npm install


Create a .env file with the following keys:

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
MAPBOX_TOKEN=
MONGO_URL=
SESSION_SECRET=


Start the server:

npm start


Now open your browser and navigate to:
👉 urbannivas-8.onrender.com/

📸 Screenshots

<img width="1868" height="862" alt="Screenshot (25)" src="https://github.com/user-attachments/assets/01eeda81-e93e-4f84-8af9-685c1e9255fd" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0737073a-e2ec-4192-9107-b78c29d3ff41" />
<img width="1790" height="879" alt="Screenshot (27)" src="https://github.com/user-attachments/assets/b8c8f11f-946b-4495-ba86-a01b8ae7c585" />
<img width="1892" height="873" alt="Screenshot (28)" src="https://github.com/user-attachments/assets/fd244169-e6dd-4278-8255-9416e9800096" />




🚧 Challenges

During development, I faced challenges with authentication flow, data handling, and routing, especially while combining features like image uploads and sessions. Slowly, after debugging and restructuring the backend logic, everything came together smoothly.

📝 Future Enhancements

Search and filtering options

Wishlists / Favorites

Booking system + Payments

User messaging feature
