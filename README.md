# 🌍 UrbanNivas - Rental Listing Platform

What started as a learning project turned into a fully functional Airbnb-like platform. Built with Node.js, Express, MongoDB, and a bunch of other cool libraries, UrbanNivas lets you browse rental properties, list your own place, make bookings, and read what other people think about listings.

**🔗 Check it out live:** [urbannivas-8.onrender.com](https://urbannivas-8.onrender.com/)

---

## 📌 What's This Project About?

I built UrbanNivas to get hands-on experience with full-stack development. It's basically a rental platform where you can:
- Browse through all available listings
- Create and manage your own property listings
- Upload nice photos of your properties (stored on Cloudinary)
- Leave reviews for places you've visited
- Book properties and keep track of your bookings
- Different user roles - you can be a regular user, property owner, or admin

It was a fun challenge combining everything I learned - authentication, databases, file uploads, real-time features, and actually making it look decent on the frontend.

---

## 🛠️ What I Used

**Backend stuff:**
- Node.js with Express for the server
- MongoDB for the database (Mongoose to keep things organized)

**Getting Users Logged In:**
- Passport for authentication (the local strategy)
- Password hashing so passwords are actually secure
- Session management to keep users logged in

**Handling Images & Content:**
- EJS for rendering templates on the server
- Cloudinary for storing images (way better than storing files locally)
- Multer to handle file uploads

**Other libraries that made life easier:**
- Connect-Flash for those success/error messages
- Axios for making HTTP requests
- Leaflet for showing property locations on maps
- Method-Override to do PUT/DELETE requests from forms

---

## 🌟 What Can You Do?

**User Signup & Login** - Pretty standard stuff. You create an account with a username and password. Passwords are hashed so I can't see them even if I wanted to. You stay logged in through sessions.

**Create Your Own Listings** - If you own a property or want to rent out a place, you can add it with a description, price, location, and upload photos. Edit or delete whenever you want.

**Review System** - After booking or visiting a place, leave a review. See what others thought about listings too. It helps people make decisions.

**Make Bookings** - Browse listings and book properties you're interested in. Keep track of all your bookings in one place.

**User Profiles** - Update your info, change your password, upload a profile picture.

**Admin Dashboard** - If you're an admin, you can manage all users and change their roles (regular user, owner, admin).

**Map Integration** - See property locations on an interactive map using Leaflet. Helps you get a sense of where the place actually is.

---

## 📁 Folder Structure

```
UrbanNivas/
├── app.js                 # Main server file
├── package.json          # Dependencies list
├── models/               # Database schemas
│   ├── user.js
│   ├── listing.js
│   ├── review.js
│   └── booking.js
├── routes/               # API endpoints
│   ├── user.js           # Auth routes
│   ├── listing.js        # Listing routes
│   ├── review.js         # Review routes
│   ├── bookings.js       # Booking routes
│   └── admin.js          # Admin routes
├── controllers/          # Business logic for each route
│   ├── listings.js
│   ├── reviews.js
│   └── bookings.js
├── views/                # EJS templates
│   ├── layouts/
│   ├── listings/
│   ├── users/
│   ├── bookings/
│   ├── admin/
│   └── includes/
├── utils/                # Helper functions
│   ├── middleware.js     # Custom middleware
│   └── geocode.js
├── public/               # CSS, images, uploads
│   ├── css/
│   └── uploads/
└── init/                 # Database setup scripts
```

---

## 🚀 How to Get It Running

**What You Need:**
- Node.js installed
- MongoDB (either local or Atlas cloud)
- A Cloudinary account (it's free and easy to set up)

**Steps:**

1. Clone the repo
```bash
git clone https://github.com/Vishalroy2574/UrbanNivas.git
cd UrbanNivas
```

2. Install everything
```bash
npm install
```

3. Create a `.env` file in the root folder with:
```env
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/UrbanNivas
SESSION_SECRET=pick_something_random_here
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_key
CLOUD_API_SECRET=your_secret
PORT=8080
NODE_ENV=development
```

4. Start it up
```bash
npm run dev
```

5. Open your browser and go to `http://localhost:8080`

---

## 📖 API Routes (If You Want to Extend It)

**User stuff:**
- `GET /signup` - signup page
- `POST /signup` - create account
- `GET /login` - login page
- `POST /login` - log in
- `GET /logout` - log out

**Listings:**
- `GET /listings` - see all listings
- `GET /listings/new` - form to create a listing
- `POST /listings` - actually create it
- `GET /listings/:id` - see details
- `GET /listings/:id/edit` - edit form
- `PUT /listings/:id` - save changes
- `DELETE /listings/:id` - delete it

**Reviews:**
- `POST /listings/:id/reviews` - add a review
- `DELETE /listings/:id/reviews/:reviewId` - delete review

**Bookings:**
- `POST /listings/:id/book` - make a booking
- `GET /bookings/mine` - see your bookings

**Admin:**
- `GET /admin/users` - manage users
- `POST /admin/users/:id/role` - change user role

---

## 🚧 Stuff I Figured Out While Building This

**Keeping user data secure** - Had to implement proper password hashing and not store passwords in plain text. Passport.js handles a lot of this automatically which is nice.

**File uploads to the cloud** - Storing images locally is a pain, so I integrated Cloudinary. Combined with Multer, it works pretty smoothly now.

**Session persistence** - Sessions can be tricky, especially when the server restarts. Had to make sure MongoDB stores sessions properly.

**Scalable backend** - Separated routes, controllers, and models so the code doesn't get messy as it grows.

**Showing map locations** - Leaflet was perfect for this. Way lighter than Google Maps and gets the job done.

**Different user permissions** - Built middleware to check if a user is logged in, is an admin, or owns a listing before letting them do certain things.

---

## 📸 Screenshots

<img width="1896" height="877" alt="Screenshot (26)" src="https://github.com/user-attachments/assets/50f55c1b-cdf7-494a-b765-fa4318819a7b" />
<img width="1868" height="862" alt="Screenshot (25)" src="https://github.com/user-attachments/assets/5f1c7fc8-e823-4d6c-9090-0bf35abf5caa" />
<img width="1790" height="879" alt="Screenshot (27)" src="https://github.com/user-attachments/assets/ea2ddc42-3fd1-4f79-81d1-5f31fdd5f886" />
<img width="1892" height="873" alt="Screenshot (28)" src="https://github.com/user-attachments/assets/ee9f92ed-20f5-4025-ac6d-8ec07438b8bf" />


---

## 🎯 What's Next?

I'm thinking about adding:
- Wishlist feature (save listings you like)
- Payment integration (Stripe or Razorpay)
- Better search and filters
- Messaging between users
- Email notifications
- A calendar for bookings

Some of these are pretty ambitious, but they'd be cool to work on.

---

## 🤝 Want to Help?

If you find a bug or have ideas, feel free to fork it and submit a pull request. Here's how:

1. Fork the repo
2. Create a branch for your feature (`git checkout -b feature/cool-thing`)
3. Make your changes and commit (`git commit -m 'Added cool thing'`)
4. Push it up (`git push origin feature/cool-thing`)
5. Open a pull request

---

## 📝 License

ISC License - basically do what you want with it.

---

## 🙏 Shoutouts

Big thanks to:
- Shradha Khapra and Aman Dhattarwal for the guidance and making me believe I could actually build something decent
- Apna College for the resources and community
- Everyone in the tech community sharing their knowledge for free

---

## 💬 Got Questions?

Hit me up on GitHub or drop me an email. Always happy to chat about code or answer questions.

---

**(https://github.com/Vishalroy2574)**

#FullStackDeveloper #WebDevelopment #UrbanNivas #NodeJS #MongoDB #Express
