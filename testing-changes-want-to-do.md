General Navigation (Guest)

Home page: Displays clear calls to action (“I Want to Buy”, “I Want to Sell”) and a button to browse properties without signup. Buttons work and lead to the search page.

Property search: Filters for price per sq. ft., city, property type, bedrooms and total price worked; results update accordingly. Sorting options (“Newest First”, price ascending/descending) function correctly
houlnd-realty-mvp.vercel.app
.

Property details: Clicking a card opens a detailed page with large images, price/area stats, description and masked seller contact info. As a guest, clicking “View Seller Contact (FREE)” redirects to the login page, which is expected.

Footers: The Contact link works and displays email, phone number, business inquiries contact and head‑office address. However the About, Terms and Privacy links all return 404 pages, so those legal/informational pages are missing.

Customer Role

Login: Using customer@test.com / Customer123! successfully logs in.

Dashboard: Shows quick search fields and cards for saved properties, unlocked contacts and upcoming visits.

Saving properties: Clicking the heart icon on a property page turns it red, but the saved count in the dashboard does not increase and the Saved Properties page remains empty
houlnd-realty-mvp.vercel.app
. Saving from search results doesn’t work either.

Unlocking contacts: Attempting to reveal a seller’s contact as a logged‑in customer triggers a backend error (null value in column "id" of relation "unlocks" violates not‑null constraint)
houlnd-realty-mvp.vercel.app
, so contact unlocking is broken.

Appointments page: Shows Upcoming/Past tabs and a message that no appointments are scheduled
houlnd-realty-mvp.vercel.app
. Navigation to a property from there works.

Logout: The Logout link in the header does not log the user out; the page remains on the dashboard. To switch roles, I had to manually open the home page or clear the session.

Promoter Role

Login: promoter@test.com / Promoter123! logs in successfully.

Dashboard: Displays cards for total listings, pending verification, live listings, total unlocks and upcoming visits. All values remain at zero despite there being listings, indicating the metrics are static.

Property posting wizard: Multi‑step wizard (Basic Details, Location, Property Details, Amenities, Photos). Steps 1‑4 accept input; however Step 5 requires at least three images and the Next button stays disabled without them
houlnd-realty-mvp.vercel.app
. There is no way to skip the image upload, which blocks testing end‑to‑end property creation.

My Listings: Shows several sample listings with stats and a View Details button that opens the public property view with share and heart icons. There is no edit or delete option for promoters to manage their listings. The share icon only copies the link
houlnd-realty-mvp.vercel.app
.

Appointment Requests: The promoter appointments page shows “No Appointments Yet” with a link to view listings
houlnd-realty-mvp.vercel.app
. There is no way to manage or accept appointments.

Logout: As with the customer, the promoter’s Logout link does not end the session.

Admin Role

Login: Admin credentials (admin@test.com / Admin123!) log in via the buyer login form. The Admin Dashboard loads automatically.

Dashboard: Displays platform metrics (users, customers, promoters, earnings, pending review listings, live listings and total unlocks) but all counters remain at zero. Buttons lead to relevant pages.

Pending Listings: Shows an empty state (“All caught up!”) when there are no listings pending review.

Listings page: Clicking Listings in the nav redirects to the login page, effectively logging the admin out. The admin cannot view or manage existing listings—this is a critical bug.

User Management: Lists all users (customer, promoter, admin) with name, email, phone, role and join date; you can open a modal with user details. There is no ability to edit or deactivate users
houlnd-realty-mvp.vercel.app
.

Logout: The Logout button is present but does nothing; the admin remains logged in.


Broken Save/Bookmark function – saved properties don’t persist or update.

Logout doesn’t work for any role; manual navigation is required to exit.

Admin Listings page breaks the session by redirecting to login; admin can’t review listings.

Promoter management features missing: cannot edit or delete own listings; dashboard metrics inaccurate.

No editing of user accounts in admin panel; only viewing details is possible.